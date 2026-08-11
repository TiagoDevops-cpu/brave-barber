import {
  ShopConfig,
  ServiceItem,
  GalleryItem,
  Appointment,
  Customer,
  AuthResponse,
} from '../types';

const STORAGE_KEYS = {
  CONFIG: 'barber_shop_config',
  SERVICES: 'barber_services',
  GALLERY: 'barber_gallery',
  APPOINTMENTS: 'barber_appointments',
  CUSTOMER: 'barber_customer_data',
  TOKEN: 'barber_token',
  USER: 'barber_user_data',
};

const DEFAULT_CONFIG: ShopConfig = {
  id: 'config-default',
  name: 'Brave',
  slogan: 'Cortes Modernos, Tradição e Excelência em Campo Grande - MS',
  address: 'R. Pontalina, 722 - Vila Santo Eugenio, Campo Grande - MS, 79063-561',
  phone: '(67) 9310-6619',
  whatsapp: '(67) 9310-6619',
  instagram: '@obryanbarbeiro_',
  openingHours: 'Terça a Sábado: 08:00 às 19:30',
  workingDays: [2, 3, 4, 5, 6],
  startHour: '08:00',
  endHour: '19:30',
  slotIntervalMinutes: 20,
  heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-barber-cutting-the-hair-of-a-man-40899-large.mp4',
  heroVideoTitle: 'Experiência Brave',
  heroVideoSubtitle: 'Confira a precisão e a atmosfera única da nossa barbearia',
  aboutText: 'A Brave é referência em estilo, cortes de precisão e barboterapia de alto nível em Campo Grande - MS.',
  googleCalendarConnected: true,
};

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 's1',
    name: 'Corte',
    description: 'Corte moderno ou clássico com tesoura e máquina, finalização com pomada.',
    price: 40,
    priceType: 'fixed',
    durationMinutes: 40,
    category: 'corte',
    active: true,
  },
  {
    id: 's2',
    name: 'Barba',
    description: 'Modelagem completa com toalha quente, navalha e pós-barba hidratante.',
    price: 40,
    priceType: 'fixed',
    durationMinutes: 30,
    category: 'barba',
    active: true,
  },
  {
    id: 's3',
    name: 'Pezinho cabelo/ barba',
    description: 'Acabamento e contorno preciso do pezinho do cabelo ou barba.',
    price: 15,
    priceType: 'fixed',
    durationMinutes: 20,
    category: 'corte',
    active: true,
  },
  {
    id: 's4',
    name: 'Limpeza de pele',
    description: 'Esfoliação, máscara facial e hidratação profunda contra oleosidade.',
    price: 55,
    priceType: 'fixed',
    durationMinutes: 40,
    category: 'outros',
    active: true,
  },
  {
    id: 's5',
    name: 'Sobrancelha',
    description: 'Design e alinhamento de sobrancelha com navalha/pinça.',
    price: 15,
    priceType: 'fixed',
    durationMinutes: 15,
    category: 'outros',
    active: true,
  },
  {
    id: 's6',
    name: 'Depilação nariz/ orelha',
    description: 'Remoção prática de pelos indesejados com cera morna hipoalergênica.',
    price: 20,
    priceType: 'fixed',
    durationMinutes: 15,
    category: 'outros',
    active: true,
  },
];

const DEFAULT_GALLERY: GalleryItem[] = [];

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}

