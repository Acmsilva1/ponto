import type { Request, Response } from 'express';
import { clearSessionCookie, getSession, jsonError, jsonOk, setSessionCookie } from '../../lib/http.js';
import {
  validateChangePasswordInput,
  validateLoginInput,
  validateManagerRegisterInput,
  validatePasswordRecoveryInput,
  validateRegisterInput
} from './auth.validators.js';
import { changePassword, getCurrentUser, login, recoverPassword, registerCollaborator, registerCollaboratorByManager } from './auth.service.js';

export async function loginController(req: Request, res: Response) {
  try {
    const input = validateLoginInput(req.body);
    const result = await login(input);
    setSessionCookie(res, result.session.token);
    return jsonOk(res, { session: result.session, requiresPasswordChange: result.requiresPasswordChange });
  } catch (error) {
    return jsonError(res, 400, error instanceof Error ? error.message : 'Falha no login.');
  }
}

export async function registerController(req: Request, res: Response) {
  try {
    const input = validateRegisterInput(req.body);
    const result = await registerCollaborator(input);
    setSessionCookie(res, result.session.token);
    return jsonOk(res, { session: result.session });
  } catch (error) {
    return jsonError(res, 400, error instanceof Error ? error.message : 'Falha ao registrar.');
  }
}

export async function registerCollaboratorByManagerController(req: Request, res: Response) {
  try {
    const input = validateManagerRegisterInput(req.body);
    const session = getSession(req);
    if (!session || session.role !== 'gestor') {
      return jsonError(res, 403, 'Permissão insuficiente.');
    }

    const employee = await registerCollaboratorByManager(input);
    return jsonOk(res, { employee });
  } catch (error) {
    return jsonError(res, 400, error instanceof Error ? error.message : 'Falha ao registrar.');
  }
}

export async function logoutController(_req: Request, res: Response) {
  clearSessionCookie(res);
  return jsonOk(res, { loggedOut: true });
}

export async function meController(req: Request, res: Response) {
  try {
    const session = getSession(req);
    if (!session?.sub) {
      return jsonError(res, 401, 'Sessão inválida.');
    }
    const employee = await getCurrentUser(session.sub);
    return jsonOk(res, { employee });
  } catch (error) {
    return jsonError(res, 401, error instanceof Error ? error.message : 'Sessão inválida.');
  }
}

export async function changePasswordController(req: Request, res: Response) {
  try {
    const session = getSession(req);
    if (!session?.sub) {
      return jsonError(res, 401, 'Sessão inválida.');
    }
    const input = validateChangePasswordInput(req.body);
    const employee = await changePassword(session.sub, input);
    return jsonOk(res, { employee });
  } catch (error) {
    return jsonError(res, 400, error instanceof Error ? error.message : 'Falha ao alterar senha.');
  }
}

export async function recoverPasswordController(req: Request, res: Response) {
  try {
    const input = validatePasswordRecoveryInput(req.body);
    const result = await recoverPassword(input);
    return jsonOk(res, result);
  } catch (error) {
    return jsonError(res, 400, error instanceof Error ? error.message : 'Falha ao recuperar senha.');
  }
}
