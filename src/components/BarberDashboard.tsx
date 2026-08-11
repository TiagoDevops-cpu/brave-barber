import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Settings,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  Check,
  Upload,
} from 'lucide-react';
import {
  ShopConfig,
  ServiceItem,
  GalleryItem,
  Appointment,
  BarberUser,
} from '../types';
import { api } from '../lib/api';

interface BarberDashboardProps {
  config: ShopConfig;
  token: string;
  user: BarberUser;
  onUpdateConfig: (newConfig: ShopConfig) => void;
  onRefreshData: () => void;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({
  config,
  token,
  user,
  onUpdateConfig,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'galeria' | 'servicos' | 'config'>('agenda');

  // Agenda State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dateMode, setDateMode] = useState<'today' | 'tomorrow' | 'next7' | 'future' | 'specific' | 'range' | 'all'>('today');
  const [specificDate, setSpecificDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [loadingApps, setLoadingApps] = useState<boolean>(true);
  const [selectedAppDetail, setSelectedAppDetail] = useState<Appointment | null>(null);

  // Manual Appointment Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('10:00');
  const [manualServiceIds, setManualServiceIds] = useState<string[]>([]);

  // Services State
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);

  // Gallery State
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaFeatured, setNewMediaFeatured] = useState(false);
  const [mediaSourceMode, setMediaSourceMode] = useState<'upload' | 'url'>('upload');
  const [uploadFileName, setUploadFileName] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);

  // Config Form State
  const [shopForm, setShopForm] = useState<ShopConfig>(config);
  const [configSuccess, setConfigSuccess] = useState('');

  const [actionError, setActionError] = useState('');

  // Fetch Data on Load
  useEffect(() => {
    fetchAppointments();
    fetchServices();
    fetchGallery();
  }, [dateMode, specificDate, startDate, endDate, filterStatus]);

  useEffect(() => {
    setShopForm(config);
  }, [config]);

  const fetchAppointments = async () => {
    setLoadingApps(true);
    try {
      const filters: any = {};
      const today = new Date().toISOString().split('T')[0];

      if (dateMode === 'today') {
        filters.date = today;
      } else if (dateMode === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        filters.date = d.toISOString().split('T')[0];
      } else if (dateMode === 'next7') {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        filters.startDate = today;
        filters.endDate = d.toISOString().split('T')[0];
      } else if (dateMode === 'future') {
        filters.startDate = today;
      } else if (dateMode === 'specific') {
        if (specificDate) filters.date = specificDate;
      } else if (dateMode === 'range') {
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
      }

      if (filterStatus !== 'todos') filters.status = filterStatus;

      const data = await api.getAppointments(filters, token);
      setAppointments(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingApps(false);
    }
  };

  const formatDateFormatted = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const dateObj = new Date(`${dateStr}T00:00:00`);
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayName = daysOfWeek[dateObj.getDay()] || '';
    return `${d}/${m}/${y} (${dayName})`;
  };

  const fetchServices = async () => {
    try {
      const data = await api.getServices();
      setServicesList(data);
      if (data.length > 0 && manualServiceIds.length === 0) {
        setManualServiceIds([data[0].id]);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const fetchGallery = async () => {
    try {
      const data = await api.getGallery();
      setGalleryList(data);
    } catch (e: any) {
      console.error(e);
    }
  };

  // Appointment Actions
  const handleUpdateStatus = async (id: string, status: 'pending' | 'completed' | 'cancelled') => {
    try {
      await api.updateAppointmentStatus(id, status, token);
      fetchAppointments();
      if (selectedAppDetail && selectedAppDetail.id === id) {
        setSelectedAppDetail({ ...selectedAppDetail, status });
      }
    } catch (e: any) {
      setActionError(e.message || 'Erro ao atualizar status.');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    try {
      await api.deleteAppointment(id, token);
      fetchAppointments();
      if (selectedAppDetail?.id === id) setSelectedAppDetail(null);
    } catch (e: any) {
      setActionError(e.message || 'Erro ao excluir agendamento.');
    }
  };

  const handleCreateManualAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualPhone || !manualDate || !manualTime || manualServiceIds.length === 0) {
      setActionError('Preencha todos os campos do agendamento manual.');
      return;
    }
    try {
      await api.createAppointment({
        customerName: manualName,
        customerPhone: manualPhone,
        date: manualDate,
        time: manualTime,
        serviceIds: manualServiceIds,
        notes: 'Agendado manualmente pelo barbeiro no painel.',
      });
      setIsManualModalOpen(false);
      setManualName('');
      setManualPhone('');
      fetchAppointments();
    } catch (e: any) {
      setActionError(e.message || 'Erro ao criar agendamento manual.');
    }
  };

  // Service Management
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name || editingService.durationMinutes == null) return;

    try {
      if (editingService.id) {
        await api.updateService(editingService.id, editingService, token);
      } else {
        await api.createService(editingService, token);
      }
      setIsServiceModalOpen(false);
      setEditingService(null);
      fetchServices();
      onRefreshData();
    } catch (e: any) {
      setActionError(e.message || 'Erro ao salvar serviço.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Deseja realmente excluir este serviço da tabela?')) return;
    try {
      await api.deleteService(id, token);
      fetchServices();
      onRefreshData();
    } catch (e: any) {
      setActionError(e.message || 'Erro ao excluir serviço.');
    }
  };

