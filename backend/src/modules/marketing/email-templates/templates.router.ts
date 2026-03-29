import { Router } from 'express';
import * as templatesController from './templates.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createTemplateSchema,
  updateTemplateSchema,
  previewTemplateSchema,
} from './templates.schema';

export const templatesRouter = Router();

templatesRouter.get(
  '/',
  authMiddleware,
  requirePermission('marketing', 'read'),
  templatesController.listTemplates
);

templatesRouter.post(
  '/',
  authMiddleware,
  requirePermission('marketing', 'create'),
  validate(createTemplateSchema),
  templatesController.createTemplate
);

templatesRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('marketing', 'read'),
  templatesController.getTemplateById
);

templatesRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('marketing', 'update'),
  validate(updateTemplateSchema),
  templatesController.updateTemplate
);

templatesRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('marketing', 'delete'),
  templatesController.deleteTemplate
);

templatesRouter.post(
  '/:id/preview',
  authMiddleware,
  requirePermission('marketing', 'read'),
  validate(previewTemplateSchema),
  templatesController.previewTemplate
);
