import { Router } from 'express';
import { requireAuth } from '../../lib/http.js';
import { createJustificationController, listJustificationsController } from './justifications.controller.js';

export const justificationsRoutes = Router();

justificationsRoutes.get('/', requireAuth, listJustificationsController);
justificationsRoutes.post('/', requireAuth, createJustificationController);