export const api = {
  // Config
  getShopConfig: async (): Promise<ShopConfig> => {
    return getItem<ShopConfig>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  },

  updateShopConfig: async (config: Partial<ShopConfig>, _token?: string): Promise<ShopConfig> => {
    const current = getItem<ShopConfig>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    const updated = { ...current, ...config };
    setItem(STORAGE_KEYS.CONFIG, updated);
    return updated;
  },

  // Services
  getServices: async (): Promise<ServiceItem[]> => {
    return getItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
  },

  createService: async (service: Partial<ServiceItem>, _token?: string): Promise<ServiceItem> => {
    const services = getItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    const newService: ServiceItem = {
      id: 'srv-' + Date.now(),
      name: service.name || 'Novo Serviço',
      description: service.description || '',
      price: service.price ?? 0,
      priceType: service.priceType || 'fixed',
      durationMinutes: service.durationMinutes || 30,
      category: service.category || 'corte',
      active: true,
    };
    const updated = [newService, ...services];
    setItem(STORAGE_KEYS.SERVICES, updated);
    return newService;
  },

  updateService: async (id: string, service: Partial<ServiceItem>, _token?: string): Promise<ServiceItem> => {
    const services = getItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    let updatedService: ServiceItem | null = null;
    const updated = services.map((s) => {
      if (s.id === id) {
        updatedService = { ...s, ...service };
        return updatedService;
      }
      return s;
    });
    setItem(STORAGE_KEYS.SERVICES, updated);
    if (!updatedService) throw new Error('Serviço não encontrado');
    return updatedService;
  },

  deleteService: async (id: string, _token?: string): Promise<{ success: boolean }> => {
    const services = getItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    const updated = services.filter((s) => s.id !== id);
    setItem(STORAGE_KEYS.SERVICES, updated);
    return { success: true };
  },

  // Gallery
  getGallery: async (): Promise<GalleryItem[]> => {
    return getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
  },

  addGalleryItem: async (item: Partial<GalleryItem>, _token?: string): Promise<GalleryItem> => {
    const gallery = getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const newItem: GalleryItem = {
      id: 'gal-' + Date.now(),
      title: item.title || 'Foto',
      type: item.type || 'image',
      url: item.url || '',
      isFeaturedHero: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...gallery];
    setItem(STORAGE_KEYS.GALLERY, updated);
    return newItem;
  },

  setFeaturedVideo: async (id: string, _token?: string): Promise<{ success: boolean; shopConfig: ShopConfig }> => {
    const gallery = getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const item = gallery.find((g) => g.id === id);
    const config = getItem<ShopConfig>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    if (item && item.url) {
      config.heroVideoUrl = item.url;
      setItem(STORAGE_KEYS.CONFIG, config);
    }
    return { success: true, shopConfig: config };
  },

  deleteGalleryItem: async (id: string, _token?: string): Promise<{ success: boolean }> => {
    const gallery = getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const updated = gallery.filter((g) => g.id !== id);
    setItem(STORAGE_KEYS.GALLERY, updated);
    return { success: true };
  },

  // Customer Identification
  identifyCustomer: async (fullName: string, phone: string): Promise<Customer> => {
    const customer: Customer = {
      id: 'cust-' + Date.now(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.CUSTOMER, customer);
    return customer;
  },

  // Appointments
  getAvailableSlots: async (
    date: string,
    _durationMinutes: number
  ): Promise<{ availableSlots: string[]; reason?: string }> => {
    const allSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30',
    ];

    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const bookedTimes = appointments
      .filter((a) => a.date === date && a.status !== 'cancelled')
      .map((a) => a.time);

    const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));
    return { availableSlots };
  },

  createAppointment: async (appointmentData: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    date: string;
    time: string;
    serviceIds: string[];
    notes?: string;
  }): Promise<Appointment> => {
    const services = getItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    const selectedServices = services.filter((s) => appointmentData.serviceIds.includes(s.id));
    const serviceNames = selectedServices.map((s) => s.name);
    const totalPriceSum = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

    const newAppointment: Appointment = {
      id: 'app-' + Date.now(),
      customerId: appointmentData.customerId || 'cust-' + Date.now(),
      customerName: appointmentData.customerName,
      customerPhone: appointmentData.customerPhone,
      date: appointmentData.date,
      time: appointmentData.time,
      serviceIds: appointmentData.serviceIds,
      serviceNames,
      totalPrice: totalPriceSum,
      priceDisplay: `R$ ${totalPriceSum.toFixed(2).replace('.', ',')}`,
      totalDurationMinutes: totalDuration,
      status: 'pending',
      notes: appointmentData.notes || '',
      createdAt: new Date().toISOString(),
    };

    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    setItem(STORAGE_KEYS.APPOINTMENTS, [newAppointment, ...appointments]);
    return newAppointment;
  },

  getAppointments: async (
    filters: {
      date?: string;
      startDate?: string;
      endDate?: string;
      futureOnly?: string;
      status?: string;
      customerPhone?: string;
    } = {},
    _token?: string
  ): Promise<Appointment[]> => {
    let result = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);

    if (filters.date) {
      result = result.filter((a) => a.date === filters.date);
    } else {
      if (filters.startDate) {
        result = result.filter((a) => a.date >= filters.startDate!);
      }
      if (filters.endDate) {
        result = result.filter((a) => a.date <= filters.endDate!);
      }
      if (filters.futureOnly === 'true') {
        const today = new Date().toISOString().split('T')[0];
        result = result.filter((a) => a.date >= today);
      }
    }

    if (filters.status && filters.status !== 'todos') {
      result = result.filter((a) => a.status === filters.status);
    }

    if (filters.customerPhone) {
      const cleanFilter = filters.customerPhone.replace(/\D/g, '');
      result = result.filter((a) => a.customerPhone.replace(/\D/g, '').includes(cleanFilter));
    }

    return result;
  },

  updateAppointmentStatus: async (
    id: string,
    status: 'pending' | 'completed' | 'cancelled',
    _token?: string
  ): Promise<Appointment> => {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    let updatedApp: Appointment | null = null;
    const updated = appointments.map((a) => {
      if (a.id === id) {
        updatedApp = { ...a, status };
        return updatedApp;
      }
      return a;
    });
    setItem(STORAGE_KEYS.APPOINTMENTS, updated);
    if (!updatedApp) throw new Error('Agendamento não encontrado');
    return updatedApp;
  },

  cancelAppointmentByCustomer: async (id: string, _customerPhone: string): Promise<Appointment> => {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    let updatedApp: Appointment | null = null;
    const updated = appointments.map((a) => {
      if (a.id === id) {
        updatedApp = { ...a, status: 'cancelled' as const };
        return updatedApp;
      }
      return a;
    });
    setItem(STORAGE_KEYS.APPOINTMENTS, updated);
    if (!updatedApp) throw new Error('Agendamento não encontrado');
    return updatedApp;
  },

  rescheduleAppointmentByCustomer: async (
    id: string,
    data: { date: string; time: string; serviceIds?: string[]; notes?: string; customerPhone: string }
  ): Promise<Appointment> => {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    let updatedApp: Appointment | null = null;

    const services = getItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);

    const updated = appointments.map((a) => {
      if (a.id === id) {
        const serviceIds = data.serviceIds || a.serviceIds;
        const selectedServices = services.filter((s) => serviceIds.includes(s.id));
        const serviceNames = selectedServices.map((s) => s.name);
        const totalPriceSum = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
        const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

        updatedApp = {
          ...a,
          date: data.date,
          time: data.time,
          serviceIds,
          serviceNames: serviceNames.length > 0 ? serviceNames : a.serviceNames,
          totalPrice: totalPriceSum || a.totalPrice,
          priceDisplay: `R$ ${(totalPriceSum || a.totalPrice || 0).toFixed(2).replace('.', ',')}`,
          totalDurationMinutes: totalDuration || a.totalDurationMinutes,
          notes: data.notes !== undefined ? data.notes : a.notes,
          status: 'pending',
        };
        return updatedApp;
      }
      return a;
    });

    setItem(STORAGE_KEYS.APPOINTMENTS, updated);
    if (!updatedApp) throw new Error('Agendamento não encontrado');
    return updatedApp;
  },

  deleteAppointment: async (id: string, _token?: string): Promise<{ success: boolean }> => {
    const appointments = getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const updated = appointments.filter((a) => a.id !== id);
    setItem(STORAGE_KEYS.APPOINTMENTS, updated);
    return { success: true };
  },

  // Auth (Local)
  loginBarber: async (email: string, _password: string): Promise<AuthResponse> => {
    const barberUser = {
      id: 'barber-' + Date.now(),
      email,
      name: email.includes('@') ? email.split('@')[0] : 'Barbeiro',
      phone: '(67) 9310-6619',
    };
    const token = 'token-local-' + Date.now();
    setItem(STORAGE_KEYS.TOKEN, token);
    setItem(STORAGE_KEYS.USER, barberUser);
    return { token, user: barberUser };
  },

  registerBarber: async (data: { email: string; phone: string; password: string; name?: string }): Promise<AuthResponse> => {
    const barberUser = {
      id: 'barber-' + Date.now(),
      email: data.email,
      name: data.name || (data.email.includes('@') ? data.email.split('@')[0] : 'Barbeiro'),
      phone: data.phone || '(67) 9310-6619',
    };
    const token = 'token-local-' + Date.now();
    setItem(STORAGE_KEYS.TOKEN, token);
    setItem(STORAGE_KEYS.USER, barberUser);
    return { token, user: barberUser };
  },

  getMe: async (_token: string): Promise<{ user: any }> => {
    const savedUser = getItem<any>(STORAGE_KEYS.USER, null);
    if (savedUser) {
      return { user: savedUser };
    }
    const defaultUser = {
      id: 'barber-default',
      email: 'barbeiro@brave.com',
      name: 'Brave Barbeiro',
      phone: '(67) 9310-6619',
    };
    return { user: defaultUser };
  },
};
