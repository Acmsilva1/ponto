import { Coffee, Clock3, LogIn, LogOut, RefreshCcw, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { TimeEntryType } from '@shared/contracts';

interface ClockWidgetProps {
  onClock: (type: TimeEntryType, justification: string) => Promise<void>;
  disabled?: boolean;
  dark?: boolean;
}

const actions: Array<{
  value: TimeEntryType;
  label: string;
  icon: typeof LogIn;
}> = [
  { value: 'entrada', label: 'Entrada', icon: LogIn },
  { value: 'almoco_saida', label: 'Intervalo', icon: Coffee },
  { value: 'almoco_retorno', label: 'Retorno', icon: RefreshCcw },
  { value: 'saida', label: 'Saída', icon: LogOut }
];

function formatBrasilia(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

function formatBrasiliaDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function ClockWidget({ onClock, disabled, dark = true }: ClockWidgetProps) {
  const [now, setNow] = useState(() => new Date());
  const [justification, setJustification] = useState('');
  const [selectedType, setSelectedType] = useState<TimeEntryType>('entrada');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedAction = useMemo(
    () => actions.find((action) => action.value === selectedType) || actions[0],
    [selectedType]
  );

  async function confirmClock() {
    setLoading(true);
    try {
      await onClock(selectedType, justification);
      setJustification('');
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section
        className={`overflow-hidden rounded-[1.75rem] border shadow-[0_24px_80px_rgba(2,6,23,0.45)] ${
          dark ? 'border-white/10 bg-slate-950/85' : 'border-slate-200 bg-white shadow-sm'
        }`}
      >
        <div className="border-b border-white/10 bg-gradient-to-r from-indigo-500/15 via-transparent to-cyan-500/10 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? 'text-indigo-200/80' : 'text-slate-500'}`}>
                Relógio do sistema
              </p>
              <h3 className={`mt-2 text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Hora de Brasília</h3>
              <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {formatBrasiliaDate(now)} às {formatBrasilia(now)}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Clock3 className="h-5 w-5 text-indigo-300" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {actions.map((action) => {
              const Icon = action.icon;
              const active = selectedType === action.value;
              return (
                <button
                  key={action.value}
                  type="button"
                  disabled={disabled || loading}
                  onClick={() => setSelectedType(action.value)}
                  className={`group flex aspect-square flex-col items-center justify-center rounded-[1.5rem] border px-3 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    active
                      ? dark
                        ? 'border-indigo-400/40 bg-indigo-500/15 shadow-[0_18px_40px_rgba(79,70,229,0.2)]'
                        : 'border-indigo-300 bg-indigo-50'
                      : dark
                        ? 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-white/[0.06]'
                        : 'border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/60'
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                      active
                        ? dark
                          ? 'border-indigo-400/30 bg-indigo-500/20'
                          : 'border-indigo-200 bg-white'
                        : dark
                          ? 'border-white/10 bg-slate-950/70'
                          : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-indigo-200' : dark ? 'text-slate-300' : 'text-slate-600'}`} />
                  </span>
                  <span className={`mt-3 text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{action.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
            <label className={`mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
              Justificativa opcional
            </label>
            <textarea
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              placeholder="Se precisar, descreva o motivo ou observação da batida."
              className={`min-h-24 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                dark
                  ? 'border-white/10 bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>

          <button
            type="button"
            disabled={disabled || loading}
            onClick={() => setConfirmOpen(true)}
            className="mt-4 w-full rounded-[1.25rem] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Bater ponto
          </button>
        </div>
      </section>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.6)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-300/80">Confirmar batida</p>
                <h4 className="mt-2 text-2xl font-black text-white">{selectedAction.label}</h4>
                <p className="mt-2 text-sm text-slate-400">
                  {formatBrasiliaDate(now)} às {formatBrasilia(now)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                O sistema vai registrar a ação escolhida e enviar para a API.
              </div>
              {justification.trim() && <p className="mt-3 text-slate-400">Justificativa: {justification.trim()}</p>}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-white/[0.06]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmClock}
                disabled={loading}
                className="rounded-[1.25rem] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Confirmar e bater ponto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
