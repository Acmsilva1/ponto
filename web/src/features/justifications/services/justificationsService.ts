import type { Justification } from '@shared/contracts';
import { apiRequest } from '../../../lib/apiClient.js';

export async function listJustifications(employeeId?: string) {
  const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
  return apiRequest<{ justifications: Justification[] }>(`/justifications${query}`);
}

export async function createJustification(input: {
  employeeId: string;
  timeEntryId?: string | null;
  date: string;
  reason: string;
  status?: Justification['status'];
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}) {
  return apiRequest<{ justification: Justification }>('/justifications', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
