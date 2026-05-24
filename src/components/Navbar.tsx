import React from 'react';
import { Clock, LogOut, User, Shield } from 'lucide-react';
import { Employee } from '../types';

interface NavbarProps {
  currentUser?: Employee | null;
  activeRole?: 'colaborador' | 'gestor' | null;
  onLogout?: () => void;
}

export function Navbar({ currentUser, activeRole, onLogout }: NavbarProps) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 animate-slide-down" id="portal-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Clock className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Ponto Digital</h1>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 bg-slate-800/60 py-1.5 px-3 rounded-lg border border-slate-700/50">
            <div className="text-right shrink-0">
              <p className="text-[11px] font-bold text-slate-100 flex items-center justify-end gap-1">
                {activeRole === 'gestor' ? (
                  <>
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span className="text-indigo-400 font-semibold">[Gestor]</span> {currentUser.name.split(' ')[0]}
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-emerald-400" />
                    <span>{currentUser.name}</span>
                  </>
                )}
              </p>
              <p className="text-[9px] font-mono text-slate-400">
                Ativo como: {activeRole === 'gestor' ? 'Administrador' : 'Colaborador'}
              </p>
            </div>

            <div className="h-6 w-px bg-slate-700" />

            <button
              onClick={onLogout}
              id="btn-navbar-logout"
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 py-1 px-2.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 transition cursor-pointer"
              title="Desconectar do painel atual"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
