import type { Employee } from '../../../../shared/src/contracts.js';
import { deleteEmployeeById, findEmployeeById, listEmployees, updateEmployeeById } from './employees.repository.js';

function sanitizeEmployee(employee: Employee): Employee {
  const {
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
  } = employee;
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

export async function updateEmployee(employeeId: string, input: { name?: string; role?: string; registryId?: string }) {
  const existing = await findEmployeeById(employeeId);
  if (!existing) throw new Error('Colaborador não encontrado.');
  if (existing.isMaster) throw new Error('O gestor mestre não pode ser alterado por esta ação.');

  const updated = await updateEmployeeById(employeeId, {
    name: input.name?.trim() || existing.name,
    role: input.role?.trim() || existing.role,
    registryId: input.registryId?.trim().toUpperCase() || existing.registryId
  });

  return sanitizeEmployee(updated);
}

export async function removeEmployee(employeeId: string) {
  const existing = await findEmployeeById(employeeId);
  if (!existing) throw new Error('Colaborador não encontrado.');
  if (existing.isMaster) throw new Error('O gestor mestre não pode ser removido.');

  await deleteEmployeeById(employeeId);
  return { deleted: true };
}
