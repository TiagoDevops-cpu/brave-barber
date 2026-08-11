import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Scissors,
  Check,
  CalendarPlus,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ShopConfig, ServiceItem, Customer, Appointment } from '../types';
import { api } from '../lib/api';

interface BookingModalProps {
  config: ShopConfig;
  services: ServiceItem[];
  customer: Customer | null;
  initialSelectedServiceIds?: string[];
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  config,
  services,
  customer,
  initialSelectedServiceIds = [],
  isOpen,
  onClose,
  onAppointmentCreated,
}) => {
  // Wizard Steps: 1 = Services, 2 = Date (Calendar), 3 = Time, 4 = Confirmation Summary, 5 = Success
  const [step, setStep] = useState<number>(1);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(initialSelectedServiceIds);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(''); // HH:MM
  const [notes, setNotes] = useState<string>('');

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [slotsReason, setSlotsReason] = useState<string>('');

  // Submission State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (initialSelectedServiceIds.length > 0) {
      setSelectedServiceIds(initialSelectedServiceIds);
    }
  }, [initialSelectedServiceIds]);

  // Load slots when date or selected services change
  useEffect(() => {
    if (!selectedDate) return;

    const chosenServices = services.filter((s) => selectedServiceIds.includes(s.id));
    const totalDuration = chosenServices.reduce((acc, s) => acc + (s.durationMinutes || 20), 0) || 20;

    setSlotsLoading(true);
    setSlotsReason('');

    api.getAvailableSlots(selectedDate, totalDuration)
      .then((res) => {
        setAvailableSlots(res.availableSlots || []);
        if (res.reason) setSlotsReason(res.reason);
      })
      .catch((err) => {
        setError('Erro ao carregar horários disponíveis.');
      })
      .finally(() => {
        setSlotsLoading(false);
      });
  }, [selectedDate, selectedServiceIds, services]);

  if (!isOpen) return null;

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  // Selected Services Summary Calculations
  const selectedServicesList = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDurationMinutes = selectedServicesList.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  let hasConsult = false;
  let totalPriceFixed = 0;
  selectedServicesList.forEach((s) => {
    if (s.priceType === 'consult' || s.price === null) {
      hasConsult = true;
    } else {
      totalPriceFixed += s.price;
    }
  });

  // Calendar Month Generator
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleDateSelect = (dayNum: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
    setSelectedTime(''); // Reset time when date changes
  };

  const isDayDisabled = (dayNum: number) => {
    const dateCheck = new Date(year, month, dayNum);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    
    // Past dates
    if (dateStr < todayStr) return true;

    // Check if shop opens on this day of week
    const dayOfWeek = dateCheck.getDay();
    if (!config.workingDays.includes(dayOfWeek)) return true;

    return false;
  };

  const handleConfirmAppointment = async () => {
    if (!customer) {
      setError('Sua identificação de cliente é necessária.');
      return;
    }
    if (!selectedDate || !selectedTime || selectedServiceIds.length === 0) {
      setError('Por favor, preencha todos os campos do agendamento.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.createAppointment({
        customerId: customer.id,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        date: selectedDate,
        time: selectedTime,
        serviceIds: selectedServiceIds,
        notes,
      });

      setCreatedAppointment(result);
      onAppointmentCreated(result);
      setStep(5); // Success step
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar horário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Format date display (e.g. "Terça-feira, 15 de Outubro de 2026")
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-zinc-100 my-auto">
        {/* Top Gold Accent */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif uppercase tracking-wide text-amber-400">
                Agendamento Online
              </h2>
              <p className="text-xs text-zinc-400">
                Passo {step} de 4 • {config.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        {step < 5 && (
          <div className="grid grid-cols-4 bg-zinc-950 border-b border-zinc-800 text-[11px] text-center font-bold uppercase tracking-wider text-zinc-500">
            <div className={`py-2.5 border-r border-zinc-800 transition-colors ${step >= 1 ? 'text-amber-400 bg-amber-500/5' : ''}`}>
              1. Serviços
            </div>
            <div className={`py-2.5 border-r border-zinc-800 transition-colors ${step >= 2 ? 'text-amber-400 bg-amber-500/5' : ''}`}>
              2. Dia
            </div>
            <div className={`py-2.5 border-r border-zinc-800 transition-colors ${step >= 3 ? 'text-amber-400 bg-amber-500/5' : ''}`}>
              3. Horário
            </div>
            <div className={`py-2.5 transition-colors ${step >= 4 ? 'text-amber-400 bg-amber-500/5' : ''}`}>
              4. Confirmar
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Services */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left mb-2">
                <h3 className="text-base font-bold text-zinc-100">
                  Escolha o(s) Serviço(s) Desejado(s)
                </h3>
                <p className="text-xs text-zinc-400">
                  Selecione um ou mais serviços para o mesmo atendimento.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.filter(s => s.active !== false).map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id);
                  const isConsult = service.priceType === 'consult' || service.price === null;

                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 shadow-md'
                          : 'bg-zinc-950 border-zinc-800 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="pr-2">
                        <h4 className="text-sm font-bold text-zinc-100">
                          {service.name}
                        </h4>
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {service.durationMinutes} min
                        </span>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-400">
                          {isConsult ? 'Consultar' : `R$ ${service.price?.toFixed(2).replace('.', ',')}`}
                        </span>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                            isSelected ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step 1 Footer */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400">
                    Duração Total: <strong className="text-zinc-200">{totalDurationMinutes} min</strong>
                  </p>
                  <p className="text-sm font-bold text-amber-400">
                    {hasConsult
                      ? totalPriceFixed > 0
                        ? `R$ ${totalPriceFixed.toFixed(2).replace('.', ',')} + Consultar`
                        : 'Consultar valor'
                      : `R$ ${totalPriceFixed.toFixed(2).replace('.', ',')}`}
                  </p>
                </div>

                <button
                  disabled={selectedServiceIds.length === 0}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Próximo: Escolher Dia →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Date (Monthly Calendar) */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Selecione o Dia no Calendário
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Dias desabilitados correspondem ao período passado ou fechamento da barbearia.
                  </p>
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold uppercase text-amber-400 tracking-wider">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days Grid */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-amber-500/80 mb-2">
                  <span>DOM</span>
                  <span>SEG</span>
                  <span>TER</span>
                  <span>QUA</span>
                  <span>QUI</span>
                  <span>SEX</span>
                  <span>SÁB</span>
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-10 sm:h-12" />
                  ))}

                  {/* Day buttons */}
                  {daysArray.map((dayNum) => {
                    const disabled = isDayDisabled(dayNum);
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={dayNum}
                        disabled={disabled}
                        onClick={() => handleDateSelect(dayNum)}
                        className={`h-10 sm:h-12 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all ${
                          disabled
                            ? 'opacity-25 bg-zinc-900 text-zinc-600 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/20 scale-105'
                            : 'bg-zinc-900 text-zinc-200 hover:bg-amber-500/20 hover:text-amber-400 border border-zinc-800'
                        }`}
                      >
                        <span>{dayNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 Footer */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
                >
                  ← Voltar
                </button>

                <button
                  disabled={!selectedDate}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Próximo: Escolher Horário →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Time Slot */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  Horários Disponíveis para {formatDateDisplay(selectedDate)}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tempo estimado de atendimento: <strong className="text-amber-400">{totalDurationMinutes} min</strong>
                </p>
              </div>

              {slotsLoading ? (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  Carregando horários livres...
                </div>
              ) : slotsReason ? (
                <div className="py-8 text-center p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-400 text-xs">
                  {slotsReason}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="py-8 text-center p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-400 text-xs">
                  Nenhum horário livre neste dia para a duração selecionada. Por favor, escolha outro dia.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto p-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold tracking-wide transition-all border flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-lg scale-105'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-amber-500/40 hover:text-amber-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Notes Input */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Observações para o Barbeiro (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Prefiro degradê navalhado nas laterais..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              {/* Step 3 Footer */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
                >
                  ← Voltar
                </button>

                <button
                  disabled={!selectedTime}
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Revisar Resumo →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation Summary */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <h3 className="text-base font-bold text-zinc-100">
                  Confirmação do Agendamento
                </h3>
                <p className="text-xs text-zinc-400">
                  Confira as informações antes de finalizar.
                </p>
              </div>

              <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-3">
                {/* Customer Info */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
                  <span className="text-zinc-400 font-medium">Cliente:</span>
                  <span className="text-zinc-100 font-bold">{customer?.fullName} ({customer?.phone})</span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
                  <span className="text-zinc-400 font-medium">Data & Horário:</span>
                  <span className="text-amber-400 font-bold">
                    {formatDateDisplay(selectedDate)} às {selectedTime}
                  </span>
                </div>

                {/* Services Chosen */}
                <div className="pb-3 border-b border-zinc-800 text-xs">
                  <span className="text-zinc-400 font-medium block mb-1">Serviço(s) Selecionado(s):</span>
                  <div className="space-y-1">
                    {selectedServicesList.map((srv) => (
                      <div key={srv.id} className="flex justify-between text-zinc-200">
                        <span>• {srv.name} ({srv.durationMinutes} min)</span>
                        <span className="font-semibold text-amber-400">
                          {srv.priceType === 'consult' || srv.price === null
                            ? 'Consultar'
                            : `R$ ${srv.price.toFixed(2).replace('.', ',')}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Duration */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-zinc-400 block">Duração Total Estimada</span>
                    <span className="text-sm font-bold text-zinc-200">{totalDurationMinutes} minutos</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">Valor Final</span>
                    <span className="text-lg font-black text-amber-400">
                      {hasConsult
                        ? totalPriceFixed > 0
                          ? `R$ ${totalPriceFixed.toFixed(2).replace('.', ',')} + Consultar`
                          : 'Consultar valor'
                        : `R$ ${totalPriceFixed.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
                <span>O pagamento é efetuado diretamente na barbearia após a realização dos serviços.</span>
              </div>

              {/* Step 4 Footer */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
                >
                  ← Voltar
                </button>

                <button
                  disabled={loading}
                  onClick={handleConfirmAppointment}
                  className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Confirmando...' : 'Confirmar Agendamento ✓'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Success Screen */}
          {step === 5 && createdAppointment && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black font-serif text-amber-400 uppercase tracking-wide">
                  Agendamento Confirmado!
                </h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto">
                  Seu horário está garantido para{' '}
                  <strong className="text-amber-300">{formatDateDisplay(createdAppointment.date)} às {createdAppointment.time}</strong>.
                </p>
              </div>

              {/* Google Calendar & WhatsApp Action Links */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                {createdAppointment.googleCalendarLink && (
                  <a
                    href={createdAppointment.googleCalendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:border-amber-500"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>Adicionar ao Google Agenda</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}

                <a
                  href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá! Fiz um agendamento para ${createdAppointment.customerName} no dia ${
                      createdAppointment.date.includes('-')
                        ? createdAppointment.date.split('-').reverse().join('/')
                        : createdAppointment.date
                    } às ${createdAppointment.time}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar no WhatsApp</span>
                </a>
              </div>

              <button
                onClick={onClose}
                className="mt-6 text-xs font-semibold text-zinc-400 hover:text-zinc-100 underline transition-colors"
              >
                Fechar esta janela
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
