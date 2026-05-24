import { Clock3, LogOut, Shield, Sparkles, User, UserRoundPen } from 'lucide-react';
import type { Employee } from '@shared/contracts';

interface NavbarProps {
  employee: Employee;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export function Navbar({ employee, onLogout, onOpenProfile }: NavbarProps) {
  const isManager = employee.accessRole === 'gestor';

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)]">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">Ponto Digital</h1>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                {isManager ? 'Gestor' : 'Colaborador'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Plataforma oficial com backend e Supabase</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 md:flex">
            {isManager ? <Shield className="h-4 w-4 text-indigo-300" /> : <User className="h-4 w-4 text-emerald-300" />}
            <div>
              <div className="text-sm font-semibold text-white">{employee.name}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{employee.registryId}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-500/20"
          >
            <UserRoundPen className="h-4 w-4" />
            Perfil
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
