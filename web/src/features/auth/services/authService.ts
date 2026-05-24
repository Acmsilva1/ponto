import type { AuthSession, ChangePasswordInput, LoginInput, PasswordRecoveryInput, PasswordRecoveryResponse, RegisterInput } from '@shared/contracts';
import { apiRequest } from '../../../lib/apiClient.js';

export async function login(input: LoginInput) {
  return apiRequest<{ session: AuthSession; requiresPasswordChange: boolean }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function register(input: RegisterInput) {
  return apiRequest<{ session: AuthSession }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function registerCollaboratorByManager(input: RegisterInput) {
  return apiRequest<{ employee: AuthSession['employee'] }>('/auth/register-collaborator', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function logout() {
  return apiRequest<{ loggedOut: boolean }>('/auth/logout', { method: 'POST' });
}

export async function me() {
  return apiRequest<{ employee: AuthSession['employee'] }>('/auth/me');
}

export async function changePassword(input: ChangePasswordInput) {
  return apiRequest<{ employee: AuthSession['employee'] }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function recoverPassword(input: PasswordRecoveryInput) {
  return apiRequest<PasswordRecoveryResponse>('/auth/recover-password', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
