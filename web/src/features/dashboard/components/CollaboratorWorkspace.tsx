import { BadgeCheck, CheckCircle2, Circle, Timer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { TimeEntry, TimeEntryType } from '@shared/contracts';
import { ClockWidget } from '../../time-entries/components/ClockWidget.js';
import { MonthlyTimesheetCard } from '../../time-entries/components/MonthlyTimesheetCard.js';

type OfficialTimeEntryType = Exclude<TimeEntryType, 'extra'>;

interface CollaboratorWorkspaceProps {
  timeEntries: TimeEntry[];
  officialEntries: TimeEntry[];
  extraEntries: TimeEntry[];
  onClock: (type: OfficialTimeEntryType, justification: string) => Promise<void>;
  onClockExtra: () => Promise<void>;
}

const punchOrder: OfficialTimeEntryType[] = ['entrada', 'almoco_saida', 'almoco_retorno', 'saida'];

const punchLabels: Record<OfficialTimeEntryType, string> = {
  entrada: 'Entrada',
  almoco_saida: 'Início do intervalo',
  almoco_retorno: 'Retorno do intervalo',
  saida: 'Saída final'
};

function getBrasiliaTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).format(date);
}

export function CollaboratorWorkspace({
  timeEntries,
  officialEntries,
  extraEntries,
  onClock,
  onClockExtra
}: CollaboratorWorkspaceProps) {
  const now = new Date();
  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraBusy, setExtraBusy] = useState(false);
  const [extraFeedback, setExtraFeedback] = useState('');

  const completedTypes = useMemo(
    () => new Set(officialEntries.map((entry) => entry.type as OfficialTimeEntryType)),
    [officialEntries]
  );
  const progress = Math.min(officialEntries.length / punchOrder.length, 1);
  const latestOfficialEntry = officialEntries.at(-1);
  const latestExtraEntry = extraEntries.at(-1);
  const officialExitEntry = officialEntries.find((entry) => entry.type === 'saida');
  const extraAvailable = Boolean(officialExitEntry);

  useEffect(() => {
    if (!extraAvailable) {
      setExtraEnabled(false);
    }
  }, [extraAvailable]);

  async function toggleExtraMode() {
    if (!extraAvailable) {
      setExtraFeedback('O período de trabalho vigente está em atividade ainda.');
      return;
    }

    setExtraFeedback('');
    setExtraEnabled((current) => !current);
  }

  async function handleRegisterExtra() {
    setExtraBusy(true);
    setExtraFeedback('');
    try {
      await onClockExtra();
    } catch (error) {
      setExtraFeedback(error instanceof Error ? error.message : 'Falha ao registrar hora extra.');
    } finally {
      setExtraBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <ClockWidget onClock={onClock} completedTypes={completedTypes} />

      <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/85 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
        <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Jornada do dia</p>
              <h3 className="mt-2 text-xl font-black text-white">Progresso em tempo real</h3>
              <p className="mt-1 text-sm text-slate-400">
                {officialEntries.length} de 4 marcações realizadas em {getBrasiliaTime(now)}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <BadgeCheck className="h-5 w-5 text-emerald-300" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-cyan-400 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {punchOrder.map((type, index) => {
              const done = completedTypes.has(type);
              const item = officialEntries.find((entry) => entry.type === type);

              return (
                <article
                  key={type}
                  className={`rounded-[1.25rem] border px-4 py-4 transition ${
                    done ? 'border-emerald-400/30 bg-emerald-400/10' : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Etapa {index + 1}</p>
                  <h4 className="mt-2 text-sm font-bold text-white">{punchLabels[type]}</h4>
                  <p className={`mt-2 text-sm ${done ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {done && item ? getBrasiliaTime(new Date(item.timestamp)) : 'Pendente'}
                  </p>
                </article>
              );
            })}
          </div>

          {latestOfficialEntry && (
            <p className="mt-4 text-xs text-slate-400">
              Última marcação de hoje: {punchLabels[latestOfficialEntry.type as OfficialTimeEntryType]} às{' '}
              {getBrasiliaTime(new Date(latestOfficialEntry.timestamp))}.
            </p>
          )}
        </div>
      </section>

      <section
        className={`overflow-hidden rounded-[1.75rem] border shadow-[0_24px_80px_rgba(2,6,23,0.35)] ${
          extraEnabled && extraAvailable ? 'border-amber-400/20 bg-amber-500/10' : 'border-white/10 bg-slate-950/85'
        }`}
      >
        <div className="border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">Batidas extra</p>
              <h3 className="mt-2 text-xl font-black text-white">Horas extras</h3>
              <p className="mt-1 text-sm text-slate-400">
                {extraAvailable
                  ? 'Clique no check para liberar e registrar as horas após a saída final.'
                  : 'O período de trabalho vigente está em atividade ainda.'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleExtraMode}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                extraEnabled && extraAvailable
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                  : 'border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              {extraEnabled && extraAvailable ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="p-5">
          <div
            className={`rounded-[1.4rem] border p-4 ${
              extraEnabled && extraAvailable ? 'border-amber-400/20 bg-amber-500/10' : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Estado</p>
                <h4 className="mt-2 text-sm font-bold text-white">
                  {extraEnabled && extraAvailable ? 'Extra liberado' : 'Extra bloqueado'}
                </h4>
                <p className="mt-2 text-sm text-slate-400">
                  {extraEnabled && extraAvailable
                    ? 'O sistema vai registrar somente marcações após a saída final do período oficial.'
                    : 'Aguarde a saída final e depois ative este quadro para começar a registrar o extra.'}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Timer className="h-5 w-5 text-amber-300" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Batidas extras hoje</p>
                <p className="mt-1 text-2xl font-black text-white">{extraEntries.length}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Última extra</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {latestExtraEntry ? getBrasiliaTime(new Date(latestExtraEntry.timestamp)) : 'Nenhuma'}
                </p>
              </div>
            </div>

            {extraFeedback && <p className="mt-4 text-sm text-rose-300">{extraFeedback}</p>}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={toggleExtraMode}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  extraEnabled && extraAvailable
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                    : 'border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06]'
                }`}
              >
                {extraEnabled && extraAvailable ? 'Extra ativado' : 'Ativar extra'}
              </button>
              <button
                type="button"
                onClick={handleRegisterExtra}
                disabled={!extraEnabled || !extraAvailable || extraBusy}
                className="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-2 text-sm font-bold text-white shadow-[0_18px_40px_rgba(251,146,60,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {extraBusy ? 'Registrando...' : 'Registrar hora extra'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <MonthlyTimesheetCard entries={timeEntries} />
    </section>
  );
}
