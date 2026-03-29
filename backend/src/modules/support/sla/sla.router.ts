import { Router } from 'express';
import * as slaController from './sla.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import { createSLASchema, updateSLASchema } from './sla.schema';

export const slaRouter = Router();

slaRouter.get(
  '/report',
  authMiddleware,
  requirePermission('support:sla', 'read'),
  slaController.getSLAReport
);

slaRouter.get(
  '/',
  authMiddleware,
  requirePermission('support:sla', 'read'),
  slaController.listSLAPolicies
);

slaRouter.post(
  '/',
  authMiddleware,
  requirePermission('support:sla', 'create'),
  validate(createSLASchema),
  slaController.createSLAPolicy
);

slaRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('support:sla', 'read'),
  slaController.getSLAPolicyById
);

slaRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('support:sla', 'update'),
  validate(updateSLASchema),
  slaController.updateSLAPolicy
);

slaRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('support:sla', 'delete'),
  slaController.deleteSLAPolicy
);
