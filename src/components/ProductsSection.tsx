import { MessageSquare, Package, Sparkles } from "lucide-react";
import type React from "react";
import type { ShopConfig } from "../types";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  badge?: string;
}

const PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    name: "Pomada Modeladora",
    price: 35.0,
    category: "Cabelo",
    description:
      "Fixação forte e acabamento natural matte. Ideal para estruturar o penteado durante o dia todo.",
    badge: "Mais Vendido",
  },
  {
    id: "prod-2",
    name: "Leave-in Capilar",
    price: 50.0,
    category: "Cabelo",
    description:
      "Tratamento sem enxágue para hidratação profunda, proteção térmica e controle de frizz dos fios.",
    badge: "Premium",
  },
  {
    id: "prod-3",
    name: "Óleo para Barba",
    price: 40.0,
    category: "Barba",
    description:
      "Fórmula com óleos essenciais nutritivos que amaciam a barba, doam brilho e hidratam a pele.",
    badge: "Essencial",
  },
  {
    id: "prod-4",
    name: "Balm para Barba",
    price: 40.0,
    category: "Barba",
    description:
      "Modela, alinha os fios rebeldes e reduz a coceira do crescimento da barba com toque seco.",
    badge: "Alinhamento",
  },
];

interface ProductsSectionProps {
  config: ShopConfig;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({ config }) => {
  const getWaNum = () => {
    const raw = config.whatsapp
      ? config.whatsapp.replace(/\D/g, "")
      : "5567993106619";
    return raw.startsWith("55") ? raw : `55${raw}`;
  };

  const handleOrderProduct = (product: ProductItem) => {
    const whatsappNum = getWaNum();
    const text = encodeURIComponent(
      `Olá! Tenho interesse no produto *${product.name}* (R$ ${product.price.toFixed(2).replace(".", ",")}) na ${config.name}.`,
    );
    window.open(`https://wa.me/${whatsappNum}?text=${text}`, "_blank");
  };

  return (
    <section
      id="produtos"
      className="py-16 bg-zinc-950 border-t border-zinc-900 text-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Package className="w-3.5 h-3.5" />
            <span>Linha Exclusiva de Cuidados</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif uppercase tracking-tight text-zinc-100">
            Produtos & Finalizadores
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-2 font-light">
            Mantenha o estilo do seu cabelo e barba impecáveis em casa com os
            mesmos produtos de alta qualidade usados na nossa bancada.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="group relative rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                    {prod.category}
                  </span>
                  {prod.badge && (
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                      {prod.badge}
                    </span>
                  )}
                </div>

                {/* Title & Price */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-zinc-100 group-hover:text-amber-400 transition-colors font-serif">
                    {prod.name}
                  </h3>
                  <div className="mt-1">
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      R$ {prod.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed font-light mb-6">
                  {prod.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOrderProduct(prod)}
                className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/30 hover:border-amber-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md group/btn min-h-[44px]"
              >
                <MessageSquare className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                <span>Consultar via WhatsApp</span>
              </button>
            </div>
          ))}
        </div>

        {/* Quality Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-200">
                Adquira na sua visita ou solicite entrega
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Todos os produtos estão disponíveis para compra direta durante o
                atendimento na barbearia.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${getWaNum()}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre os produtos da ${config.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all shrink-0 text-center min-h-[44px]"
          >
            Falar com Barbeiro
          </a>
        </div>
      </div>
    </section>
  );
};
