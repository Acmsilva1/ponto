import { Plus, Users } from 'lucide-react';
import type { Employee } from '@shared/contracts';

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedId: string;
  onSelect: (employeeId: string) => void;
  dark?: boolean;
}

export function EmployeeSelector({ employees, selectedId, onSelect, dark = true }: EmployeeSelectorProps) {
  return (
    <section
      className={`rounded-[1.75rem] border shadow-[0_24px_80px_rgba(2,6,23,0.35)] ${
        dark ? 'border-white/10 bg-slate-950/85' : 'border-slate-200 bg-white shadow-sm'
      }`}
    >
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className={`h-4 w-4 ${dark ? 'text-indigo-300' : 'text-indigo-600'}`} />
              <h3 className={`text-sm font-semibold uppercase tracking-[0.18em] ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
                Colaboradores
              </h3>
            </div>
            <p className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Selecione alguém para auditar os registros
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              dark ? 'border-indigo-400/20 bg-indigo-500/10 text-indigo-200' : 'border-indigo-200 bg-indigo-50 text-indigo-700'
            }`}
          >
            <Plus className="h-4 w-4" />
            Cadastro na tela inicial
          </div>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {employees.map((employee) => {
          const active = employee.id === selectedId;
          return (
            <button
              key={employee.id}
              type="button"
              onClick={() => onSelect(employee.id)}
              className={`group flex w-full items-center justify-between rounded-[1.25rem] border px-4 py-4 text-left transition ${
                active
                  ? dark
                    ? 'border-indigo-400/40 bg-indigo-500/15'
                    : 'border-indigo-300 bg-indigo-50'
                  : dark
                    ? 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                    : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/60'
              }`}
            >
              <div>
                <div className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{employee.name}</div>
                <div className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{employee.department}</div>
              </div>
              <div className="text-right">
                <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {employee.accessRole}
                </div>
                <div className={`mt-2 text-[11px] font-medium ${active ? 'text-indigo-300' : dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {active ? 'Ativo' : 'Selecionar'}
                </div>
              </div>
            </button>
          );
        })}

        {employees.length === 0 && (
          <div
            className={`rounded-[1.25rem] border border-dashed p-6 text-center text-sm ${
              dark ? 'border-white/10 bg-white/[0.02] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            Nenhum colaborador encontrado no banco.
          </div>
        )}
      </div>
    </section>
  );
}
