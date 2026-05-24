import { CalendarDays, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TimeEntry, TimeEntryType } from '@shared/contracts';

interface MonthlyTimesheetCardProps {
  entries: TimeEntry[];
  dark?: boolean;
  selectedMonth?: string;
  onSelectedMonthChange?: (month: string) => void;
}

const typeLabel: Record<TimeEntryType, string> = {
  entrada: 'Entrada',
  almoco_saida: 'Início do intervalo',
  almoco_retorno: 'Retorno do intervalo',
  saida: 'Saída final'
};

const typeOrder: TimeEntryType[] = ['entrada', 'almoco_saida', 'almoco_retorno', 'saida'];

function getBrasiliaDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  return {
    year: parts.find((part) => part.type === 'year')?.value || '0000',
    month: parts.find((part) => part.type === 'month')?.value || '00',
    day: parts.find((part) => part.type === 'day')?.value || '00'
  };
}

function getBrasiliaDateKey(date: Date) {
  const { year, month, day } = getBrasiliaDateParts(date);
  return `${year}-${month}-${day}`;
}

function getBrasiliaMonthKey(date: Date) {
  return getBrasiliaDateKey(date).slice(0, 7);
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

function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function buildMonthOptions(reference = new Date()) {
  const options: Array<{ key: string; label: string }> = [];
  const current = new Date(reference.getFullYear(), reference.getMonth(), 1);

  for (let index = 0; index < 12; index += 1) {
    const monthDate = new Date(current.getFullYear(), current.getMonth() - index, 1);
    const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    options.push({ key, label: getMonthLabel(key) });
  }

  return options;
}

export function MonthlyTimesheetCard({
  entries,
  dark = true,
  selectedMonth: controlledMonth,
  onSelectedMonthChange
}: MonthlyTimesheetCardProps) {
  const [internalMonth, setInternalMonth] = useState(() => getBrasiliaMonthKey(new Date()));
  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const selectedMonth = controlledMonth ?? internalMonth;
  const setSelectedMonth = onSelectedMonthChange || setInternalMonth;

  const monthEntries = useMemo(
    () =>
      [...entries]
        .filter((entry) => getBrasiliaDateKey(new Date(entry.timestamp)).startsWith(selectedMonth))
        .sort((left, right) => left.timestamp.localeCompare(right.timestamp)),
    [entries, selectedMonth]
  );

  const rows = useMemo(() => {
    const map = new Map<
      string,
      {
        official: Record<TimeEntryType, string>;
        extra: Record<TimeEntryType, string>;
      }
    >();

    for (const entry of monthEntries) {
      const dateKey = getBrasiliaDateKey(new Date(entry.timestamp));
      const current = map.get(dateKey) || {
        official: { entrada: '-', almoco_saida: '-', almoco_retorno: '-', saida: '-' },
        extra: { entrada: '-', almoco_saida: '-', almoco_retorno: '-', saida: '-' }
      };

      const bucket = entry.journey === 'extra' ? current.extra : current.official;
      bucket[entry.type] = getBrasiliaTime(new Date(entry.timestamp));
      map.set(dateKey, current);
    }

    return [...map.entries()]
      .map(([dateKey, value]) => ({ dateKey, value }))
      .sort((left, right) => right.dateKey.localeCompare(left.dateKey));
  }, [monthEntries]);

  const currentLabel = getMonthLabel(selectedMonth);

  return (
    <section
      className={`overflow-hidden rounded-[1.75rem] border shadow-[0_24px_80px_rgba(2,6,23,0.35)] ${
        dark ? 'border-white/10 bg-slate-950/85' : 'border-slate-200 bg-white shadow-sm'
      }`}
    >
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/10 px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? 'text-cyan-200/80' : 'text-slate-500'}`}>
              Folha de ponto
            </p>
            <h3 className={`mt-2 text-xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Consulta mensal</h3>
            <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Visualização consolidada por mês</p>
          </div>

          <label
            className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              dark ? 'border-white/10 bg-white/[0.03] text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
            }`}
          >
            <CalendarDays className="h-4 w-4 text-cyan-300" />
            <span>Mês</span>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className={`appearance-none rounded-xl border-0 bg-transparent pr-7 text-sm font-semibold outline-none ${
                  dark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {monthOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </label>
        </div>
      </div>

      <div className="p-5">
        <p className={`mb-4 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {currentLabel} • {rows.length} dias com marcação • {monthEntries.filter((entry) => entry.journey === 'official').length} batidas oficiais •{' '}
          {monthEntries.filter((entry) => entry.journey === 'extra').length} extras
        </p>

        {rows.length === 0 ? (
          <div
            className={`rounded-[1.4rem] border border-dashed px-5 py-8 text-center text-sm ${
              dark ? 'border-white/10 bg-white/[0.02] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            Nenhuma marcação encontrada para o mês selecionado.
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
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Extra</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? 'divide-white/10 bg-slate-950/50' : 'divide-slate-100 bg-white'}`}>
                {rows.map(({ dateKey, value }) => (
                  <tr key={dateKey} className={dark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}>
                    <td className={`px-4 py-4 ${dark ? 'text-slate-200' : 'text-slate-900'}`}>
                      <span className="font-semibold">{new Date(`${dateKey}T00:00:00-03:00`).toLocaleDateString('pt-BR')}</span>
                    </td>

                    {typeOrder.map((type) => (
                      <td key={`${dateKey}-${type}`} className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            value.official[type] === '-'
                              ? dark
                                ? 'bg-white/[0.04] text-slate-500'
                                : 'bg-slate-100 text-slate-400'
                              : dark
                                ? 'bg-indigo-500/15 text-indigo-200'
                                : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {value.official[type]}
                        </span>
                      </td>
                    ))}

                    <td className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-2">
                        {typeOrder.map((type) => (
                          <div
                            key={`${dateKey}-extra-${type}`}
                            className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              value.extra[type] === '-'
                                ? dark
                                  ? 'bg-white/[0.04] text-slate-500'
                                  : 'bg-slate-100 text-slate-400'
                                : dark
                                  ? 'bg-amber-500/20 text-amber-100'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            <span className="text-[9px] opacity-80">{typeLabel[type]}</span>
                            <span className="mt-1 text-[11px] font-black normal-case tracking-normal">
                              {value.extra[type] === '-' ? '-' : value.extra[type]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
