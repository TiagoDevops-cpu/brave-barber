import {
  Calendar,
  Image as ImageIcon,
  LogOut,
  MapPin,
  Phone,
  Scissors,
  Shield,
  User,
} from "lucide-react";
import type React from "react";
import type { Customer, ShopConfig } from "../types";

interface HeaderProps {
  config: ShopConfig;
  customer: Customer | null;
  barberToken: string | null;
  onOpenBooking: () => void;
  onOpenCustomerAppointments: () => void;
  onOpenGallery: () => void;
  onSwitchRole: () => void;
  onLogoutBarber: () => void;
  activeRole: "client" | "barber" | null;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  customer,
  barberToken,
  onOpenBooking,
  onOpenCustomerAppointments,
  onOpenGallery,
  onSwitchRole,
  onLogoutBarber,
  activeRole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-amber-500/20 text-zinc-100 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div
          onClick={onSwitchRole}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
          title="Clique para alternar perfil"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full bg-zinc-900 rounded-[7px] flex items-center justify-center">
              <Scissors className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 -rotate-45" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-2xl font-black tracking-wider uppercase font-serif text-amber-400 group-hover:text-amber-300 transition-colors leading-tight">
              {config.name}
            </h1>
            <p className="hidden sm:block text-xs text-zinc-400 font-medium">
              {config.slogan}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {activeRole === "client" && (
            <>
              {customer && (
                <button
                  onClick={onOpenCustomerAppointments}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-all min-h-[40px] sm:min-h-[44px]"
                  title="Ver Meus Agendamentos"
                >
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Meus Agendamentos</span>
                  <span className="sm:hidden text-[11px]">Agenda</span>
                </button>
              )}

              <button
                onClick={onOpenBooking}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 min-h-[40px] sm:min-h-[44px]"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Agendar</span>
              </button>
            </>
          )}

          {activeRole === "barber" && barberToken && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" />
                Painel do Barbeiro
              </span>
              <button
                onClick={onLogoutBarber}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-red-400 hover:text-red-300 transition-all"
                title="Sair da Conta de Barbeiro"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}

          <button
            onClick={onSwitchRole}
            className="p-2 sm:p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Alternar Perfil (Cliente / Barbeiro)"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
