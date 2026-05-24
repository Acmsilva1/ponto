import { useMemo, useState } from 'react';
import type { DashboardSummary, Employee, Justification, TimeEntry, TimeEntryType } from '@shared/contracts';
import { Navbar } from '../../layout/components/Navbar.js';
import { DashboardStats } from '../components/DashboardStats.js';
import { EmployeeSelector } from '../../employees/components/EmployeeSelector.js';
import { ClockWidget } from '../../time-entries/components/ClockWidget.js';
import { TimeCardTable } from '../../time-entries/components/TimeCardTable.js';
import { createTimeEntry } from '../../time-entries/services/timeEntriesService.js';
import { createJustification } from '../../justifications/services/justificationsService.js';

interface DashboardPageProps {
  employee: Employee;
  employees: Employee[];
  timeEntries: TimeEntry[];
  justifications: Justification[];
  summary: DashboardSummary;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void> | void;
  onOpenProfile: () => void;
}

export function DashboardPage({
  employee,
  employees,
  timeEntries,
  justifications,
  summary,
  onRefresh,
  onLogout,
  onOpenProfile
}: DashboardPageProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employee.id);
  const selectedEmployee = useMemo(
    () => employees.find((item) => item.id === selectedEmployeeId) || employee,
    [employees, employee, selectedEmployeeId]
  );
  const [feedback, setFeedback] = useState('');

  async function handleClock(type: TimeEntryType, justification: string) {
    await createTimeEntry({
      employeeId: selectedEmployee.id,
      timestamp: new Date().toISOString(),
      type,
      isManual: Boolean(justification.trim()),
      justification: justification.trim() || null,
      location: null
    });

    if (justification.trim()) {
      await createJustification({
        employeeId: selectedEmployee.id,
        date: new Date().toISOString().slice(0, 10),
        reason: justification.trim(),
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        timeEntryId: null
      });
    }

    await onRefresh();
    setFeedback('Ponto registrado com sucesso.');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar employee={employee} onLogout={onLogout} onOpenProfile={onOpenProfile} />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Painel oficial</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Olá, {employee.name}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {employee.accessRole === 'gestor'
                  ? 'Você tem acesso total ao sistema e visualiza todos os registros.'
                  : 'Você está autenticado e pode registrar seu ponto com segurança.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Registro</p>
              <p className="mt-1 text-sm font-bold">{employee.registryId}</p>
            </div>
          </div>
        </section>

        <DashboardStats summary={summary} />

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <div className="space-y-6">
            {employee.accessRole === 'gestor' && (
              <EmployeeSelector
                employees={employees}
                selectedId={selectedEmployeeId}
                onSelect={setSelectedEmployeeId}
              />
            )}

            <ClockWidget onClock={handleClock} disabled={employee.accessRole !== 'gestor' && selectedEmployee.id !== employee.id} />
          </div>

          <div className="space-y-6">
            <TimeCardTable entries={timeEntries.filter((entry) => entry.employeeId === selectedEmployee.id)} />

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Justificativas</h3>
              <div className="mt-4 space-y-3">
                {justifications.filter((item) => item.employeeId === selectedEmployee.id).length === 0 ? (
                  <p className="text-sm text-slate-500">Sem justificativas no momento.</p>
                ) : (
                  justifications
                    .filter((item) => item.employeeId === selectedEmployee.id)
                    .map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">{item.reason}</p>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{item.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {feedback && (
              <section className="rounded-3xl border border-slate-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                {feedback}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
