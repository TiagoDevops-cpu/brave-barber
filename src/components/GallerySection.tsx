import React, { useState } from 'react';
import { Play, Sparkles, Image as ImageIcon, X, Scissors } from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  const [activeMedia, setActiveMedia] = useState<GalleryItem | null>(null);

  return (
    <section id="galeria" className="py-16 bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Resultados & Trabalhos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif uppercase tracking-tight text-zinc-100">
            Galeria da Barbearia
          </h2>
          <p className="text-sm text-zinc-400 mt-2 font-light">
            Confira a qualidade dos nossos cortes, barbas e transformações realizadas no dia a dia.
          </p>
        </div>

        {/* Gallery Grid */}
        {gallery.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 max-w-md mx-auto">
            <ImageIcon className="w-10 h-10 text-amber-500/60 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-200">Nenhuma imagem na galeria no momento.</p>
            <p className="text-xs text-zinc-400 mt-1">O barbeiro pode adicionar fotos e vídeos dos trabalhos diretamente no painel administrativo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveMedia(item)}
                className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 cursor-pointer shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] bg-zinc-950 relative overflow-hidden">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full relative">
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-zinc-950/40 group-hover:bg-zinc-950/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-zinc-950 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {item.isFeaturedHero && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow">
                        ★ Destaque Home
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-md bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                      {item.type === 'video' ? 'Vídeo' : 'Foto'}
                    </span>
                  </div>
                </div>

                {/* Title Strip */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800/80">
                  <h3 className="text-sm font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Media Lightbox Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-zinc-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-2 sm:p-4 bg-black flex items-center justify-center">
              {activeMedia.type === 'video' ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="max-h-[75vh] w-full object-contain rounded-lg"
                />
              ) : (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.title}
                  className="max-h-[75vh] w-full object-contain rounded-lg"
                />
              )}
            </div>

            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100">
                {activeMedia.title}
              </h3>
              <span className="text-xs text-amber-400 font-semibold uppercase">
                {activeMedia.type === 'video' ? 'Vídeo da Barbearia' : 'Foto do Trabalho'}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