  // Gallery Management
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    const isVideo = file.type.startsWith('video');
    const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';
    setNewMediaType(mediaType);

    if (!newMediaTitle) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setNewMediaTitle(fileNameWithoutExt);
    }
    setUploadFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewMediaUrl(result);
      }
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setActionError('Erro ao ler o arquivo selecionado.');
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl) return;

    try {
      await api.addGalleryItem(
        {
          title: newMediaTitle || (newMediaType === 'video' ? 'Vídeo do Barbeiro' : 'Trabalho do Barbeiro'),
          type: newMediaType,
          url: newMediaUrl,
          isFeaturedHero: newMediaFeatured,
        },
        token
      );
      setNewMediaTitle('');
      setNewMediaUrl('');
      setUploadFileName('');
      setNewMediaFeatured(false);
      fetchGallery();
      onRefreshData();
    } catch (e: any) {
      setActionError(e.message || 'Erro ao adicionar mídia.');
    }
  };

  const handleSetFeatured = async (id: string) => {
    try {
      const res = await api.setFeaturedVideo(id, token);
      if (res.shopConfig) onUpdateConfig(res.shopConfig);
      fetchGallery();
    } catch (e: any) {
      setActionError(e.message || 'Erro ao definir vídeo de destaque.');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Remover esta mídia da galeria?')) return;
    try {
      await api.deleteGalleryItem(id, token);
      fetchGallery();
      onRefreshData();
    } catch (e: any) {
      setActionError(e.message || 'Erro ao remover mídia.');
    }
  };

  // Save Shop Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateShopConfig(shopForm, token);
      onUpdateConfig(updated);
      setConfigSuccess('Configurações da barbearia atualizadas com sucesso!');
      setTimeout(() => setConfigSuccess(''), 4000);
    } catch (e: any) {
      setActionError(e.message || 'Erro ao salvar configurações.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-16">
      {/* Dashboard Top Header */}
      <div className="bg-zinc-900 border-b border-amber-500/20 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Painel do Barbeiro • {user.name}</span>
            </div>
            <h1 className="text-3xl font-black font-serif uppercase text-zinc-100">
              {config.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Gerencie seus horários, clientes, tabela de serviços e fotos da galeria.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento Manual</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Horizontally scrollable on mobile */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-6 sm:mt-8 border-t border-zinc-800 pt-4 overflow-x-auto pb-2 scrollbar-none snap-x">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap snap-start shrink-0 min-h-[44px] ${
              activeTab === 'agenda'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-950 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 border border-zinc-800/80'
            }`}
          >
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span>Agenda & Horários</span>
          </button>

          <button
            onClick={() => setActiveTab('galeria')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap snap-start shrink-0 min-h-[44px] ${
              activeTab === 'galeria'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-950 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 border border-zinc-800/80'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>Galeria & Vídeo</span>
          </button>

          <button
            onClick={() => setActiveTab('servicos')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap snap-start shrink-0 min-h-[44px] ${
              activeTab === 'servicos'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-950 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 border border-zinc-800/80'
            }`}
          >
            <Scissors className="w-4 h-4 shrink-0" />
            <span>Serviços & Preços</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap snap-start shrink-0 min-h-[44px] ${
              activeTab === 'config'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-950 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 border border-zinc-800/80'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Dados da Barbearia</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError('')} className="text-red-300 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: AGENDA */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
              {/* Top Row: Date Preset Buttons */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-zinc-800/80">
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Filtrar por Período / Dias
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
                    {[
                      { id: 'today', label: 'Hoje' },
                      { id: 'tomorrow', label: 'Amanhã' },
                      { id: 'next7', label: 'Próximos 7 Dias' },
                      { id: 'future', label: 'Todos os Futuros' },
                      { id: 'specific', label: 'Data Específica' },
                      { id: 'range', label: 'Período Personalizado' },
                      { id: 'all', label: 'Histórico Completo' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setDateMode(mode.id as any)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap snap-start shrink-0 min-h-[38px] ${
                          dateMode === mode.id
                            ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10 font-extrabold'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="space-y-1.5 shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Status
                  </span>
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs overflow-x-auto scrollbar-none">
                    {['todos', 'pending', 'completed', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
                          filterStatus === st
                            ? 'bg-amber-500 text-zinc-950'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {st === 'todos'
                          ? 'Todos'
                          : st === 'pending'
                          ? 'Pendentes'
                          : st === 'completed'
                          ? 'Concluídos'
                          : 'Cancelados'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specific Date or Date Range Controls */}
              {dateMode === 'specific' && (
                <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-amber-500/30 w-full sm:w-auto animate-fadeIn">
                  <label className="text-xs font-bold text-amber-400 whitespace-nowrap">
                    Selecione a Data:
                  </label>
                  <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 focus:border-amber-500 px-3 py-1.5 rounded-lg text-xs text-zinc-100 outline-none"
                  />
                </div>
              )}

              {dateMode === 'range' && (
                <div className="flex flex-wrap items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-amber-500/30 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-amber-400">De:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 focus:border-amber-500 px-3 py-1.5 rounded-lg text-xs text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-amber-400">Até:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 focus:border-amber-500 px-3 py-1.5 rounded-lg text-xs text-zinc-100 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Active Filter Summary Info */}
              <div className="text-xs text-zinc-400 flex items-center justify-between font-medium">
                <span>
                  Exibindo:{' '}
                  <strong className="text-amber-400">
                    {dateMode === 'today'
                      ? `Hoje (${formatDateFormatted(new Date().toISOString().split('T')[0])})`
                      : dateMode === 'tomorrow'
                      ? 'Amanhã'
                      : dateMode === 'next7'
                      ? 'Próximos 7 Dias'
                      : dateMode === 'future'
                      ? 'Todos os Agendamentos Futuros'
                      : dateMode === 'specific'
                      ? `Data: ${formatDateFormatted(specificDate)}`
                      : dateMode === 'range'
                      ? `De ${formatDateFormatted(startDate)} até ${formatDateFormatted(endDate)}`
                      : 'Histórico Completo'}
                  </strong>
                </span>
                <span>
                  Encontrados: <strong className="text-amber-400">{appointments.length}</strong> agendamento(s)
                </span>
              </div>
            </div>

            {/* Appointments Grid */}
            {loadingApps ? (
              <div className="py-20 text-center text-zinc-400 text-xs">
                Carregando agenda...
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-20 text-center bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-400 text-xs space-y-2">
                <p className="text-sm font-bold text-zinc-300">Nenhum agendamento encontrado para o período selecionado.</p>
                <p>Você pode mudar o filtro acima ou adicionar um agendamento manual.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((app) => (
                  <div
                    key={app.id}
                    className={`bg-zinc-900 border rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all hover:border-amber-500/40 ${
                      app.status === 'completed'
                        ? 'border-green-500/20 bg-zinc-900/60'
                        : app.status === 'cancelled'
                        ? 'border-red-500/20 opacity-60'
                        : 'border-zinc-800'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Date, Time & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{formatDateFormatted(app.date)}</span>
                          <span className="text-zinc-600">•</span>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{app.time}</span>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            app.status === 'completed'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : app.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {app.status === 'completed'
                            ? 'Concluído'
                            : app.status === 'cancelled'
                            ? 'Cancelado'
                            : 'Pendente'}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-400" />
                          <span>{app.customerName}</span>
                        </h3>
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{app.customerPhone}</span>
                        </p>
                      </div>

                      {/* Services & Price */}
                      <div className="mt-4 pt-3 border-t border-zinc-800 text-xs space-y-1">
                        <p className="text-zinc-300 font-medium">
                          <strong className="text-zinc-500">Serviço(s):</strong>{' '}
                          {app.serviceNames.join(', ')}
                        </p>
                        <p className="flex justify-between items-center text-zinc-400 pt-1">
                          <span>Duração: {app.totalDurationMinutes} min</span>
                          <span className="text-amber-400 font-extrabold text-sm">{app.priceDisplay}</span>
                        </p>
                      </div>

                      {app.notes && (
                        <p className="mt-2 text-[11px] text-zinc-400 italic bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                          "{app.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/55${app.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Ol%C3%A1%20${app.customerName}!%20Confirmando%20seu%20agendamento%20na%20${config.name}%20para%20${app.date}%20%C3%A0s%20${app.time}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all text-xs font-bold flex items-center gap-1"
                        title="Enviar mensagem no WhatsApp do cliente"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>

                      <div className="flex items-center gap-1.5">
                        {app.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'completed')}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-green-600 text-zinc-300 hover:text-zinc-950 transition-all"
                            title="Marcar como Concluído"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {app.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white transition-all"
                            title="Cancelar Agendamento"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteAppointment(app.id)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-all"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GALERIA & HERO VIDEO */}
        {activeTab === 'galeria' && (
          <div className="space-y-8">
            {/* Add New Media Form */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <h3 className="text-lg font-bold font-serif uppercase text-amber-400 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Adicionar Foto ou Vídeo</span>
                </h3>

                {/* Source Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMediaSourceMode('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      mediaSourceMode === 'upload'
                        ? 'bg-amber-500 text-zinc-950 shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Anexar da Galeria</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaSourceMode('url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      mediaSourceMode === 'url'
                        ? 'bg-amber-500 text-zinc-950 shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>URL Externa</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddMedia} className="space-y-4">
                {/* Media Input Area */}
                {mediaSourceMode === 'upload' ? (
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                      Anexar Foto ou Vídeo do Dispositivo
                    </label>
                    
                    {newMediaUrl && mediaSourceMode === 'upload' ? (
                      <div className="flex items-center justify-between p-3 bg-zinc-950 border border-amber-500/40 rounded-xl">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {newMediaType === 'image' ? (
                              <img src={newMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <video src={newMediaUrl} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-200 truncate">{uploadFileName || 'Arquivo selecionado'}</p>
                            <p className="text-[10px] text-amber-400 font-semibold uppercase">
                              {newMediaType === 'video' ? 'Vídeo Selecionado' : 'Imagem Selecionada'}
                            </p>
                          </div>
                        </div>

                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-200 text-xs font-bold transition-colors">
                          <span>Trocar Arquivo</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-zinc-800 hover:border-amber-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-zinc-950/60 group">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-zinc-200">
                          {isReadingFile ? 'Carregando arquivo...' : 'Clique ou arraste uma foto ou vídeo da galeria do seu dispositivo'}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Suporta Imagens (JPG, PNG, WEBP) e Vídeos (MP4, WEBM)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">URL da Mídia ou Vídeo</label>
                    <input
                      type="url"
                      required
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder="https://exemplo.com/video.mp4 ou foto.jpg"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Título / Legenda</label>
                    <input
                      type="text"
                      value={newMediaTitle}
                      onChange={(e) => setNewMediaTitle(e.target.value)}
                      placeholder="Ex: Corte Degradê Navalhado"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Tipo de Mídia</label>
                    <select
                      value={newMediaType}
                      onChange={(e) => setNewMediaType(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="image">Foto (Imagem)</option>
                      <option value="video">Vídeo (MP4 / WebM)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={!newMediaUrl || isReadingFile}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow"
                    >
                      Salvar na Galeria
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryList.map((item) => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-4 space-y-3">
                  <div className="aspect-[16/9] bg-zinc-950 rounded-xl overflow-hidden relative">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" muted loop autoPlay />
                    )}

                    {item.isFeaturedHero && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-zinc-950 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        ★ Destaque na Home
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-zinc-200">{item.title}</h4>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    {item.type === 'video' && !item.isFeaturedHero && (
                      <button
                        onClick={() => handleSetFeatured(item.id)}
                        className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Definir Destaque da Home</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-300 ml-auto flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SERVIÇOS & PREÇOS */}
        {activeTab === 'servicos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif uppercase text-amber-400">Tabela de Serviços</h3>
                <p className="text-xs text-zinc-400">Edite preços, durações e adicione novos serviços.</p>
              </div>

              <button
                onClick={() => {
                  setEditingService({ name: '', price: 50, priceType: 'fixed', durationMinutes: 20, category: 'corte', description: '', active: true });
                  setIsServiceModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Serviço</span>
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 uppercase text-[10px] font-black tracking-wider text-amber-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Serviço</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Preço</th>
                      <th className="py-3 px-4">Duração</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {servicesList.map((srv) => (
                      <tr key={srv.id} className="hover:bg-zinc-950/50">
                        <td className="py-3 px-4 font-bold text-zinc-100">{srv.name}</td>
                        <td className="py-3 px-4 uppercase text-[10px] text-zinc-400">{srv.category}</td>
                        <td className="py-3 px-4 font-bold text-amber-400">
                          {srv.priceType === 'consult' || srv.price === null
                            ? 'Consultar valor'
                            : `R$ ${srv.price.toFixed(2).replace('.', ',')}`}
                        </td>
                        <td className="py-3 px-4">{srv.durationMinutes} min</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingService(srv);
                              setIsServiceModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white font-bold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONFIGURAÇÕES DA BARBEARIA */}
        {activeTab === 'config' && (
          <div className="max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold font-serif uppercase text-amber-400">Configurações Gerais</h3>
              <p className="text-xs text-zinc-400">Altere o nome da barbearia, endereço, telefone e horário de funcionamento.</p>
            </div>

            {configSuccess && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
                {configSuccess}
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Nome da Barbearia</label>
                <input
                  type="text"
                  required
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  placeholder="Ex: Barbearia Brave"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Slogan / Subtítulo</label>
                <input
                  type="text"
                  value={shopForm.slogan}
                  onChange={(e) => setShopForm({ ...shopForm, slogan: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={shopForm.address}
                  onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={shopForm.phone}
                    onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value, whatsapp: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Instagram (@usuario)</label>
                  <input
                    type="text"
                    value={shopForm.instagram}
                    onChange={(e) => setShopForm({ ...shopForm, instagram: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Horário de Funcionamento (Texto)</label>
                <input
                  type="text"
                  value={shopForm.openingHours}
                  onChange={(e) => setShopForm({ ...shopForm, openingHours: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-wider"
                >
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* MANUAL APPOINTMENT MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold font-serif uppercase text-amber-400">Novo Agendamento Manual</h3>
            
            <form onSubmit={handleCreateManualAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">WhatsApp</label>
                <input
                  type="text"
                  required
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Serviço Principal</label>
                <select
                  value={manualServiceIds[0] || ''}
                  onChange={(e) => setManualServiceIds([e.target.value])}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500"
                >
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.price ? `R$ ${s.price}` : 'Consultar'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold uppercase"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE EDIT/CREATE MODAL */}
      {isServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold font-serif uppercase text-amber-400">
              {editingService.id ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Tipo de Preço</label>
                  <select
                    value={editingService.priceType || 'fixed'}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        priceType: e.target.value as any,
                        price: e.target.value === 'consult' ? null : editingService.price || 50,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500"
                  >
                    <option value="fixed">Fixo (R$)</option>
                    <option value="consult">Consultar valor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    disabled={editingService.priceType === 'consult'}
                    value={editingService.price ?? ''}
                    onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500 disabled:opacity-30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    required
                    value={editingService.durationMinutes || 20}
                    onChange={(e) => setEditingService({ ...editingService, durationMinutes: parseInt(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Categoria</label>
                  <select
                    value={editingService.category || 'corte'}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500"
                  >
                    <option value="corte">Corte</option>
                    <option value="barba">Barba</option>
                    <option value="combo">Combo</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Descrição</label>
                <input
                  type="text"
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold uppercase"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
