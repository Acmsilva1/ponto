import type { ChangePasswordInput, AuthSession } from '@shared/contracts';
import { changePassword } from '../../../auth/services/authService.js';

export async function updateProfilePassword(input: ChangePasswordInput): Promise<{ employee: AuthSession['employee'] }> {
  return changePassword(input);
}
