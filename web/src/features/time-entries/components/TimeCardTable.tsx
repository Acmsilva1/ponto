import type { TimeEntry } from '@shared/contracts';

interface TimeCardTableProps {
  entries: TimeEntry[];
  dark?: boolean;
}

const typeLabel: Record<string, string> = {
  entrada: 'Entrada',
  almoco_saida: 'Saída almoço',
  almoco_retorno: 'Retorno almoço',
  saida: 'Saída'
};

export function TimeCardTable({ entries, dark = true }: TimeCardTableProps) {
  return (
    <section
      className={`rounded-[1.75rem] border shadow-[0_24px_80px_rgba(2,6,23,0.35)] ${
        dark ? 'border-white/10 bg-slate-950/85' : 'border-slate-200 bg-white shadow-sm'
      }`}
    >
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className={`text-sm font-semibold uppercase tracking-[0.18em] ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
          Batidas recentes
        </h3>
        <p className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Histórico consolidado vindo do banco
        </p>
      </div>

      <div className="p-5">
        {entries.length === 0 ? (
          <div
            className={`rounded-[1.4rem] border border-dashed p-6 text-center text-sm ${
              dark ? 'border-white/10 bg-white/[0.02] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            Nenhuma batida encontrada.
          </div>
        ) : (
          <div className={`overflow-hidden rounded-[1.4rem] border ${dark ? 'border-white/10' : 'border-slate-200'}`}>
            <table className={`min-w-full divide-y text-left text-sm ${dark ? 'divide-white/10' : 'divide-slate-200'}`}>
              <thead className={dark ? 'bg-white/[0.03] text-slate-400' : 'bg-slate-50 text-slate-500'}>
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Data</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Tipo</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">Justificativa</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? 'divide-white/10 bg-slate-950/50' : 'divide-slate-100 bg-white'}`}>
                {entries.map((entry) => (
                  <tr key={entry.id} className={dark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}>
                    <td className={`px-4 py-4 text-sm ${dark ? 'text-slate-200' : 'text-slate-900'}`}>
                      {new Date(entry.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            entry.journey === 'extra'
                              ? dark
                                ? 'bg-amber-500/20 text-amber-100'
                                : 'bg-amber-50 text-amber-700'
                              : dark
                                ? 'bg-indigo-500/15 text-indigo-200'
                                : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {typeLabel[entry.type] || entry.type}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            entry.journey === 'extra'
                              ? dark
                                ? 'bg-amber-400/10 text-amber-100'
                                : 'bg-amber-100 text-amber-700'
                              : dark
                                ? 'bg-white/[0.04] text-slate-400'
                                : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {entry.journey === 'extra' ? 'Extra' : 'Oficial'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {entry.justification || '-'}
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
