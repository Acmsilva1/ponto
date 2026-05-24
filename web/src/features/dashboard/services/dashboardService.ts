import type { DashboardSummary } from '@shared/contracts';
import { apiRequest } from '../../../lib/apiClient.js';

export async function loadDashboardSummary() {
  return apiRequest<{ summary: DashboardSummary }>('/dashboard');
}
