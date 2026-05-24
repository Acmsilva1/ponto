import { Coffee, Clock3, LogIn, LogOut, RefreshCcw, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { TimeEntryType } from '@shared/contracts';

type JourneyTone = 'official' | 'extra';

interface ClockWidgetProps {
  onClock: (type: TimeEntryType, justification: string) => Promise<void>;
  completedTypes?: Set<TimeEntryType>;
  disabled?: boolean;
  dark?: boolean;
  tone?: JourneyTone;
  title?: string;
  subtitle?: string;
}

const actions: Array<{
  value: TimeEntryType;
  label: string;
  description: string;
  icon: typeof LogIn;
}> = [
  { value: 'entrada', label: 'Entrada', description: 'Início da jornada', icon: LogIn },
  { value: 'almoco_saida', label: 'Início do intervalo', description: 'Saída para pausa', icon: Coffee },
  { value: 'almoco_retorno', label: 'Retorno do intervalo', description: 'Volta ao posto', icon: RefreshCcw },
  { value: 'saida', label: 'Saída final', description: 'Encerramento do expediente', icon: LogOut }
];

const theme = {
  official: {
    cardBorder: 'border-white/10',
    cardBg: 'bg-slate-950/85',
    headerFrom: 'from-indigo-500/15',
    accentText: 'text-indigo-200/80',
    badgeDot: 'bg-emerald-400',
    icon: 'text-indigo-300',
    activeButton: 'border-indigo-400/40 bg-indigo-500/15 shadow-[0_18px_40px_rgba(79,70,229,0.2)]',
    activeRing: 'border-indigo-400/30 bg-indigo-500/20',
    inactiveButton: 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-white/[0.06]',
    inactiveRing: 'border-white/10 bg-slate-950/70',
    titleAccent: 'text-white',
    confirmGradient: 'from-indigo-500 via-violet-500 to-cyan-500',
    confirmShadow: 'shadow-[0_18px_40px_rgba(79,70,229,0.35)]',
    modalBorder: 'border-white/10',
    modalBg: 'bg-slate-950',
    noteBg: 'bg-white/[0.03]',
    noteBorder: 'border-white/10',
    noteText: 'text-slate-300'
  },
  extra: {
    cardBorder: 'border-amber-400/20',
    cardBg: 'bg-slate-950/88',
    headerFrom: 'from-amber-500/15',
    accentText: 'text-amber-200/80',
    badgeDot: 'bg-amber-400',
    icon: 'text-amber-300',
    activeButton: 'border-amber-400/40 bg-amber-500/15 shadow-[0_18px_40px_rgba(245,158,11,0.2)]',
    activeRing: 'border-amber-400/30 bg-amber-500/20',
    inactiveButton: 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-amber-400/30 hover:bg-white/[0.06]',
    inactiveRing: 'border-white/10 bg-slate-950/70',
    titleAccent: 'text-white',
    confirmGradient: 'from-amber-500 via-orange-500 to-rose-500',
    confirmShadow: 'shadow-[0_18px_40px_rgba(251,146,60,0.35)]',
    modalBorder: 'border-white/10',
    modalBg: 'bg-slate-950',
    noteBg: 'bg-white/[0.03]',
    noteBorder: 'border-white/10',
    noteText: 'text-slate-300'
  }
} as const;

function formatBrasilia(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
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

export function ClockWidget({ onClock, completedTypes, disabled, dark = true, tone = 'official', title, subtitle }: ClockWidgetProps) {
  const [now, setNow] = useState(() => new Date());
  const [justification, setJustification] = useState('');
  const [selectedType, setSelectedType] = useState<TimeEntryType>('entrada');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedAction = useMemo(
    () => actions.find((action) => action.value === selectedType) || actions[0],
    [selectedType]
  );

  const completedCount = completedTypes?.size ?? 0;
  const selectedActionBlocked = completedTypes?.has(selectedType) ?? false;
  const allActionsCompleted = completedCount >= actions.length;
  const styles = theme[tone];

  useEffect(() => {
    if (!completedTypes || completedTypes.size === 0) {
      return;
    }

    if (completedTypes.has(selectedType)) {
      const nextAvailableAction = actions.find((action) => !completedTypes.has(action.value));
      setSelectedType(nextAvailableAction?.value || actions[0].value);
    }
  }, [completedTypes, selectedType]);

  async function confirmClock() {
    setLoading(true);
    setFeedback('');
    try {
      await onClock(selectedType, justification);
      setJustification('');
      setConfirmOpen(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao registrar ponto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section
        className={`overflow-hidden rounded-[1.75rem] border shadow-[0_24px_80px_rgba(2,6,23,0.45)] ${
          dark ? `${styles.cardBorder} ${styles.cardBg}` : 'border-slate-200 bg-white shadow-sm'
        }`}
      >
        <div className={`border-b ${dark ? 'border-white/10' : 'border-slate-200'} bg-gradient-to-r ${styles.headerFrom} via-transparent to-cyan-500/10 px-5 py-5`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 rounded-full border ${dark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50'} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
                <span className={`h-2 w-2 rounded-full ${styles.badgeDot}`} />
                {title || (tone === 'official' ? 'Relógio oficial' : 'Relógio extra')}
              </div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? styles.accentText : 'text-slate-500'}`}>
                  Hora de Brasília
                </p>
                <div className={`mt-2 font-mono text-4xl font-black tracking-[0.24em] ${dark ? 'text-white' : 'text-slate-900'} md:text-5xl`}>
                  {formatBrasilia(now)}
                </div>
                <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {subtitle || `${formatBrasiliaDate(now)} • atualização em tempo real`}
                </p>
              </div>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
              <Clock3 className={`h-5 w-5 ${styles.icon}`} />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {actions.map((action) => {
              const Icon = action.icon;
              const active = selectedType === action.value;

              return (
                <button
                  key={action.value}
                  type="button"
                  disabled={disabled || loading || completedTypes?.has(action.value)}
                  onClick={() => setSelectedType(action.value)}
                  className={`group flex flex-col items-center justify-start gap-3 rounded-[1.5rem] border px-3 py-4 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    active ? styles.activeButton : styles.inactiveButton
                  }`}
                >
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-full border ${
                      active ? styles.activeRing : styles.inactiveRing
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? (tone === 'official' ? 'text-indigo-200' : 'text-amber-100') : dark ? 'text-slate-300' : 'text-slate-600'}`} />
                  </span>
                  <span className={`text-sm font-semibold ${dark ? styles.titleAccent : 'text-slate-900'}`}>{action.label}</span>
                  <span className={`text-[11px] leading-5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{action.description}</span>
                </button>
              );
            })}
          </div>

          <div className={`mt-5 rounded-[1.4rem] border ${dark ? styles.noteBorder : 'border-slate-200'} ${dark ? styles.noteBg : 'bg-slate-50'} p-4`}>
            <label className={`mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
              Observação opcional
            </label>
            <textarea
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              placeholder="Se necessário, descreva o motivo ou a observação da marcação."
              className={`min-h-24 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                dark
                  ? 'border-white/10 bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>

          <button
            type="button"
            disabled={disabled || loading || selectedActionBlocked || allActionsCompleted}
            onClick={() => {
              setFeedback('');
              setConfirmOpen(true);
            }}
            className={`mt-4 w-full rounded-[1.25rem] bg-gradient-to-r ${styles.confirmGradient} px-4 py-3 text-sm font-bold text-white ${styles.confirmShadow} transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Confirmar registro
          </button>
        </div>
      </section>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-[2rem] border ${styles.modalBorder} ${styles.modalBg} p-6 shadow-[0_30px_120px_rgba(2,6,23,0.6)]`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${tone === 'official' ? 'text-indigo-300/80' : 'text-amber-300/80'}`}>
                  Confirmar marcação
                </p>
                <h4 className={`mt-2 text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{selectedAction.label}</h4>
                <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {formatBrasiliaDate(now)} às {formatBrasilia(now)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFeedback('');
                  setConfirmOpen(false);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${dark ? 'border-white/10 bg-white/[0.03] text-slate-300' : 'border-slate-200 bg-white text-slate-500'} transition hover:bg-white/[0.06]`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`mt-5 rounded-[1.4rem] border ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'} p-4 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
              <div className={`flex items-center gap-2 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
                <ShieldCheck className={`h-4 w-4 ${tone === 'official' ? 'text-emerald-300' : 'text-amber-300'}`} />
                O sistema vai registrar a marcação escolhida e enviar para a API.
              </div>
              {justification.trim() && <p className="mt-3 text-slate-400">Observação: {justification.trim()}</p>}
              {feedback && <p className="mt-3 text-rose-300">{feedback}</p>}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setFeedback('');
                  setConfirmOpen(false);
                }}
                className={`rounded-[1.25rem] border ${dark ? 'border-white/10 bg-white/[0.03] text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'} px-4 py-3 text-sm font-bold transition hover:bg-white/[0.06]`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmClock}
                disabled={loading}
                className={`rounded-[1.25rem] bg-gradient-to-r ${styles.confirmGradient} px-4 py-3 text-sm font-bold text-white ${styles.confirmShadow} transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {loading ? 'Enviando...' : 'Confirmar e registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
