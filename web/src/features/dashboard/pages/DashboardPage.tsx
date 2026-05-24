import { useEffect, useMemo, useState } from 'react';
import type { Employee, Justification, TimeEntry, DashboardSummary, TimeEntryType } from '@shared/contracts';
import { Navbar } from '../../layout/components/Navbar.js';
import { CollaboratorWorkspace } from '../components/CollaboratorWorkspace.js';
import { ManagerWorkspace } from '../components/ManagerWorkspace.js';
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

  const todayKeys = useMemo(() => {
    const today = getBrasiliaDateKey(new Date());
    return {
      today,
      official: collaboratorEntries.filter(
        (entry) => entry.journey === 'official' && getBrasiliaDateKey(new Date(entry.timestamp)) === today
      ),
      extra: collaboratorEntries.filter((entry) => entry.journey === 'extra' && getBrasiliaDateKey(new Date(entry.timestamp)) === today)
    };
  }, [collaboratorEntries]);

  const collaboratorOfficialEntries = useMemo(() => {
    const map = new Map<TimeEntryType, TimeEntry>();
    for (const entry of todayKeys.official) {
      if (!map.has(entry.type)) {
        map.set(entry.type, entry);
      }
    }
    return [...map.values()].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  }, [todayKeys.official]);

  const collaboratorExtraEntries = useMemo(() => {
    const map = new Map<TimeEntryType, TimeEntry>();
    for (const entry of todayKeys.extra) {
      if (!map.has(entry.type)) {
        map.set(entry.type, entry);
      }
    }
    return [...map.values()].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  }, [todayKeys.extra]);

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

  async function handleOfficialClock(type: TimeEntryType, justification: string) {
    if (collaboratorOfficialEntries.some((entry) => entry.type === type)) {
      throw new Error('Este tipo de marcação já foi registrado hoje.');
    }

    if (collaboratorOfficialEntries.length >= 4) {
      throw new Error('Você já registrou as 4 marcações permitidas hoje.');
    }

    await createTimeEntry({
      employeeId: employee.id,
      timestamp: new Date().toISOString(),
      type,
      journey: 'official',
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

  async function handleExtraClock(type: TimeEntryType, justification: string) {
    const officialExit = [...collaboratorOfficialEntries]
      .filter((entry) => entry.type === 'saida')
      .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
      .at(-1);

    if (!officialExit || new Date().getTime() <= new Date(officialExit.timestamp).getTime()) {
      throw new Error('O período de trabalho vigente está em atividade ainda.');
    }

    if (collaboratorExtraEntries.some((entry) => entry.type === type)) {
      throw new Error('Este tipo de marcação já foi registrado na jornada extra hoje.');
    }

    if (collaboratorExtraEntries.length >= 4) {
      throw new Error('A jornada extra já possui as 4 marcações permitidas.');
    }

    await createTimeEntry({
      employeeId: employee.id,
      timestamp: new Date().toISOString(),
      type,
      journey: 'extra',
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
            timeEntries={collaboratorEntries}
            officialEntries={collaboratorOfficialEntries}
            extraEntries={collaboratorExtraEntries}
            onClockOfficial={handleOfficialClock}
            onClockExtra={handleExtraClock}
          />
        )}
      </main>
    </div>
  );
}
