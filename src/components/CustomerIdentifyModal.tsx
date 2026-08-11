import React, { useState } from 'react';
import { User, Phone, CheckCircle2, Scissors, ArrowRight } from 'lucide-react';
import { Customer, ShopConfig } from '../types';
import { api } from '../lib/api';

interface CustomerIdentifyModalProps {
  config: ShopConfig;
  isOpen: boolean;
  onSuccess: (customer: Customer) => void;
  onClose?: () => void;
}

export const CustomerIdentifyModal: React.FC<CustomerIdentifyModalProps> = ({
  config,
  isOpen,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Format Brazilian Phone Number automatically
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Por favor, informe um número de WhatsApp válido com DDD.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const customer = await api.identifyCustomer(fullName.trim(), phone);
      // Save locally for future visits
      localStorage.setItem('barber_customer_data', JSON.stringify(customer));
      onSuccess(customer);
    } catch (err: any) {
      setError(err.message || 'Erro ao identificar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden text-zinc-100">
        {/* Top Gold Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
            <Scissors className="w-7 h-7 -rotate-45" />
          </div>
          <h2 className="text-2xl font-black font-serif text-amber-400 uppercase tracking-wide">
            Identificação do Cliente
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Informe seus dados para prosseguir com os agendamentos na{' '}
            <span className="text-zinc-200 font-semibold">{config.name}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Nome Completo
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Gabriel Silva"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              WhatsApp / Telefone
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(67) 99999-8888"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Usado apenas para confirmação e envio dos seus lembretes pelo WhatsApp.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>Salvando...</span>
            ) : (
              <>
                <span>Continuar para o Site</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-center text-zinc-600 mt-4">
          🔒 Seus dados ficam salvos para futuras visitas. Não exigimos senhas.
        </p>
      </div>
    </div>
  );
};
