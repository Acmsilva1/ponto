import type { Request, Response } from 'express';
import { jsonError, jsonOk, getSession, requireRole } from '../../lib/http.js';
import { removeEmployee, getEmployees, updateEmployee } from './employees.service.js';

export async function listEmployeesController(_req: Request, res: Response) {
  try {
    const employees = await getEmployees();
    return jsonOk(res, { employees });
  } catch (error) {
    return jsonError(res, 500, error instanceof Error ? error.message : 'Falha ao listar colaboradores.');
  }
}

export async function updateEmployeeController(req: Request, res: Response) {
  try {
    const session = getSession(req);
    if (!session || session.role !== 'gestor') {
      return jsonError(res, 403, 'Permissão insuficiente.');
    }

    const employeeId = String(req.params.id || '').trim();
    if (!employeeId) {
      return jsonError(res, 400, 'Colaborador inválido.');
    }

    const updated = await updateEmployee(employeeId, {
      name: req.body?.name,
      role: req.body?.role,
      registryId: req.body?.registryId
    });

    return jsonOk(res, { employee: updated });
  } catch (error) {
    return jsonError(res, 400, error instanceof Error ? error.message : 'Falha ao atualizar colaborador.');
  }
}

export async function deleteEmployeeController(req: Request, res: Response) {
  try {
    const session = getSession(req);
    if (!session || session.role !== 'gestor') {
      return jsonError(res, 403, 'Permissão insuficiente.');
    }

    const employeeId = String(req.params.id || '').trim();
    if (!employeeId) {
      return jsonError(res, 400, 'Colaborador inválido.');
    }

    const result = await removeEmployee(employeeId);
    return jsonOk(res, result);
  } catch (error) {
    return jsonError(res, 400, error instanceof Error ? error.message : 'Falha ao remover colaborador.');
  }
}
