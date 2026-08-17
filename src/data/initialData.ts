import type { GalleryItem, ServiceItem, ShopConfig } from "../types";

export const initialShopConfig: ShopConfig = {
  id: "shop-1",
  name: "Brave Barber",
  slogan: "Estilo, Tradição e Excelência em Cortes Mascullinos",
  address:
    "R. Pontalina, 722 - Vila Santo Eugenio, Campo Grande - MS, 79063-561",
  phone: "(67) 99310-6619",
  whatsapp: "5567993106619",
  instagram: "@obryanbarbeiro_",
  openingHours: "Terça a Sábado: 08:00 às 19:30",
  workingDays: [2, 3, 4, 5, 6], // Terça a Sábado
  startHour: "08:00",
  endHour: "19:30",
  slotIntervalMinutes: 20,
  heroVideoUrl:
    "https://assets.mixkit.co/videos/preview/mixkit-barber-cutting-the-hair-of-a-man-40899-large.mp4",
  heroVideoTitle: "Mestres na Arte da Barbearia",
  heroVideoSubtitle:
    "Confira a transformação e a precisão do nosso trabalho exclusivo.",
  aboutText:
    "Na Brave, cada corte é planejado nos mínimos detalhes para valorizar seu estilo e personalidade. Oferecemos um ambiente exclusivo, climatizado, com café gourmet, cerveja gelada e os melhores profissionais da região.",
  googleCalendarConnected: true,
};

export const initialServices: ServiceItem[] = [
  {
    id: "srv-1",
    name: "Corte",
    price: 40.0,
    priceType: "fixed",
    durationMinutes: 40,
    category: "corte",
    description:
      "Corte moderno ou clássico com tesoura e máquina, finalização com pomada.",
    active: true,
  },
  {
    id: "srv-2",
    name: "Barba",
    price: 40.0,
    priceType: "fixed",
    durationMinutes: 30,
    category: "barba",
    description:
      "Modelagem completa com toalha quente, navalha e pós-barba hidratante.",
    active: true,
  },
  {
    id: "srv-3",
    name: "Pezinho cabelo/ barba",
    price: 15.0,
    priceType: "fixed",
    durationMinutes: 20,
    category: "corte",
    description: "Acabamento e contorno preciso do pezinho do cabelo ou barba.",
    active: true,
  },
  {
    id: "srv-4",
    name: "Limpeza de pele",
    price: 55.0,
    priceType: "fixed",
    durationMinutes: 40,
    category: "outros",
    description:
      "Esfoliação, máscara facial e hidratação profunda contra oleosidade.",
    active: true,
  },
  {
    id: "srv-5",
    name: "Sobrancelha",
    price: 15.0,
    priceType: "fixed",
    durationMinutes: 15,
    category: "outros",
    description: "Design e alinhamento de sobrancelha com navalha/pinça.",
    active: true,
  },
  {
    id: "srv-6",
    name: "Depilação nariz/ orelha",
    price: 20.0,
    priceType: "fixed",
    durationMinutes: 15,
    category: "outros",
    description:
      "Remoção prática de pelos indesejados com cera morna hipoalergênica.",
    active: true,
  },
];

export const initialGallery: GalleryItem[] = [];
