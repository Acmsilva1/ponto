import { randomBytes } from 'node:crypto';
import type { AuthSession, LoginInput, PasswordRecoveryInput, PasswordRecoveryResponse, RegisterInput, ChangePasswordInput, Employee } from '../../../../shared/src/contracts.js';
import { env } from '../../config/env.js';
import { hashPassword, signSession, verifyPassword } from '../../lib/crypto.js';
import { createEmployee, ensureMasterAccount, findEmployeeById, findEmployeeByRegistryId, logPasswordResetRequest, updatePassword } from './auth.repository.js';

function sanitizeEmployee(employee: Employee & { passwordHash?: string }): Employee {
  const { passwordHash: _passwordHash, ...safeEmployee } = employee;
  return {
    ...safeEmployee,
    registryId: safeEmployee.registryId.toUpperCase()
  };
}

export async function bootstrapMasterAccount() {
  await ensureMasterAccount(env.masterRegistryId, await hashPassword(env.masterPassword));
}

async function issueSession(employee: Employee & { passwordHash?: string }): Promise<AuthSession> {
  const payload = {
    sub: employee.id,
    role: employee.accessRole,
    registryId: employee.registryId,
    isMaster: employee.isMaster || false,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  };
  return {
    token: signSession(payload, env.sessionSecret),
    employee: sanitizeEmployee(employee)
  };
}

export async function login(input: LoginInput) {
  const registryId = input.registryId.trim().toUpperCase();
  const employee = await findEmployeeByRegistryId(registryId);
  if (!employee) {
    throw new Error('Credenciais inválidas.');
  }

  const ok = employee.passwordHash ? await verifyPassword(input.password, employee.passwordHash) : false;
  if (!ok) {
    throw new Error('Credenciais inválidas.');
  }

  const requiresPasswordChange = Boolean(employee.mustChangePassword);
  const session = await issueSession(employee);
  return { session, requiresPasswordChange };
}

export async function registerCollaborator(input: RegisterInput) {
  const employee = await createCollaboratorEmployee(input);
  const session = await issueSession(employee);
  return { session };
}

export async function registerCollaboratorByManager(input: RegisterInput) {
  return createCollaboratorEmployee(input);
}

async function createCollaboratorEmployee(input: RegisterInput) {
  const avatarPalette = [
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-500',
    'bg-sky-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-teal-600'
  ];
  const avatarColor = avatarPalette[Math.floor(Math.random() * avatarPalette.length)];
  const registryId = `REG-${Math.floor(10000 + Math.random() * 90000)}`;
  const passwordHash = await hashPassword(input.password);

  const employee = await createEmployee({
    name: input.name,
    role: input.role,
    department: input.department,
    workHoursPerDay: 8,
    avatarColor,
    registryId,
    passwordHash,
    accessRole: 'colaborador',
    isMaster: false,
    mustChangePassword: false
  });
  return employee;
}

export async function changePassword(employeeId: string, input: ChangePasswordInput) {
  const employee = await findEmployeeById(employeeId);
  if (!employee) {
    throw new Error('Usuário não encontrado.');
  }

  const ok = employee.passwordHash ? await verifyPassword(input.currentPassword, employee.passwordHash) : false;
  if (!ok) {
    throw new Error('Senha atual inválida.');
  }

  const updated = await updatePassword(employeeId, await hashPassword(input.newPassword), false);
  return sanitizeEmployee(updated);
}

function generateTemporaryPassword() {
  const raw = randomBytes(4).toString('hex');
  return `PD-${raw.slice(0, 4).toUpperCase()}-${raw.slice(4, 8).toUpperCase()}`;
}

export async function recoverPassword(input: PasswordRecoveryInput): Promise<PasswordRecoveryResponse> {
  const registryId = input.registryId.trim().toUpperCase();
  const employee = await findEmployeeByRegistryId(registryId);
  if (!employee) {
    throw new Error('Registro não encontrado.');
  }

  const temporaryPassword = generateTemporaryPassword();
  const temporaryPasswordHash = await hashPassword(temporaryPassword);
  const updatedEmployee = await updatePassword(employee.id, temporaryPasswordHash, true);

  try {
    await logPasswordResetRequest(employee.id, temporaryPasswordHash);
  } catch {
    // Auditoria auxiliar: o reset principal não pode falhar por isso.
  }

  return {
    employee: sanitizeEmployee(updatedEmployee),
    temporaryPassword
  };
}

export async function getCurrentUser(employeeId: string) {
  const employee = await findEmployeeById(employeeId);
  if (!employee) {
    throw new Error('Sessão inválida.');
  }
  const { passwordHash, ...safeEmployee } = employee;
  return safeEmployee;
}
