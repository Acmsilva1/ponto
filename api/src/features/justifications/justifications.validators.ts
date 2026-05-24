import type { JustificationStatus } from '@shared/contracts';

export interface CreateJustificationInput {
  employeeId: string;
  timeEntryId?: string | null;
  date: string;
  reason: string;
  status?: JustificationStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

export function validateCreateJustificationInput(input: unknown): CreateJustificationInput {
  const payload = input as Partial<CreateJustificationInput>;
  if (!payload.employeeId || !payload.date || !payload.reason) {
    throw new Error('employeeId, date e reason são obrigatórios.');
  }
  return {
    employeeId: String(payload.employeeId),
    timeEntryId: payload.timeEntryId ?? null,
    date: String(payload.date),
    reason: String(payload.reason),
    status: payload.status ?? 'pending',
    reviewedBy: payload.reviewedBy ?? null,
    reviewedAt: payload.reviewedAt ?? null
  };
}
