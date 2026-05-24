import { BadgeCheck } from 'lucide-react';
import type { TimeEntry, TimeEntryType } from '@shared/contracts';
import { ClockWidget } from '../../time-entries/components/ClockWidget.js';
import { MonthlyTimesheetCard } from '../../time-entries/components/MonthlyTimesheetCard.js';

interface CollaboratorWorkspaceProps {
  timeEntries: TimeEntry[];
  onClock: (type: TimeEntryType, justification: string) => Promise<void>;
}

const punchOrder: TimeEntryType[] = ['entrada', 'almoco_saida', 'almoco_retorno', 'saida'];

const punchLabels: Record<TimeEntryType, string> = {
  entrada: 'Entrada',
  almoco_saida: 'Início do intervalo',
  almoco_retorno: 'Retorno do intervalo',
  saida: 'Saída final'
};

function getBrasiliaDateKey(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value || '0000';
  const month = parts.find((part) => part.type === 'month')?.value || '00';
  const day = parts.find((part) => part.type === 'day')?.value || '00';

  return `${year}-${month}-${day}`;
}

function getBrasiliaTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).format(date);
}

export function CollaboratorWorkspace({ timeEntries, onClock }: CollaboratorWorkspaceProps) {
  const now = new Date();
  const todayKey = getBrasiliaDateKey(now);
  const todayEntries = [...timeEntries]
    .filter((entry) => getBrasiliaDateKey(new Date(entry.timestamp)) === todayKey)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp));

  const completedTypes = new Set(todayEntries.map((entry) => entry.type));
  const progress = Math.min(todayEntries.length / punchOrder.length, 1);
  const latestEntry = todayEntries.at(-1);

  return (
    <section className="space-y-6">
      <ClockWidget onClock={onClock} />

      <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/85 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
        <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Jornada do dia</p>
              <h3 className="mt-2 text-xl font-black text-white">Progresso em tempo real</h3>
              <p className="mt-1 text-sm text-slate-400">
                {todayEntries.length} de 4 marcações realizadas em {getBrasiliaTime(now)}
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
              const item = todayEntries.find((entry) => entry.type === type);

              return (
                <article
                  key={type}
                  className={`rounded-[1.25rem] border px-4 py-4 transition ${
                    done
                      ? 'border-emerald-400/30 bg-emerald-400/10'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Etapa {index + 1}
                  </p>
                  <h4 className="mt-2 text-sm font-bold text-white">{punchLabels[type]}</h4>
                  <p className={`mt-2 text-sm ${done ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {done ? getBrasiliaTime(new Date(item!.timestamp)) : 'Pendente'}
                  </p>
                </article>
              );
            })}
          </div>

          {latestEntry && (
            <p className="mt-4 text-xs text-slate-400">
              Última marcação de hoje: {punchLabels[latestEntry.type]} às {getBrasiliaTime(new Date(latestEntry.timestamp))}.
            </p>
          )}
        </div>
      </section>

      <MonthlyTimesheetCard entries={timeEntries} />
    </section>
  );
}
