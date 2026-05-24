import { BadgeCheck, Lock } from 'lucide-react';
import { useMemo } from 'react';
import type { TimeEntry, TimeEntryType } from '@shared/contracts';
import { ClockWidget } from '../../time-entries/components/ClockWidget.js';
import { MonthlyTimesheetCard } from '../../time-entries/components/MonthlyTimesheetCard.js';

type JourneyTone = 'official' | 'extra';

interface CollaboratorWorkspaceProps {
  timeEntries: TimeEntry[];
  officialEntries: TimeEntry[];
  extraEntries: TimeEntry[];
  onClockOfficial: (type: TimeEntryType, justification: string) => Promise<void>;
  onClockExtra: (type: TimeEntryType, justification: string) => Promise<void>;
}

const punchOrder: TimeEntryType[] = ['entrada', 'almoco_saida', 'almoco_retorno', 'saida'];

const punchLabels: Record<TimeEntryType, string> = {
  entrada: 'Entrada',
  almoco_saida: 'Início do intervalo',
  almoco_retorno: 'Retorno do intervalo',
  saida: 'Saída final'
};

const toneStyles: Record<
  JourneyTone,
  {
    headerFrom: string;
    headerTo: string;
    titleAccent: string;
    progressFrom: string;
    progressVia: string;
    progressTo: string;
    doneBorder: string;
    doneBg: string;
    doneText: string;
    iconBg: string;
    iconText: string;
    cardBorder: string;
    mutedBg: string;
    mutedText: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  official: {
    headerFrom: 'from-emerald-500/10',
    headerTo: 'to-cyan-500/10',
    titleAccent: 'text-emerald-200/80',
    progressFrom: 'from-emerald-400',
    progressVia: 'via-indigo-500',
    progressTo: 'to-cyan-400',
    doneBorder: 'border-emerald-400/30',
    doneBg: 'bg-emerald-400/10',
    doneText: 'text-emerald-100',
    iconBg: 'bg-white/5',
    iconText: 'text-emerald-300',
    cardBorder: 'border-white/10',
    mutedBg: 'bg-white/[0.03]',
    mutedText: 'text-slate-400',
    badgeBg: 'bg-white/[0.04]',
    badgeText: 'text-slate-500'
  },
  extra: {
    headerFrom: 'from-amber-500/10',
    headerTo: 'to-orange-500/10',
    titleAccent: 'text-amber-200/80',
    progressFrom: 'from-amber-400',
    progressVia: 'via-orange-500',
    progressTo: 'to-rose-500',
    doneBorder: 'border-amber-400/30',
    doneBg: 'bg-amber-500/10',
    doneText: 'text-amber-100',
    iconBg: 'bg-white/5',
    iconText: 'text-amber-300',
    cardBorder: 'border-amber-400/20',
    mutedBg: 'bg-white/[0.03]',
    mutedText: 'text-slate-400',
    badgeBg: 'bg-white/[0.04]',
    badgeText: 'text-slate-500'
  }
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

function JourneyProgressCard({
  tone,
  entries,
  now,
  title,
  subtitle,
  locked
}: {
  tone: JourneyTone;
  entries: TimeEntry[];
  now: Date;
  title: string;
  subtitle: string;
  locked?: boolean;
}) {
  const styles = toneStyles[tone];
  const completedTypes = useMemo(() => new Set(entries.map((entry) => entry.type)), [entries]);
  const progress = Math.min(entries.length / punchOrder.length, 1);
  const latestEntry = entries.at(-1);

  return (
    <section className={`overflow-hidden rounded-[1.75rem] border shadow-[0_24px_80px_rgba(2,6,23,0.35)] ${styles.cardBorder} bg-slate-950/85`}>
      <div className={`border-b border-white/10 bg-gradient-to-r ${styles.headerFrom} via-transparent ${styles.headerTo} px-5 py-4`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${styles.titleAccent}`}>{title}</p>
            <h3 className="mt-2 text-xl font-black text-white">Progresso em tempo real</h3>
            <p className="mt-1 text-sm text-slate-400">
              {subtitle}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {entries.length} de 4 marcações realizadas em {getBrasiliaTime(now)}
            </p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 ${styles.iconBg}`}>
            {locked ? <Lock className={`h-5 w-5 ${styles.iconText}`} /> : <BadgeCheck className={`h-5 w-5 ${styles.iconText}`} />}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${styles.progressFrom} ${styles.progressVia} ${styles.progressTo} transition-all`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {punchOrder.map((type, index) => {
            const done = completedTypes.has(type);
            const item = entries.find((entry) => entry.type === type);

            return (
              <article
                key={type}
                className={`rounded-[1.25rem] border px-4 py-4 transition ${
                  done ? `${styles.doneBorder} ${styles.doneBg}` : `${styles.cardBorder} bg-white/[0.03]`
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Etapa {index + 1}</p>
                <h4 className="mt-2 text-sm font-bold text-white">{punchLabels[type]}</h4>
                <p className={`mt-2 text-sm ${done ? styles.doneText : styles.mutedText}`}>
                  {done && item ? getBrasiliaTime(new Date(item.timestamp)) : locked ? 'Bloqueada' : 'Pendente'}
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

        {locked && (
          <div className="mt-4 rounded-[1.25rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            A jornada extra só fica ativa depois da saída final do período oficial.
          </div>
        )}
      </div>
    </section>
  );
}

export function CollaboratorWorkspace({
  timeEntries,
  officialEntries,
  extraEntries,
  onClockOfficial,
  onClockExtra
}: CollaboratorWorkspaceProps) {
  const now = new Date();
  const extraUnlocked = officialEntries.some((entry) => entry.type === 'saida');

  return (
    <section className="space-y-6">
      <ClockWidget
        tone="official"
        title="Relógio oficial"
        subtitle="Use esta jornada para as 4 batidas do expediente"
        onClock={onClockOfficial}
        completedTypes={new Set(officialEntries.map((entry) => entry.type))}
      />
      <JourneyProgressCard tone="official" entries={officialEntries} now={now} title="Jornada do dia" subtitle="Progresso oficial" />

      <ClockWidget
        tone="extra"
        title="Relógio extra"
        subtitle="Mesmo formato da jornada acima, porém só ativa após a saída final"
        onClock={onClockExtra}
        completedTypes={new Set(extraEntries.map((entry) => entry.type))}
        disabled={!extraUnlocked}
      />
      <JourneyProgressCard
        tone="extra"
        entries={extraEntries}
        now={now}
        title="Jornada extra"
        subtitle="Batidas realizadas após o expediente"
        locked={!extraUnlocked}
      />

      <MonthlyTimesheetCard entries={timeEntries} />
    </section>
  );
}
