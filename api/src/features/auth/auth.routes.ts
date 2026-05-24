import { Router } from 'express';
import { changePasswordController, loginController, logoutController, meController, recoverPasswordController, registerController } from './auth.controller.js';
import { requireAuth } from '../../lib/http.js';

export const authRoutes = Router();

authRoutes.post('/login', loginController);
authRoutes.post('/register', registerController);
authRoutes.post('/logout', logoutController);
authRoutes.get('/me', requireAuth, meController);
authRoutes.post('/change-password', requireAuth, changePasswordController);
authRoutes.post('/recover-password', recoverPasswordController);
