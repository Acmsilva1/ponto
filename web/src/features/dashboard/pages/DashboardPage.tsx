import { useEffect, useMemo, useState } from 'react';
import type { Employee, Justification, TimeEntry, DashboardSummary } from '@shared/contracts';
import { Navbar } from '../../layout/components/Navbar.js';
import { CollaboratorWorkspace } from '../components/CollaboratorWorkspace.js';
import { ManagerWorkspace } from '../components/ManagerWorkspace.js';
import { createTimeEntry } from '../../time-entries/services/timeEntriesService.js';
import { createJustification } from '../../justifications/services/justificationsService.js';
import type { TimeEntryType } from '@shared/contracts';

type OfficialTimeEntryType = Exclude<TimeEntryType, 'extra'>;

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
  const collaboratorEntries = useMemo(() => timeEntries.filter((entry) => entry.employeeId === employee.id), [employee.id, timeEntries]);
  const collaboratorTodayOfficialEntries = useMemo(() => {
    const todayKey = getBrasiliaDateKey(new Date());
    const map = new Map<OfficialTimeEntryType, TimeEntry>();

    for (const entry of collaboratorEntries) {
      if (entry.type === 'extra') {
        continue;
      }

      if (getBrasiliaDateKey(new Date(entry.timestamp)) !== todayKey) {
        continue;
      }

      if (!map.has(entry.type)) {
        map.set(entry.type as OfficialTimeEntryType, entry);
      }
    }

    return [...map.values()].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  }, [collaboratorEntries]);
  const collaboratorTodayExtraEntries = useMemo(() => {
    const todayKey = getBrasiliaDateKey(new Date());

    return collaboratorEntries
      .filter((entry) => entry.type === 'extra' && getBrasiliaDateKey(new Date(entry.timestamp)) === todayKey)
      .sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  }, [collaboratorEntries]);

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

  async function handleOfficialClock(type: OfficialTimeEntryType, justification: string) {
    if (collaboratorTodayOfficialEntries.some((entry) => entry.type === type)) {
      throw new Error('Este tipo de marcação já foi registrado hoje.');
    }

    if (collaboratorTodayOfficialEntries.length >= 4) {
      throw new Error('Você já registrou as 4 marcações permitidas hoje.');
    }

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

  async function handleExtraClock() {
    await createTimeEntry({
      employeeId: employee.id,
      timestamp: new Date().toISOString(),
      type: 'extra',
      isManual: false,
      justification: null,
      location: null
    });

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
            timeEntries={collaboratorEntries}
            officialEntries={collaboratorTodayOfficialEntries}
            extraEntries={collaboratorTodayExtraEntries}
            onClock={handleOfficialClock}
            onClockExtra={handleExtraClock}
          />
        )}
      </main>
    </div>
  );
}
