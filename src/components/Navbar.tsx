import React from 'react';
import { Clock, HardDrive, ShieldCheck } from 'lucide-react';

export function Navbar() {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800" id="portal-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Clock className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Ponto Digital</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Chave de Segurança Certificada CLT (Portaria 671)
            </p>
          </div>
        </div>

        {/* Business and Environment Context */}
        <div className="flex items-center gap-3 bg-slate-800/60 py-1.5 px-3 rounded-lg border border-slate-700/50">
          <div className="text-right shrink-0">
            <p className="text-[11px] font-semibold text-slate-200">Painel do Colaborador</p>
            <p className="text-[9px] font-mono text-slate-400">Offline-first (LocalStorage Ativo)</p>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="bg-slate-900 px-2 py-1 rounded text-[10px] font-bold font-mono text-indigo-400 border border-slate-700">
            v1.0.4
          </div>
        </div>
      </div>
    </header>
  );
}
