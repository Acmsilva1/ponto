import { Plus, Users } from 'lucide-react';
import type { Employee } from '@shared/contracts';

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedId: string;
  onSelect: (employeeId: string) => void;
}

export function EmployeeSelector({ employees, selectedId, onSelect }: EmployeeSelectorProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Colaboradores</h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
          <Plus className="h-4 w-4" />
          Cadastro na tela inicial
        </div>
      </div>

      <div className="grid gap-2">
        {employees.map((employee) => {
          const active = employee.id === selectedId;
          return (
            <button
              key={employee.id}
              type="button"
              onClick={() => onSelect(employee.id)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div>
                <div className="font-semibold">{employee.name}</div>
                <div className="text-xs text-slate-500">{employee.department}</div>
              </div>
              <div className="text-right text-xs uppercase tracking-[0.18em] text-slate-500">
                {employee.accessRole}
              </div>
            </button>
          );
        })}
        {employees.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Nenhum colaborador encontrado no banco.
          </div>
        )}
      </div>
    </section>
  );
}
