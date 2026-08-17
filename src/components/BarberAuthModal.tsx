import {
  ArrowRight,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { localStore } from "../lib/storage";
import type { AuthResponse, ShopConfig } from "../types";

interface BarberAuthModalProps {
  config: ShopConfig;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authData: AuthResponse) => void;
}

export const BarberAuthModal: React.FC<BarberAuthModalProps> = ({
  config,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login Fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleDemoLogin = () => {
    setLoading(true);
    setError("");
    try {
      const res = localStore.loginBarber("barbeiro@brave.com", "123456");
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || "Erro ao entrar com conta de demonstração.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Informe o e-mail e a senha.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = localStore.loginBarber(loginEmail, loginPassword);
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || "Erro no login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPhone || !regPassword) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (regPassword.length < 4) {
      setError("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = localStore.registerBarber({
        name: regName || "Barbeiro",
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || "Erro no cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-zinc-100 my-auto">
        {/* Top Gold Accent */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

        {/* Modal Header */}
        <div className="p-6 text-center relative border-b border-zinc-800 bg-zinc-950/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black font-serif uppercase tracking-wide text-amber-400">
            Acesso do Barbeiro
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão da agenda e configuração da {config.name}
          </p>

          {/* Login / Register Tabs */}
          <div className="grid grid-cols-2 mt-5 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
            <button
              onClick={() => {
                setTab("login");
                setError("");
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                tab === "login"
                  ? "bg-amber-500 text-zinc-950 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setTab("register");
                setError("");
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                tab === "register"
                  ? "bg-amber-500 text-zinc-950 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* Quick Demo Shortcut */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Entrar com Conta de Demonstração (1-Clique)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-zinc-900 px-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest absolute">
              ou
            </span>
          </div>

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="barbeiro@brave.com"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Entrando..." : "Acessar Painel →"}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Nome do Barbeiro
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Barbeiro Brave"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seuemail@barbearia.com"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(67) 99999-8888"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Confirmar
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Cadastrando..." : "Criar Minha Conta →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
