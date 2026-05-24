import type { Employee } from '@shared/contracts';
import { apiRequest } from '../../../lib/apiClient.js';

export async function listEmployees() {
  return apiRequest<{ employees: Employee[] }>('/employees');
}
