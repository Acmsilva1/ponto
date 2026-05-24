import type {
  ChangePasswordInput,
  LoginInput,
  ManagerRegisterInput,
  PasswordRecoveryInput,
  RegisterInput
} from '../../../../shared/src/contracts.js';

export function validateLoginInput(input: unknown): LoginInput {
  const payload = input as Partial<LoginInput>;
  if (!payload.registryId || !payload.password) {
    throw new Error('ID/registro e senha são obrigatórios.');
  }
  return { registryId: String(payload.registryId).trim(), password: String(payload.password) };
}

export function validateRegisterInput(input: unknown): RegisterInput {
  const payload = input as Partial<RegisterInput>;
  if (!payload.name || !payload.role || !payload.department || !payload.password) {
    throw new Error('Nome, função, setor e senha são obrigatórios.');
  }
  return {
    name: String(payload.name).trim(),
    role: String(payload.role).trim(),
    department: String(payload.department).trim(),
    password: String(payload.password)
  };
}

export function validateManagerRegisterInput(input: unknown): ManagerRegisterInput {
  const payload = input as Partial<ManagerRegisterInput>;
  if (!payload.name || !payload.role || !payload.registryId) {
    throw new Error('Nome, função e matrícula são obrigatórios.');
  }
  return {
    name: String(payload.name).trim(),
    role: String(payload.role).trim(),
    registryId: String(payload.registryId).trim().toUpperCase()
  };
}

export function validateChangePasswordInput(input: unknown): ChangePasswordInput {
  const payload = input as Partial<ChangePasswordInput>;
  if (!payload.currentPassword || !payload.newPassword) {
    throw new Error('Senha atual e nova senha são obrigatórias.');
  }
  return {
    currentPassword: String(payload.currentPassword),
    newPassword: String(payload.newPassword)
  };
}

export function validatePasswordRecoveryInput(input: unknown): PasswordRecoveryInput {
  const payload = input as Partial<PasswordRecoveryInput>;
  if (!payload.registryId) {
    throw new Error('Registro é obrigatório para recuperação.');
  }

  return {
    registryId: String(payload.registryId).trim()
  };
}
