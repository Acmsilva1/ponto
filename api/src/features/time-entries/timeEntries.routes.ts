import { Router } from 'express';
import { requireAuth } from '../../lib/http.js';
import { createTimeEntryController, listTimeEntriesController } from './timeEntries.controller.js';

export const timeEntriesRoutes = Router();

timeEntriesRoutes.get('/', requireAuth, listTimeEntriesController);
timeEntriesRoutes.post('/', requireAuth, createTimeEntryController);
