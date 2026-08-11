import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  CalendarPlus,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Scissors,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';
import { Appointment, Customer, ShopConfig, ServiceItem } from '../types';
import { api } from '../lib/api';

interface CustomerAppointmentsModalProps {
  config: ShopConfig;
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated?: () => void;
}

export const CustomerAppointmentsModal: React.FC<CustomerAppointmentsModalProps> = ({
  config,
  customer,
  isOpen,
  onClose,
  onAppointmentUpdated,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation State
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Reschedule / Edit State
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [editServiceIds, setEditServiceIds] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Feedback Messages
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAppointments = async () => {
    if (!customer?.phone) return;
    setLoading(true);
    try {
      const data = await api.getAppointments({ customerPhone: customer.phone });
      setAppointments(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customer?.phone) {
      fetchAppointments();
      api.getServices().then(setServices).catch(console.error);
    } else {
      setEditingAppointment(null);
      setCancelingId(null);
      setStatusMessage(null);
    }
  }, [isOpen, customer]);

  // Load available slots when date or selected services change during edit
  useEffect(() => {
    if (editingAppointment && editDate) {
      const chosenServices = services.filter((s) => editServiceIds.includes(s.id));
      const duration = chosenServices.reduce((acc, s) => acc + (s.durationMinutes || 20), 0) || 20;

      setLoadingSlots(true);
      api.getAvailableSlots(editDate, duration)
        .then((res) => {
          setAvailableSlots(res.availableSlots || []);
          // If previous selected time is not in new slots and date changed, clear slot choice unless it matches
          if (!res.availableSlots.includes(editTime) && editDate !== editingAppointment.date) {
            setEditTime('');
          }
        })
        .catch(console.error)
        .finally(() => setLoadingSlots(false));
    }
  }, [editDate, editServiceIds, editingAppointment, services]);

  if (!isOpen) return null;

  // Handle Cancel Appointment
  const handleConfirmCancel = async (id: string) => {
    if (!customer) return;
    setCancelLoading(true);
    setStatusMessage(null);
    try {
      await api.cancelAppointmentByCustomer(id, customer.phone);
      setStatusMessage({ type: 'success', text: 'Agendamento cancelado com sucesso!' });
      setCancelingId(null);
      await fetchAppointments();
      if (onAppointmentUpdated) onAppointmentUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao cancelar o agendamento.' });
    } finally {
      setCancelLoading(false);
    }
  };

  // Start Editing Appointment
  const handleStartEdit = (app: Appointment) => {
    setEditingAppointment(app);
    setEditDate(app.date);
    setEditTime(app.time);
    setEditServiceIds(app.serviceIds || []);
    setEditNotes(app.notes || '');
    setStatusMessage(null);
  };

  // Submit Reschedule
  const handleSaveReschedule = async () => {
    if (!editingAppointment || !customer) return;
    if (!editDate || !editTime) {
      setStatusMessage({ type: 'error', text: 'Por favor, selecione uma data e um horário disponível.' });
      return;
    }
    if (editServiceIds.length === 0) {
      setStatusMessage({ type: 'error', text: 'Selecione ao menos um serviço.' });
      return;
    }

    setRescheduleLoading(true);
    setStatusMessage(null);

    try {
      await api.rescheduleAppointmentByCustomer(editingAppointment.id, {
        date: editDate,
        time: editTime,
        serviceIds: editServiceIds,
        notes: editNotes,
        customerPhone: customer.phone,
      });

      setStatusMessage({ type: 'success', text: 'Agendamento alterado com sucesso!' });
      setEditingAppointment(null);
      await fetchAppointments();
      if (onAppointmentUpdated) onAppointmentUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao reagendar o horário.' });
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Toggle service selection during editing
  const toggleEditService = (serviceId: string) => {
    if (editServiceIds.includes(serviceId)) {
      if (editServiceIds.length === 1) return; // Must keep at least 1
      setEditServiceIds(editServiceIds.filter((id) => id !== serviceId));
    } else {
      setEditServiceIds([...editServiceIds, serviceId]);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Top Gold Accent */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50 shrink-0">
          <div className="flex items-center gap-3">
            {editingAppointment ? (
              <button
                onClick={() => setEditingAppointment(null)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition-colors flex items-center gap-1"
                title="Voltar para a lista"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Calendar className="w-5 h-5" />
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold font-serif uppercase tracking-wide text-amber-400">
                {editingAppointment ? 'Alterar Agendamento' : 'Meus Agendamentos'}
              </h2>
              <p className="text-xs text-zinc-400">
                Cliente: <strong className="text-zinc-200">{customer?.fullName}</strong> ({customer?.phone})
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

        {/* Global Feedback Banner */}
        {statusMessage && (
          <div
            className={`px-5 py-3 text-xs font-bold flex items-center justify-between gap-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : 'bg-red-950/80 text-red-300 border-red-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* EDIT / RESCHEDULE VIEW */}
          {editingAppointment ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/20 text-xs space-y-1">
                <span className="text-amber-400 font-bold uppercase tracking-wider block text-[10px]">
                  Agendamento Atual
                </span>
                <p className="text-zinc-200 font-bold">
                  {editingAppointment.date} às {editingAppointment.time}
                </p>
                <p className="text-zinc-400">{editingAppointment.serviceNames.join(', ')}</p>
              </div>

              {/* 1. Services Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-500" />
                  1. Serviços Selecionados
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map((s) => {
                    const isSelected = editServiceIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleEditService(s.id)}
                        className={`p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="truncate pr-2">{s.name}</span>
                        <span className="text-[11px] text-amber-400 font-bold shrink-0">
                          {s.price !== null ? `R$ ${s.price}` : 'Sob Consulta'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Date Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  2. Escolha a Nova Data
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-zinc-100 outline-none transition-colors"
                />
              </div>

              {/* 3. Time Slots */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  3. Escolha o Novo Horário
                </label>

                {loadingSlots ? (
                  <div className="p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Buscando horários vagos...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-3 text-center text-xs text-amber-400/80 bg-zinc-950 border border-zinc-800 rounded-xl">
                    Nenhum horário disponível para esta data. Tente outra data.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                    {availableSlots.map((slot) => {
                      const isSelected = editTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setEditTime(slot)}
                          className={`py-2 px-1 rounded-lg text-xs font-bold border text-center transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md scale-105'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-amber-500/50'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">Observações (opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: Prefiro tesoura no topo"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  disabled={rescheduleLoading}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
                >
                  Cancelar Edição
                </button>
                <button
                  type="button"
                  onClick={handleSaveReschedule}
                  disabled={rescheduleLoading || !editDate || !editTime}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  {rescheduleLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Reagendamento</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* APPOINTMENTS LIST VIEW */
            loading ? (
              <div className="py-12 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                <span>Buscando seus horários...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs bg-zinc-950 rounded-xl border border-zinc-800">
                Você ainda não possui nenhum agendamento cadastrado com este telefone.
              </div>
            ) : (
              appointments.map((app) => {
                const isPending = app.status === 'pending';
                const isCanceling = cancelingId === app.id;

                return (
                  <div
                    key={app.id}
                    className={`bg-zinc-950 p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                      isPending ? 'border-amber-500/30 shadow-lg' : 'border-zinc-800 opacity-80'
                    }`}
                  >
                    {/* Date, Time & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-amber-400">
                          {app.date} às {app.time}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          app.status === 'completed'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : app.status === 'cancelled'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {app.status === 'completed'
                          ? 'Concluído'
                          : app.status === 'cancelled'
                          ? 'Cancelado'
                          : 'Aberto / Confirmado'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-xs text-zinc-300 space-y-1">
                      <p>
                        <strong className="text-zinc-400">Serviços:</strong>{' '}
                        {app.serviceNames.join(', ')}
                      </p>
                      <p>
                        <strong className="text-zinc-400">Valor Estimado:</strong>{' '}
                        <span className="text-amber-400 font-bold">{app.priceDisplay}</span>
                      </p>
                      {app.notes && (
                        <p className="text-zinc-400 italic">"{app.notes}"</p>
                      )}
                    </div>

                    {/* Cancellation Confirmation Bar */}
                    {isCanceling && (
                      <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs space-y-2 animate-fadeIn">
                        <p className="text-red-300 font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>Tem certeza que deseja cancelar este agendamento?</span>
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setCancelingId(null)}
                            disabled={cancelLoading}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold"
                          >
                            Voltar
                          </button>
                          <button
                            onClick={() => handleConfirmCancel(app.id)}
                            disabled={cancelLoading}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1"
                          >
                            {cancelLoading ? 'Cancelando...' : 'Sim, Cancelar'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Bar for Pending Appointments */}
                    {isPending && !isCanceling && (
                      <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2">
                        {app.googleCalendarLink && (
                          <a
                            href={app.googleCalendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-[11px] font-bold border border-zinc-800 transition-all"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            <span>Google Agenda</span>
                            <ExternalLink className="w-3 h-3 text-zinc-500" />
                          </a>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          {/* Cancel Option */}
                          <button
                            onClick={() => setCancelingId(app.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition-all"
                            title="Cancelar este agendamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Cancelar</span>
                          </button>

                          {/* Edit / Reschedule Option */}
                          <button
                            onClick={() => handleStartEdit(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 transition-all shadow-sm"
                            title="Mudar data, horário ou serviços"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Mudar / Reagendar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
};
