import type { Employee } from '../../../../shared/src/contracts.js';
import { listEmployees } from './employees.repository.js';

function sanitizeEmployee(employee: Employee): Employee {
  const { id, name, role, department, workHoursPerDay, avatarColor, registryId, accessRole, isMaster, mustChangePassword, createdAt, updatedAt } = employee;
  return {
    id,
    name,
    role,
    department,
    workHoursPerDay,
    avatarColor,
    registryId,
    accessRole,
    isMaster,
    mustChangePassword,
    createdAt,
    updatedAt
  };
}

export async function getEmployees() {
  const employees = await listEmployees();
  return employees.map(sanitizeEmployee);
}
