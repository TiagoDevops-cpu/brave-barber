export interface ShopConfig {
  id: string;
  name: string;
  slogan: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  openingHours: string;
  workingDays: number[]; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  startHour: string; // "08:00"
  endHour: string; // "20:00"
  slotIntervalMinutes: number; // 20
  heroVideoUrl: string;
  heroVideoTitle: string;
  heroVideoSubtitle: string;
  aboutText: string;
  googleCalendarConnected: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number | null; // null means 'Consultar'
  priceType: "fixed" | "consult";
  durationMinutes: number;
  category: "corte" | "barba" | "combo" | "outros";
  description?: string;
  active?: boolean;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  serviceIds: string[];
  serviceNames: string[];
  totalPrice: number | null;
  priceDisplay: string;
  totalDurationMinutes: number;
  status: "pending" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  googleCalendarLink?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  isFeaturedHero: boolean;
  createdAt: string;
}

export interface BarberUser {
  id: string;
  email: string;
  phone: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: BarberUser;
}
