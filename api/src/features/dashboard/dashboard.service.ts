import type { DashboardSummary } from '../../../../shared/src/contracts.js';
import { listEmployees } from '../employees/employees.repository.js';
import { listJustifications } from '../justifications/justifications.repository.js';
import { listTimeEntries } from '../time-entries/timeEntries.repository.js';

function getBrasiliaDateKey(date: Date) {
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

  return `${year}-${month}-${day}`;
}

export async function getDashboardSummary(scope: { role: 'colaborador' | 'gestor'; employeeId: string }): Promise<DashboardSummary> {
  const [employees, timeEntries, justifications] = await Promise.all([
    scope.role === 'gestor' ? listEmployees() : Promise.resolve([]),
    listTimeEntries(scope.role === 'gestor' ? undefined : scope.employeeId),
    listJustifications(scope.role === 'gestor' ? undefined : scope.employeeId)
  ]);

  const today = getBrasiliaDateKey(new Date());
  const todayEntries = timeEntries.filter(
    (item) => item.type !== 'extra' && getBrasiliaDateKey(new Date(item.timestamp)) === today
  );
  const uniqueTodayEntries = new Map(todayEntries.map((item) => [item.type, item]));

  return {
    employeesCount: scope.role === 'gestor' ? employees.length : 1,
    timeEntriesCount: timeEntries.length,
    justificationsCount: justifications.length,
    pendingJustificationsCount: justifications.filter((item) => item.status === 'pending').length,
    todayEntriesCount: uniqueTodayEntries.size
  };
}
