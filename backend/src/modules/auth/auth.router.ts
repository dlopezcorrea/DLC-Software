import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  inviteUserSchema,
} from './auth.schema';

export const authRouter = Router();

// Public routes
authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

// Protected routes
authRouter.get('/me', authMiddleware, authController.getMe);
authRouter.patch('/me', authMiddleware, validate(updateProfileSchema), authController.updateProfile);
authRouter.patch('/me/password', authMiddleware, validate(changePasswordSchema), authController.changePassword);
authRouter.post('/invite', authMiddleware, validate(inviteUserSchema), authController.inviteUser);
