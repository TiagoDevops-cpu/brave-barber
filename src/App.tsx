import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoleSelector } from './components/RoleSelector';
import { CustomerIdentifyModal } from './components/CustomerIdentifyModal';
import { HeroVideo } from './components/HeroVideo';
import { ServicesSection } from './components/ServicesSection';
import { ProductsSection } from './components/ProductsSection';
import { GallerySection } from './components/GallerySection';
import { BookingModal } from './components/BookingModal';
import { CustomerAppointmentsModal } from './components/CustomerAppointmentsModal';
import { BarberAuthModal } from './components/BarberAuthModal';
import { BarberDashboard } from './components/BarberDashboard';
import { Footer } from './components/Footer';

import { ShopConfig, ServiceItem, GalleryItem, Customer, AuthResponse } from './types';
import { api } from './lib/api';
import { initialShopConfig, initialServices, initialGallery } from './data/initialData';

export default function App() {
  // Role State: 'role-selector' | 'client' | 'barber'
  const [activeRole, setActiveRole] = useState<'role-selector' | 'client' | 'barber'>('role-selector');

  // Config & Data State
  const [shopConfig, setShopConfig] = useState<ShopConfig>(initialShopConfig);
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);

  // Customer State
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isIdentifyModalOpen, setIsIdentifyModalOpen] = useState(false);

  // Barber State
  const [barberToken, setBarberToken] = useState<string | null>(localStorage.getItem('barber_token'));
  const [barberUser, setBarberUser] = useState<any>(null);
  const [isBarberAuthOpen, setIsBarberAuthOpen] = useState(false);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isCustomerAppointmentsOpen, setIsCustomerAppointmentsOpen] = useState(false);

  // Initial Fetch Data
  useEffect(() => {
    // Check saved customer data
    const savedCustomer = localStorage.getItem('barber_customer_data');
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (e) {
        console.error(e);
      }
    }

    // Load local data
    loadAllData();
  }, []);

  // Verify Barber Token if exists
  useEffect(() => {
    if (barberToken) {
      api.getMe(barberToken)
        .then((res) => setBarberUser(res.user))
        .catch(() => {
          setBarberToken(null);
          localStorage.removeItem('barber_token');
        });
    }
  }, [barberToken]);

  const loadAllData = async () => {
    try {
      const [cfg, srvs, gal] = await Promise.all([
        api.getShopConfig().catch(() => initialShopConfig),
        api.getServices().catch(() => initialServices),
        api.getGallery().catch(() => initialGallery),
      ]);
      setShopConfig(cfg);
      setServices(srvs);
      setGallery(gal);
    } catch (e) {
      console.error('Error loading initial local data', e);
    }
  };

  // Role Selection Logic
  const handleSelectRole = (role: 'client' | 'barber') => {
    if (role === 'client') {
      setActiveRole('client');
      // If customer not identified yet, open identification modal
      const saved = localStorage.getItem('barber_customer_data');
      if (!saved) {
        setIsIdentifyModalOpen(true);
      }
    } else {
      setActiveRole('barber');
      if (!barberToken) {
        setIsBarberAuthOpen(true);
      }
    }
  };

  // Service toggle selection
  const handleToggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  // Open Booking Modal Trigger
  const handleOpenBooking = () => {
    if (!customer) {
      setIsIdentifyModalOpen(true);
      return;
    }
    // If no services selected, pick the first service as default
    if (selectedServiceIds.length === 0 && services.length > 0) {
      setSelectedServiceIds([services[0].id]);
    }
    setIsBookingOpen(true);
  };

  // Barber Auth Success
  const handleBarberAuthSuccess = (authData: AuthResponse) => {
    setBarberToken(authData.token);
    setBarberUser(authData.user);
    localStorage.setItem('barber_token', authData.token);
    setIsBarberAuthOpen(false);
    setActiveRole('barber');
  };

  // Barber Logout
  const handleBarberLogout = () => {
    setBarberToken(null);
    setBarberUser(null);
    localStorage.removeItem('barber_token');
    setActiveRole('role-selector');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      
      {/* 1. ROLE SELECTOR (Página de Entrada) */}
      {activeRole === 'role-selector' && (
        <RoleSelector config={shopConfig} onSelectRole={handleSelectRole} />
      )}

      {/* 2. CLIENT INTERFACE */}
      {activeRole === 'client' && (
        <div className="flex flex-col min-h-screen">
          <Header
            config={shopConfig}
            customer={customer}
            barberToken={barberToken}
            onOpenBooking={handleOpenBooking}
            onOpenCustomerAppointments={() => setIsCustomerAppointmentsOpen(true)}
            onOpenGallery={() => {
              const el = document.getElementById('galeria');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onSwitchRole={() => setActiveRole('role-selector')}
            onLogoutBarber={handleBarberLogout}
            activeRole="client"
          />

          <main className="flex-1">
            {/* Hero Section with Video */}
            <HeroVideo config={shopConfig} onOpenBooking={handleOpenBooking} />

            {/* Services & Price List */}
            <ServicesSection
              services={services}
              selectedServiceIds={selectedServiceIds}
              onToggleService={handleToggleService}
              onOpenBooking={handleOpenBooking}
            />

            {/* Products Section */}
            <ProductsSection config={shopConfig} />

            {/* Gallery (Resultados / Fotos / Vídeos) */}
            <GallerySection gallery={gallery} />
          </main>

          {/* Footer */}
          <Footer
            config={shopConfig}
            onOpenBooking={handleOpenBooking}
            onSwitchRole={() => setActiveRole('role-selector')}
          />
        </div>
      )}

      {/* 3. BARBER DASHBOARD */}
      {activeRole === 'barber' && barberToken && barberUser && (
        <div className="flex flex-col min-h-screen">
          <Header
            config={shopConfig}
            customer={customer}
            barberToken={barberToken}
            onOpenBooking={handleOpenBooking}
            onOpenCustomerAppointments={() => {}}
            onOpenGallery={() => {}}
            onSwitchRole={() => setActiveRole('role-selector')}
            onLogoutBarber={handleBarberLogout}
            activeRole="barber"
          />

          <main className="flex-1">
            <BarberDashboard
              config={shopConfig}
              token={barberToken}
              user={barberUser}
              onUpdateConfig={(newCfg) => setShopConfig(newCfg)}
              onRefreshData={loadAllData}
            />
          </main>
        </div>
      )}

      {/* MODALS */}

      {/* Customer Identification Modal */}
      <CustomerIdentifyModal
        config={shopConfig}
        isOpen={isIdentifyModalOpen}
        onSuccess={(c) => {
          setCustomer(c);
          setIsIdentifyModalOpen(false);
        }}
      />

      {/* Booking Wizard Modal */}
      <BookingModal
        config={shopConfig}
        services={services}
        customer={customer}
        initialSelectedServiceIds={selectedServiceIds}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onAppointmentCreated={(app) => {
          loadAllData();
        }}
      />

      {/* Customer Appointments Modal */}
      <CustomerAppointmentsModal
        config={shopConfig}
        customer={customer}
        isOpen={isCustomerAppointmentsOpen}
        onClose={() => setIsCustomerAppointmentsOpen(false)}
        onAppointmentUpdated={loadAllData}
      />

      {/* Barber Login / Register Modal */}
      <BarberAuthModal
        config={shopConfig}
        isOpen={isBarberAuthOpen}
        onClose={() => {
          setIsBarberAuthOpen(false);
          if (!barberToken) setActiveRole('role-selector');
        }}
        onSuccess={handleBarberAuthSuccess}
      />
    </div>
  );
}
