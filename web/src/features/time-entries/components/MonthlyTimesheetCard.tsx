import { CalendarDays, Clock3, Layers3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { TimeEntry, TimeEntryType } from '@shared/contracts';

interface MonthlyTimesheetCardProps {
  entries: TimeEntry[];
  dark?: boolean;
}

const typeLabel: Record<TimeEntryType, string> = {
  entrada: 'Entrada',
  almoco_saida: 'Início do intervalo',
  almoco_retorno: 'Retorno do intervalo',
  saida: 'Saída final'
};

const typeOrder: TimeEntryType[] = ['entrada', 'almoco_saida', 'almoco_retorno', 'saida'];

function getBrasiliaParts(date: Date) {
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

  return [year, month, day];
}

function getBrasiliaDateKey(date: Date) {
  const [year, month, day] = getBrasiliaParts(date);
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

function getBrasiliaDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00-03:00`);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  })
    .format(date)
    .replace('.', '');
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function MonthlyTimesheetCard({ entries, dark = true }: MonthlyTimesheetCardProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(interval);
  }, []);

  const monthKey = getBrasiliaDateKey(now).slice(0, 7);

  const monthEntries = useMemo(
    () =>
      [...entries]
        .filter((entry) => getBrasiliaDateKey(new Date(entry.timestamp)).startsWith(monthKey))
        .sort((left, right) => left.timestamp.localeCompare(right.timestamp)),
    [entries, monthKey]
  );

  const rows = useMemo(() => {
    const map = new Map<string, Record<TimeEntryType, string>>();

    for (const entry of monthEntries) {
      const dateKey = getBrasiliaDateKey(new Date(entry.timestamp));
      const current = map.get(dateKey) || {
        entrada: '-',
        almoco_saida: '-',
        almoco_retorno: '-',
        saida: '-'
      };

      current[entry.type] = getBrasiliaTime(new Date(entry.timestamp));
      map.set(dateKey, current);
    }

    return [...map.entries()]
      .map(([dateKey, value]) => ({ dateKey, value }))
      .sort((left, right) => right.dateKey.localeCompare(left.dateKey));
  }, [monthEntries]);

  const currentMonthLabel = getMonthLabel(now);
  const daysWithEntries = rows.length;
  const latestEntry = monthEntries.at(-1);
  const lastRefresh = getBrasiliaTime(now);

  return (
    <section
      className={`overflow-hidden rounded-[1.75rem] border shadow-[0_24px_80px_rgba(2,6,23,0.35)] ${
        dark ? 'border-white/10 bg-slate-950/85' : 'border-slate-200 bg-white shadow-sm'
      }`}
    >
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/10 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? 'text-cyan-200/80' : 'text-slate-500'}`}>
              Folha de ponto
            </p>
            <h3 className={`mt-2 text-xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Mês atual</h3>
            <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentMonthLabel} • atualização em tempo real
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <CalendarDays className="h-5 w-5 text-cyan-300" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-white/10 p-5 sm:grid-cols-3">
        <article className={`rounded-2xl border px-4 py-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <Layers3 className="h-4 w-4 text-indigo-300" />
            Dias com registro
          </div>
          <p className={`mt-2 text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{daysWithEntries}</p>
        </article>

        <article className={`rounded-2xl border px-4 py-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <Clock3 className="h-4 w-4 text-emerald-300" />
            Batidas no mês
          </div>
          <p className={`mt-2 text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{monthEntries.length}</p>
        </article>

        <article className={`rounded-2xl border px-4 py-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <Clock3 className="h-4 w-4 text-cyan-300" />
            Última atualização
          </div>
          <p className={`mt-2 text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{lastRefresh}</p>
        </article>
      </div>

      <div className="p-5">
        {rows.length === 0 ? (
          <div
            className={`rounded-[1.4rem] border border-dashed px-5 py-8 text-center text-sm ${
              dark ? 'border-white/10 bg-white/[0.02] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            Nenhuma marcação encontrada para o mês atual.
          </div>
        ) : (
          <div className={`overflow-hidden rounded-[1.4rem] border ${dark ? 'border-white/10' : 'border-slate-200'}`}>
            <table className={`min-w-full divide-y text-left text-sm ${dark ? 'divide-white/10' : 'divide-slate-200'}`}>
              <thead className={dark ? 'bg-white/[0.03] text-slate-400' : 'bg-slate-50 text-slate-500'}>
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Data</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Entrada</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Intervalo</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Retorno</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Saída</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? 'divide-white/10 bg-slate-950/50' : 'divide-slate-100 bg-white'}`}>
                {rows.map(({ dateKey, value }) => {
                  const isToday = dateKey === getBrasiliaDateKey(now);

                  return (
                    <tr key={dateKey} className={dark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}>
                      <td className={`px-4 py-4 ${dark ? 'text-slate-200' : 'text-slate-900'}`}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{getBrasiliaDateLabel(dateKey)}</span>
                          {isToday && (
                            <span className="mt-1 inline-flex w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                              Hoje
                            </span>
                          )}
                        </div>
                      </td>

                      {typeOrder.map((type) => (
                        <td key={`${dateKey}-${type}`} className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              value[type] === '-'
                                ? dark
                                  ? 'bg-white/[0.04] text-slate-500'
                                  : 'bg-slate-100 text-slate-400'
                                : dark
                                  ? 'bg-indigo-500/15 text-indigo-200'
                                  : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {value[type]}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {latestEntry && (
          <p className={`mt-4 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Último registro do mês: {typeLabel[latestEntry.type]} em {getBrasiliaTime(new Date(latestEntry.timestamp))}.
          </p>
        )}
      </div>
    </section>
  );
}
