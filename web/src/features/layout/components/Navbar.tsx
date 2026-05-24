import { LogOut, Shield, User, Clock } from 'lucide-react';
import type { Employee } from '@shared/contracts';

interface NavbarProps {
  employee: Employee;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export function Navbar({ employee, onLogout, onOpenProfile }: NavbarProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold">Ponto Digital</h1>
            <p className="text-xs text-slate-400">Backend oficial com Supabase</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2">
          {employee.accessRole === 'gestor' ? (
            <Shield className="h-4 w-4 text-indigo-400" />
          ) : (
            <User className="h-4 w-4 text-emerald-400" />
          )}
          <div className="text-right">
            <div className="text-sm font-semibold">{employee.name}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {employee.accessRole === 'gestor' ? 'Gestor' : 'Colaborador'}
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
          >
            Perfil
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="ml-2 inline-flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
