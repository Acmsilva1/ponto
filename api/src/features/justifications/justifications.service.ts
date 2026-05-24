import { createJustification, listJustifications } from './justifications.repository.js';
import type { CreateJustificationInput } from './justifications.validators.js';

export async function getJustifications(employeeId?: string) {
  return listJustifications(employeeId);
}

export async function saveJustification(input: CreateJustificationInput) {
  return createJustification({
    employeeId: input.employeeId,
    timeEntryId: input.timeEntryId ?? null,
    date: input.date,
    reason: input.reason,
    status: input.status ?? 'pending',
    reviewedBy: input.reviewedBy ?? null,
    reviewedAt: input.reviewedAt ?? null
  });
}
