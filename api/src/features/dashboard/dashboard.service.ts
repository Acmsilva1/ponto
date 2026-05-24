import type { DashboardSummary } from '@shared/contracts';
import { listEmployees } from '../employees/employees.repository.js';
import { listJustifications } from '../justifications/justifications.repository.js';
import { listTimeEntries } from '../time-entries/timeEntries.repository.js';

export async function getDashboardSummary(scope: { role: 'colaborador' | 'gestor'; employeeId: string }): Promise<DashboardSummary> {
  const [employees, timeEntries, justifications] = await Promise.all([
    scope.role === 'gestor' ? listEmployees() : Promise.resolve([]),
    listTimeEntries(scope.role === 'gestor' ? undefined : scope.employeeId),
    listJustifications(scope.role === 'gestor' ? undefined : scope.employeeId)
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return {
    employeesCount: scope.role === 'gestor' ? employees.length : 1,
    timeEntriesCount: timeEntries.length,
    justificationsCount: justifications.length,
    pendingJustificationsCount: justifications.filter((item) => item.status === 'pending').length,
    todayEntriesCount: timeEntries.filter((item) => item.timestamp.startsWith(today)).length
  };
}
