import React, { useState } from 'react';
import { Play, Volume2, VolumeX, Calendar, Sparkles, Scissors, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { ShopConfig } from '../types';

interface HeroVideoProps {
  config: ShopConfig;
  onOpenBooking: () => void;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({ config, onOpenBooking }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <section className="relative bg-zinc-950 text-zinc-100 overflow-hidden pt-6 pb-12 sm:pb-20">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Agendamento Online Rápido & Sem Espera</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-100 uppercase font-serif leading-none">
              <span className="text-amber-400">{config.name}</span>
            </h1>

            <p className="text-lg sm:text-xl font-light text-zinc-300 leading-relaxed">
              {config.slogan}
            </p>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
              {config.aboutText}
            </p>

            {/* Badges / Highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>Profissionais Especializados</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Pontualidade Garantida</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Pagamento Presencial</span>
              </div>
            </div>

            {/* Primary Action Callouts */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-base uppercase tracking-wider shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                <Calendar className="w-5 h-5" />
                <span>Agendar Meu Horário</span>
              </button>

              <a
                href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Olá! Gostaria de tirar dúvidas sobre os serviços da ${config.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 hover:border-amber-500/30"
              >
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Video Frame */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-zinc-900 shadow-2xl group">
              {/* Gold Top Accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 z-20" />

              {/* Video Element */}
              <div className="aspect-[16/10] sm:aspect-[16/9] bg-black relative">
                <video
                  src={config.heroVideoUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-all backdrop-blur-sm"
                    title={isMuted ? 'Ativar Som' : 'Desativar Som'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Video Title Overlay */}
                <div className="absolute bottom-4 left-4 right-16 z-20 text-left">
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider mb-1">
                    Vídeo em Destaque
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 drop-shadow-md">
                    {config.heroVideoTitle || 'Arte em Cortes & Estilo'}
                  </h3>
                  <p className="text-xs text-zinc-300 font-light drop-shadow line-clamp-1">
                    {config.heroVideoSubtitle || 'Confira a precisão dos nossos serviços.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
