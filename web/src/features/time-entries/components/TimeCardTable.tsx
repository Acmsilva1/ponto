import type { TimeEntry } from '@shared/contracts';

interface TimeCardTableProps {
  entries: TimeEntry[];
}

export function TimeCardTable({ entries }: TimeCardTableProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">Batidas recentes</h3>
        <p className="text-xs text-slate-500">Últimos registros vindos do banco</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Justificativa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3">{new Date(entry.timestamp).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3">{entry.type}</td>
                <td className="px-4 py-3 text-slate-500">{entry.justification || '-'}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={3}>
                  Nenhuma batida encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
