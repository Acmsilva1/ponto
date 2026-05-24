import type { TimeEntry, TimeEntryType } from '@shared/contracts';
import { apiRequest } from '../../../lib/apiClient.js';

export async function listTimeEntries(employeeId?: string) {
  const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
  return apiRequest<{ timeEntries: TimeEntry[] }>(`/time-entries${query}`);
}

export async function createTimeEntry(input: {
  employeeId: string;
  timestamp: string;
  type: TimeEntryType;
  isManual: boolean;
  justification?: string | null;
  location?: TimeEntry['location'] | null;
}) {
  return apiRequest<{ timeEntry: TimeEntry }>('/time-entries', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
