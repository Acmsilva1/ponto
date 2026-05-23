import { TimeEntry, DailySummary, Employee, TimeEntryType } from './types';

/**
 * Groups all time entries by day (YYYY-MM-DD) in local time or ISO day coordinate.
 */
export function groupEntriesByDay(entries: TimeEntry[]): Record<string, TimeEntry[]> {
  const groups: Record<string, TimeEntry[]> = {};
  
  entries.forEach(entry => {
    // Extract date portion YYYY-MM-DD
    const dateStr = entry.timestamp.split('T')[0];
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(entry);
  });

  // Sort each day's entries chronologically
  Object.keys(groups).forEach(dateStr => {
    groups[dateStr].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  });

  return groups;
}

/**
 * Calculates correct time cards for each day given an employee.
 */
export function calculateDailySummaries(
  employee: Employee, 
  allEntries: TimeEntry[]
): DailySummary[] {
  // Filter for this employee only
  const empEntries = allEntries.filter(e => e.employeeId === employee.id);
  const grouped = groupEntriesByDay(empEntries);

  const summaries: DailySummary[] = [];

  // Generate for days that have entries
  Object.entries(grouped).forEach(([date, dayEntries]) => {
    let totalWorkMinutes = 0;
    let lunchMinutes = 0;
    let isComplete = true;
    const warnings: string[] = [];

    // Classify standard sequence pairing
    // Usually: 
    // - index 0 (entrada) -> index 1 (almoco_saida)
    // - index 2 (almoco_retorno) -> index 3 (saida)
    // But employees might miss entries. We pair chronologically:
    const sorted = [...dayEntries];

    if (sorted.length % 2 !== 0) {
      isComplete = false;
      warnings.push('Dia possui número ímpar de batidas (Incompleto)');
    }

    // Work calculation based on pairing sequence: (sorted[1] - sorted[0]) + (sorted[3] - sorted[2])...
    for (let i = 0; i < sorted.length - 1; i += 2) {
      const p1 = sorted[i];
      const p2 = sorted[i + 1];

      // Standard logical order warnings
      if (p1.type === 'almoco_saida' && p2.type === 'entrada') {
        warnings.push('Inconsistência na sequência de entrada/saída');
      }

      const diffMs = new Date(p2.timestamp).getTime() - new Date(p1.timestamp).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins > 0) {
        totalWorkMinutes += diffMins;
      }
    }

    // Lunch calculation: time between almoco_saida (or index 1) and almoco_retorno (or index 2)
    const lunchExit = sorted.find(e => e.type === 'almoco_saida');
    const lunchReturn = sorted.find(e => e.type === 'almoco_retorno');

    if (lunchExit && lunchReturn) {
      const lunchDiffMs = new Date(lunchReturn.timestamp).getTime() - new Date(lunchExit.timestamp).getTime();
      const lunchDiffMins = Math.floor(lunchDiffMs / 60000);
      if (lunchDiffMins > 0) {
        lunchMinutes = lunchDiffMins;
        if (lunchDiffMins < 60) {
          warnings.push('Intervalo de almoço menor que 1 hora (Mínimo CLT)');
        }
      }
    }

    // General warnings
    if (totalWorkMinutes > 10 * 60) {
      warnings.push('Jornada de trabalho estendida (mais de 10 horas)');
    }

    const expectedMinutes = employee.workHoursPerDay * 60;
    const overtimeMinutes = isComplete ? (totalWorkMinutes - expectedMinutes) : 0;

    summaries.push({
      date,
      entries: sorted,
      totalWorkMinutes,
      overtimeMinutes,
      lunchMinutes,
      isComplete,
      warnings
    });
  });

  // Sort daily summaries descending (newest first)
  return summaries.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Formats minutes into standard human string: "8h 15m" or similar
 */
export function formatMinutes(minutes: number): string {
  const isNegative = minutes < 0;
  const absMinutes = Math.abs(minutes);
  const hrs = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;

  let str = '';
  if (hrs > 0) str += `${hrs}h `;
  str += `${mins}m`;

  return isNegative ? `-${str}` : str;
}

/**
 * Formats duration with positive/negative indicators specifically for balance: "+2h 10m" / "-0h 45m"
 */
export function formatOvertimeBalance(minutes: number): { text: string; colorClass: string } {
  if (minutes === 0) {
    return { text: '0m', colorClass: 'text-gray-500 bg-gray-100' };
  }
  const formatted = formatMinutes(minutes);
  if (minutes > 0) {
    return { text: `+${formatted}`, colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
  } else {
    return { text: `${formatted}`, colorClass: 'text-rose-700 bg-rose-50 border-rose-100' };
  }
}
