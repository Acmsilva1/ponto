import { createTimeEntry, listTimeEntries } from './timeEntries.repository.js';
import type { CreateTimeEntryInput } from './timeEntries.validators.js';

export async function getTimeEntries(employeeId?: string) {
  return listTimeEntries(employeeId);
}

export async function saveTimeEntry(input: CreateTimeEntryInput) {
  return createTimeEntry({
    employeeId: input.employeeId,
    timestamp: input.timestamp,
    type: input.type,
    isManual: Boolean(input.isManual),
    justification: input.justification ?? null,
    location: input.location ?? null
  });
}
