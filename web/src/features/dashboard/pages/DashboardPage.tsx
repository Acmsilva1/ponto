import { useEffect, useMemo, useState } from 'react';
import type { Employee, Justification, TimeEntry, DashboardSummary } from '@shared/contracts';
import { Navbar } from '../../layout/components/Navbar.js';
import { CollaboratorWorkspace } from '../components/CollaboratorWorkspace.js';
import { ManagerWorkspace } from '../components/ManagerWorkspace.js';
import { createTimeEntry } from '../../time-entries/services/timeEntriesService.js';
import { createJustification } from '../../justifications/services/justificationsService.js';
import type { TimeEntryType } from '@shared/contracts';

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

  useEffect(() => {
    if (employee.accessRole === 'gestor') {
      const nextSelectedId = employees.find((item) => item.id === selectedEmployeeId)?.id || employees[0]?.id || '';
      if (nextSelectedId && nextSelectedId !== selectedEmployeeId) {
        setSelectedEmployeeId(nextSelectedId);
      }
      return;
    }

    if (selectedEmployeeId !== employee.id) {
      setSelectedEmployeeId(employee.id);
    }
  }, [employee.accessRole, employee.id, employees, selectedEmployeeId]);

  const collaboratorEntries = timeEntries.filter((entry) => entry.employeeId === employee.id);
  const collaboratorJustifications = justifications.filter((item) => item.employeeId === employee.id);

  async function handleClock(type: TimeEntryType, justification: string) {
    await createTimeEntry({
      employeeId: employee.id,
      timestamp: new Date().toISOString(),
      type,
      isManual: Boolean(justification.trim()),
      justification: justification.trim() || null,
      location: null
    });

    if (justification.trim()) {
      await createJustification({
        employeeId: employee.id,
        date: new Date().toISOString().slice(0, 10),
        reason: justification.trim(),
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        timeEntryId: null
      });
    }

    await onRefresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar employee={employee} onLogout={onLogout} onOpenProfile={onOpenProfile} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {employee.accessRole === 'gestor' ? (
          <ManagerWorkspace
            employee={employee}
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={setSelectedEmployeeId}
            onRefresh={onRefresh}
            timeEntries={timeEntries}
            justifications={justifications}
            summary={summary}
          />
        ) : (
          <CollaboratorWorkspace
            employee={employee}
            timeEntries={collaboratorEntries}
            justifications={collaboratorJustifications}
            summary={summary}
            onClock={handleClock}
            onOpenProfile={onOpenProfile}
          />
        )}
      </main>
    </div>
  );
}
