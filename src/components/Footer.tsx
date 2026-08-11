import React from 'react';
import { Scissors, MapPin, Phone, Clock, Instagram, ShieldCheck, MessageSquare } from 'lucide-react';
import { ShopConfig } from '../types';

interface FooterProps {
  config: ShopConfig;
  onOpenBooking: () => void;
  onSwitchRole: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onOpenBooking, onSwitchRole }) => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-100 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-zinc-900">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 flex items-center justify-center shadow-lg">
                <div className="w-full h-full bg-zinc-900 rounded-[10px] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-amber-400 -rotate-45" />
                </div>
              </div>
              <h2 className="text-xl font-black font-serif uppercase tracking-wider text-amber-400">
                {config.name}
              </h2>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-light max-w-sm">
              {config.slogan}. Oferecemos serviços de barbearia com padrão de excelência, ambiente climatizado e agendamento sem filas.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 transition-all"
              >
                Agendar Horário Online
              </button>
            </div>
          </div>

          {/* Info & Location Col */}
          <div className="md:col-span-4 space-y-3 text-xs text-zinc-300">
            <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-amber-400 mb-3">
              Atendimento & Localização
            </h3>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{config.address}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{config.openingHours}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{config.phone}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {config.whatsapp && (
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá! Gostaria de tirar dúvidas sobre os serviços da ${config.name}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:underline"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp ({config.phone})</span>
                </a>
              )}

              {config.instagram && (
                <a
                  href={`https://instagram.com/${config.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-400 font-bold hover:underline"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{config.instagram}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 text-xs text-zinc-400">
            <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-amber-400 mb-3">
              Acesso Rápido
            </h3>

            <ul className="space-y-2">
              <li>
                <button onClick={onOpenBooking} className="hover:text-amber-400 transition-colors">
                  • Agendar Corte ou Barba
                </button>
              </li>
              <li>
                <a href="#servicos" className="hover:text-amber-400 transition-colors">
                  • Ver Tabela de Preços
                </a>
              </li>
              <li>
                <a href="#produtos" className="hover:text-amber-400 transition-colors">
                  • Linha de Produtos
                </a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-amber-400 transition-colors">
                  • Ver Fotos e Vídeos dos Trabalhos
                </a>
              </li>
              <li>
                <button onClick={onSwitchRole} className="hover:text-amber-400 transition-colors flex items-center gap-1 mt-2 font-bold text-amber-500">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Área do Barbeiro / Login</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 text-center text-[11px] text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {config.name}. Todos os direitos reservados.</p>
          <p className="text-zinc-500">
            Sistema de Agendamento Online • {config.name}
          </p>
        </div>
      </div>
    </footer>
  );
};
