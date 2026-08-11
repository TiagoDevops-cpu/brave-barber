import React from 'react';
import { Scissors, UserCheck, ShieldCheck, Sparkles, MapPin, Clock, Phone, Calendar, ArrowRight } from 'lucide-react';
import { ShopConfig } from '../types';

interface RoleSelectorProps {
  config: ShopConfig;
  onSelectRole: (role: 'client' | 'barber') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ config, onSelectRole }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20 flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
        {/* Brand Icon Badge */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-1 shadow-2xl shadow-amber-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-xl flex items-center justify-center border border-amber-500/30">
              <Scissors className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 -rotate-45" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-zinc-950 p-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 fill-zinc-950" />
          </div>
        </div>

        {/* Title & Shop Name */}
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-400 mb-2">
          Bem-vindo à
        </span>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-100 uppercase font-serif mb-4">
          {config.name}
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-light leading-relaxed mb-8 sm:mb-10">
          {config.slogan}. Agende seu horário com rapidez, escolha seus serviços e garanta seu atendimento de forma simples e rápida.
        </p>

        {/* PROMINENT "SOU CLIENTE" HERO CTA CARD */}
        <div className="w-full max-w-lg mb-8">
          <button
            onClick={() => onSelectRole('client')}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600 p-8 text-left transition-all duration-300 shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.99] border border-amber-400/50"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-bl-full pointer-events-none group-hover:bg-white/20 transition-colors" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950/90 text-amber-400 flex items-center justify-center shadow-inner border border-amber-400/30">
                <UserCheck className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-sm text-amber-400 text-[11px] font-black uppercase tracking-wider border border-amber-500/30">
                Agendamento Online
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight uppercase font-serif mb-2">
              Sou Cliente
            </h2>
            <p className="text-sm text-zinc-950/80 leading-relaxed font-semibold mb-6 max-w-md">
              Ver serviços, escolher data e horário disponível, e agendar seu atendimento em poucos segundos.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-zinc-950 text-amber-400 font-bold text-xs uppercase tracking-wider group-hover:bg-zinc-900 transition-colors shadow-lg">
              <Calendar className="w-4 h-4" />
              <span>Entrar e Agendar Horário</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-xs text-zinc-400">
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center justify-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{config.address.split('-')[0] || config.address}</span>
          </div>
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{config.openingHours}</span>
          </div>
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center justify-center gap-2">
            <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{config.phone}</span>
          </div>
        </div>
      </div>

      {/* Footer Info & Discreet Barber Link */}
      <div className="border-t border-zinc-900 bg-zinc-950/90 py-5 px-4 z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p className="text-[11px] text-zinc-600">
            © {new Date().getFullYear()} {config.name}. Todos os direitos reservados.
          </p>

          {/* Discreet Barber Access Link */}
          <button
            onClick={() => onSelectRole('barber')}
            className="group inline-flex items-center gap-1.5 text-zinc-600 hover:text-amber-400 text-[11px] font-medium transition-colors opacity-75 hover:opacity-100 py-1 px-2 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
            title="Acesso administrativo para gerenciar agendamentos e configurações"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
            <span>Área do Barbeiro</span>
          </button>
        </div>
      </div>
    </div>
  );
};

