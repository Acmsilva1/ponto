import type { DashboardSummary } from '@shared/contracts';

interface DashboardStatsProps {
  summary: DashboardSummary;
}

const cards = [
  { key: 'employeesCount', label: 'Colaboradores', accent: 'from-indigo-500 to-indigo-700' },
  { key: 'timeEntriesCount', label: 'Batidas', accent: 'from-emerald-500 to-emerald-700' },
  { key: 'justificationsCount', label: 'Justificativas', accent: 'from-amber-500 to-amber-700' },
  { key: 'pendingJustificationsCount', label: 'Pendências', accent: 'from-rose-500 to-rose-700' }
] as const;

export function DashboardStats({ summary }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
          <p className={`mt-3 bg-gradient-to-r ${card.accent} bg-clip-text text-3xl font-black text-transparent`}>
            {summary[card.key]}
          </p>
        </div>
      ))}
      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:col-span-2 xl:col-span-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Hoje</p>
        <p className="mt-3 text-3xl font-black">{summary.todayEntriesCount}</p>
        <p className="mt-1 text-sm text-slate-400">batidas registradas no dia corrente</p>
      </div>
    </div>
  );
}
