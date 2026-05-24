import type { Request, Response } from 'express';
import { getSession, jsonError, jsonOk } from '../../lib/http.js';
import { getDashboardSummary } from './dashboard.service.js';

export async function dashboardController(req: Request, res: Response) {
  try {
    const session = getSession(req);
    if (!session) {
      return jsonError(res, 401, 'Autenticação obrigatória.');
    }

    const summary = await getDashboardSummary({
      role: session.role,
      employeeId: session.sub
    });
    return jsonOk(res, { summary });
  } catch (error) {
    return jsonError(res, 500, error instanceof Error ? error.message : 'Falha ao carregar painel.');
  }
}
