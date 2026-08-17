import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Plus,
  Scissors,
  Sparkles,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { ServiceItem } from "../types";

interface ServicesSectionProps {
  services: ServiceItem[];
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  onOpenBooking: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  selectedServiceIds,
  onToggleService,
  onOpenBooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    "todos" | "corte" | "barba" | "combo" | "outros"
  >("todos");

  const categories = [
    { id: "todos", label: "Todos os Serviços" },
    { id: "corte", label: "Cortes & Cabelo" },
    { id: "barba", label: "Barba & Modelagem" },
    { id: "combo", label: "Combos Especiais" },
    { id: "outros", label: "Tratamentos & Estética" },
  ];

  const filteredServices = services.filter((s) => {
    if (!s.active) return false;
    if (activeCategory === "todos") return true;
    return s.category === activeCategory;
  });

  // Calculate selected total summary
  const selectedServicesList = services.filter((s) =>
    selectedServiceIds.includes(s.id),
  );
  const totalDuration = selectedServicesList.reduce(
    (acc, s) => acc + (s.durationMinutes || 0),
    0,
  );

  let hasConsult = false;
  let totalPriceFixed = 0;
  selectedServicesList.forEach((s) => {
    if (s.priceType === "consult" || s.price === null) {
      hasConsult = true;
    } else {
      totalPriceFixed += s.price;
    }
  });

  return (
    <section
      id="servicos"
      className="py-16 bg-zinc-900 border-t border-b border-zinc-800 text-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Scissors className="w-3.5 h-3.5" />
            <span>Tabela Oficial de Serviços</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif uppercase tracking-tight text-zinc-100">
            Nossos Serviços & Valores
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-2 font-light">
            Selecione um ou mais serviços desejados e clique em agendar. O
            pagamento é realizado presencialmente na barbearia.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/20 scale-105"
                  : "bg-zinc-950 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServices.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            const isConsult =
              service.priceType === "consult" || service.price === null;

            return (
              <div
                key={service.id}
                onClick={() => onToggleService(service.id)}
                className={`group relative rounded-2xl p-6 cursor-pointer border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]"
                    : "bg-zinc-950 border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-950/80 shadow-xl"
                }`}
              >
                <div>
                  {/* Top Bar: Checkbox & Category */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                      {service.category}
                    </span>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-amber-500 text-zinc-950 font-bold"
                          : "bg-zinc-900 border border-zinc-700 text-transparent group-hover:border-amber-500"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-lg font-bold text-zinc-100 group-hover:text-amber-400 transition-colors mb-2">
                    {service.name}
                  </h3>

                  {/* Description */}
                  {service.description && (
                    <p className="text-xs text-zinc-400 font-light leading-relaxed mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>

                {/* Bottom Bar: Duration & Price */}
                <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{service.durationMinutes} min</span>
                  </div>

                  <div className="text-right">
                    {isConsult ? (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                        Consultar valor
                      </span>
                    ) : (
                      <span className="text-lg font-black text-amber-400">
                        R$ {service.price?.toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Floating Bar / CTA if services chosen */}
        {selectedServiceIds.length > 0 && (
          <div className="sticky bottom-6 z-30 mt-12 p-4 sm:p-6 rounded-2xl bg-zinc-950 border-2 border-amber-500 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                {selectedServiceIds.length}{" "}
                {selectedServiceIds.length === 1
                  ? "Serviço Selecionado"
                  : "Serviços Selecionados"}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xl sm:text-2xl font-black text-zinc-100">
                  {hasConsult
                    ? totalPriceFixed > 0
                      ? `R$ ${totalPriceFixed.toFixed(2).replace(".", ",")} + Consultar`
                      : "Consultar valor"
                    : `R$ ${totalPriceFixed.toFixed(2).replace(".", ",")}`}
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  • {totalDuration} minutos de atendimento
                </span>
              </div>
            </div>

            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px]"
            >
              <Calendar className="w-4 h-4" />
              <span>Avançar para Escolher Dia & Hora</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
