import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import {
  initialGallery,
  initialServices,
  initialShopConfig,
} from "../data/initialData";
import type {
  Appointment,
  AuthResponse,
  Customer,
  GalleryItem,
  ServiceItem,
  ShopConfig,
} from "../types";
import {
  type AppointmentFilters,
  filterAppointments,
} from "./appointmentFilters";
import { db } from "./firebase";

const STORAGE_KEYS = {
  CONFIG: "barber_shop_config",
  SERVICES: "barber_services",
  GALLERY: "barber_gallery",
  APPOINTMENTS: "barber_appointments",
  CUSTOMER: "barber_customer_data",
  TOKEN: "barber_token",
  USER: "barber_user_data",
};

const appointmentsCollection = collection(db, "appointments");
const slotReference = (date: string, time: string) =>
  doc(db, "appointmentSlots", `${date}_${time}`);

const snapshotToAppointments = (
  snapshot: Awaited<ReturnType<typeof getDocs>>,
): Appointment[] =>
  snapshot.docs.map(
    (item) => ({ id: item.id, ...(item.data() as object) }) as Appointment,
  );

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("LocalStorage error:", e);
  }
}

export const localStore = {
  getShopConfig: (): ShopConfig => {
    return getItem<ShopConfig>(STORAGE_KEYS.CONFIG, initialShopConfig);
  },

  updateShopConfig: (config: Partial<ShopConfig>): ShopConfig => {
    const current = getItem<ShopConfig>(STORAGE_KEYS.CONFIG, initialShopConfig);
    const updated = { ...current, ...config };
    setItem(STORAGE_KEYS.CONFIG, updated);
    return updated;
  },

  getServices: (): ServiceItem[] => {
    return getItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, initialServices);
  },

  createService: (service: Partial<ServiceItem>): ServiceItem => {
    const services = getItem<ServiceItem[]>(
      STORAGE_KEYS.SERVICES,
      initialServices,
    );
    const newService: ServiceItem = {
      id: "srv-" + Date.now(),
      name: service.name || "Novo Serviço",
      description: service.description || "",
      price: service.price ?? 0,
      priceType: service.priceType || "fixed",
      durationMinutes: service.durationMinutes || 30,
      category: service.category || "corte",
      active: true,
    };
    const updated = [newService, ...services];
    setItem(STORAGE_KEYS.SERVICES, updated);
    return newService;
  },

  updateService: (id: string, service: Partial<ServiceItem>): ServiceItem => {
    const services = getItem<ServiceItem[]>(
      STORAGE_KEYS.SERVICES,
      initialServices,
    );
    let updatedService: ServiceItem | null = null;
    const updated = services.map((s) => {
      if (s.id === id) {
        updatedService = { ...s, ...service };
        return updatedService;
      }
      return s;
    });
    setItem(STORAGE_KEYS.SERVICES, updated);
    if (!updatedService) throw new Error("Serviço não encontrado");
    return updatedService;
  },

  deleteService: (id: string): { success: boolean } => {
    const services = getItem<ServiceItem[]>(
      STORAGE_KEYS.SERVICES,
      initialServices,
    );
    const updated = services.filter((s) => s.id !== id);
    setItem(STORAGE_KEYS.SERVICES, updated);
    return { success: true };
  },

  getGallery: (): GalleryItem[] => {
    return getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, initialGallery);
  },

  addGalleryItem: (item: Partial<GalleryItem>): GalleryItem => {
    const gallery = getItem<GalleryItem[]>(
      STORAGE_KEYS.GALLERY,
      initialGallery,
    );
    const newItem: GalleryItem = {
      id: "gal-" + Date.now(),
      title: item.title || "Foto",
      type: item.type || "image",
      url: item.url || "",
      isFeaturedHero: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...gallery];
    setItem(STORAGE_KEYS.GALLERY, updated);
    return newItem;
  },

  setFeaturedVideo: (
    id: string,
  ): { success: boolean; shopConfig: ShopConfig } => {
    const gallery = getItem<GalleryItem[]>(
      STORAGE_KEYS.GALLERY,
      initialGallery,
    );
    const item = gallery.find((g) => g.id === id);
    const config = getItem<ShopConfig>(STORAGE_KEYS.CONFIG, initialShopConfig);
    if (item && item.url) {
      config.heroVideoUrl = item.url;
      setItem(STORAGE_KEYS.CONFIG, config);
    }
    return { success: true, shopConfig: config };
  },

  deleteGalleryItem: (id: string): { success: boolean } => {
    const gallery = getItem<GalleryItem[]>(
      STORAGE_KEYS.GALLERY,
      initialGallery,
    );
    const updated = gallery.filter((g) => g.id !== id);
    setItem(STORAGE_KEYS.GALLERY, updated);
    return { success: true };
  },

  identifyCustomer: (fullName: string, phone: string): Customer => {
    const customer: Customer = {
      id: "cust-" + Date.now(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.CUSTOMER, customer);
    return customer;
  },

  getAvailableSlots: async (
    date: string,
    _durationMinutes: number,
  ): Promise<{ availableSlots: string[]; reason?: string }> => {
    const allSlots = [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
    ];

    const appointments = await localStore.getAppointments({ date });
    const bookedTimes = appointments
      .filter((a) => a.date === date && a.status !== "cancelled")
      .map((a) => a.time);

    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot),
    );
    return { availableSlots };
  },

  createAppointment: (appointmentData: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    date: string;
    time: string;
    serviceIds: string[];
    notes?: string;
  }): Promise<Appointment> =>
    (async () => {
      const services = getItem<ServiceItem[]>(
        STORAGE_KEYS.SERVICES,
        initialServices,
      );
      const selectedServices = services.filter((s) =>
        appointmentData.serviceIds.includes(s.id),
      );
      const serviceNames = selectedServices.map((s) => s.name);
      const totalPriceSum = selectedServices.reduce(
        (sum, s) => sum + (s.price || 0),
        0,
      );
      const totalDuration = selectedServices.reduce(
        (sum, s) => sum + s.durationMinutes,
        0,
      );

      const newAppointment: Omit<Appointment, "id"> = {
        customerId: appointmentData.customerId || "cust-" + Date.now(),
        customerName: appointmentData.customerName,
        customerPhone: appointmentData.customerPhone,
        date: appointmentData.date,
        time: appointmentData.time,
        serviceIds: appointmentData.serviceIds,
        serviceNames,
        totalPrice: totalPriceSum,
        priceDisplay: `R$ ${totalPriceSum.toFixed(2).replace(".", ",")}`,
        totalDurationMinutes: totalDuration,
        status: "pending",
        notes: appointmentData.notes || "",
        createdAt: new Date().toISOString(),
      };

      const appointmentRef = doc(appointmentsCollection);

      // The transaction makes the final availability check in Firestore, so two
      // devices cannot reserve the same date and time at the same moment.
      await runTransaction(db, async (transaction) => {
        const slotRef = slotReference(
          appointmentData.date,
          appointmentData.time,
        );
        const slot = await transaction.get(slotRef);
        if (slot.exists())
          throw new Error(
            "Este horário acabou de ser reservado. Escolha outro horário.",
          );
        transaction.set(appointmentRef, newAppointment);
        transaction.set(slotRef, {
          appointmentId: appointmentRef.id,
          date: appointmentData.date,
          time: appointmentData.time,
        });
      });

      return { id: appointmentRef.id, ...newAppointment };
    })(),

  getAppointments: async (
    filters: AppointmentFilters = {},
  ): Promise<Appointment[]> => {
    const snapshot = await getDocs(appointmentsCollection);
    return filterAppointments(snapshotToAppointments(snapshot), filters);
  },

  subscribeAppointments: (
    filters: AppointmentFilters,
    callback: (appointments: Appointment[]) => void,
    onError?: (error: Error) => void,
  ) =>
    onSnapshot(
      appointmentsCollection,
      (snapshot) =>
        callback(filterAppointments(snapshotToAppointments(snapshot), filters)),
      (error) => onError?.(error),
    ),

  updateAppointmentStatus: (
    id: string,
    status: "pending" | "completed" | "cancelled",
  ): Promise<void> =>
    runTransaction(db, async (transaction) => {
      const appointmentRef = doc(db, "appointments", id);
      const appointment = await transaction.get(appointmentRef);
      if (!appointment.exists()) throw new Error("Agendamento não encontrado.");
      transaction.update(appointmentRef, { status });
      if (status === "cancelled") {
        const { date, time } = appointment.data();
        transaction.delete(slotReference(date, time));
      }
    }),

  cancelAppointmentByCustomer: async (
    id: string,
    customerPhone: string,
  ): Promise<void> => {
    await runTransaction(db, async (transaction) => {
      const appointmentRef = doc(db, "appointments", id);
      const appointment = await transaction.get(appointmentRef);
      if (
        !appointment.exists() ||
        appointment.data().customerPhone !== customerPhone
      ) {
        throw new Error("Agendamento não encontrado.");
      }
      transaction.update(appointmentRef, { status: "cancelled" });
      const { date, time } = appointment.data();
      transaction.delete(slotReference(date, time));
    });
  },

  rescheduleAppointmentByCustomer: (
    id: string,
    data: {
      date: string;
      time: string;
      serviceIds?: string[];
      notes?: string;
      customerPhone: string;
    },
  ): Promise<Appointment> =>
    (async () => {
      const services = getItem<ServiceItem[]>(
        STORAGE_KEYS.SERVICES,
        initialServices,
      );
      const appointmentRef = doc(db, "appointments", id);
      let updatedAppointment: Appointment | null = null;

      await runTransaction(db, async (transaction) => {
        const current = await transaction.get(appointmentRef);
        if (
          !current.exists() ||
          current.data().customerPhone !== data.customerPhone
        ) {
          throw new Error("Agendamento não encontrado.");
        }
        const existing = { id: current.id, ...current.data() } as Appointment;
        const serviceIds = data.serviceIds || existing.serviceIds;
        const selectedServices = services.filter((s) =>
          serviceIds.includes(s.id),
        );
        const totalPrice =
          selectedServices.reduce((sum, s) => sum + (s.price || 0), 0) ||
          existing.totalPrice;
        const totalDuration =
          selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0) ||
          existing.totalDurationMinutes;
        const currentSlotRef = slotReference(existing.date, existing.time);
        const newSlotRef = slotReference(data.date, data.time);
        const newSlot = await transaction.get(newSlotRef);
        if (newSlot.exists() && newSlot.data().appointmentId !== id) {
          throw new Error(
            "Este horário acabou de ser reservado. Escolha outro horário.",
          );
        }
        const changes = {
          date: data.date,
          time: data.time,
          serviceIds,
          serviceNames: selectedServices.length
            ? selectedServices.map((s) => s.name)
            : existing.serviceNames,
          totalPrice,
          priceDisplay: `R$ ${(totalPrice || 0).toFixed(2).replace(".", ",")}`,
          totalDurationMinutes: totalDuration,
          notes: data.notes ?? existing.notes,
          status: "pending" as const,
        };
        transaction.update(appointmentRef, changes);
        if (currentSlotRef.path !== newSlotRef.path)
          transaction.delete(currentSlotRef);
        transaction.set(newSlotRef, {
          appointmentId: id,
          date: data.date,
          time: data.time,
        });
        updatedAppointment = { ...existing, ...changes };
      });
      return updatedAppointment!;
    })(),

  deleteAppointment: async (id: string): Promise<void> => {
    await runTransaction(db, async (transaction) => {
      const appointmentRef = doc(db, "appointments", id);
      const appointment = await transaction.get(appointmentRef);
      if (!appointment.exists()) return;
      const { date, time } = appointment.data();
      transaction.delete(appointmentRef);
      transaction.delete(slotReference(date, time));
    });
  },

  loginBarber: (email: string, _password?: string): AuthResponse => {
    const barberUser = {
      id: "barber-" + Date.now(),
      email,
      name: email.includes("@") ? email.split("@")[0] : "Barbeiro",
      phone: "(67) 99310-6619",
    };
    const token = "token-local-" + Date.now();
    setItem(STORAGE_KEYS.TOKEN, token);
    setItem(STORAGE_KEYS.USER, barberUser);
    return { token, user: barberUser };
  },

  registerBarber: (data: {
    email: string;
    phone: string;
    password?: string;
    name?: string;
  }): AuthResponse => {
    const barberUser = {
      id: "barber-" + Date.now(),
      email: data.email,
      name:
        data.name ||
        (data.email.includes("@") ? data.email.split("@")[0] : "Barbeiro"),
      phone: data.phone || "(67) 99310-6619",
    };
    const token = "token-local-" + Date.now();
    setItem(STORAGE_KEYS.TOKEN, token);
    setItem(STORAGE_KEYS.USER, barberUser);
    return { token, user: barberUser };
  },

  getMe: (): { user: any } => {
    const savedUser = getItem<any>(STORAGE_KEYS.USER, null);
    if (savedUser) {
      return { user: savedUser };
    }
    const defaultUser = {
      id: "barber-default",
      email: "barbeiro@brave.com",
      name: "Brave Barbeiro",
      phone: "(67) 99310-6619",
    };
    return { user: defaultUser };
  },
};
