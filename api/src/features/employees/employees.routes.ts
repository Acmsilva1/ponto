import { Router } from 'express';
import { deleteEmployeeController, listEmployeesController, updateEmployeeController } from './employees.controller.js';
import { requireAuth, requireRole } from '../../lib/http.js';

export const employeesRoutes = Router();

employeesRoutes.get('/', requireAuth, requireRole('gestor'), listEmployeesController);
employeesRoutes.patch('/:id', requireAuth, requireRole('gestor'), updateEmployeeController);
employeesRoutes.delete('/:id', requireAuth, requireRole('gestor'), deleteEmployeeController);
