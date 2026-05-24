import type { Employee } from '@shared/contracts';
import { apiRequest } from '../../../lib/apiClient.js';

export async function listEmployees() {
  return apiRequest<{ employees: Employee[] }>('/employees');
}

export async function updateEmployee(employeeId: string, input: { name: string; role: string; registryId: string }) {
  return apiRequest<{ employee: Employee }>(`/employees/${employeeId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  });
}

export async function deleteEmployee(employeeId: string) {
  return apiRequest<{ deleted: boolean }>(`/employees/${employeeId}`, {
    method: 'DELETE'
  });
}
