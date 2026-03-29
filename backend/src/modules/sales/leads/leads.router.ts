import { Router } from 'express';
import * as leadsController from './leads.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  convertLeadSchema,
  assignLeadSchema,
  importLeadsSchema,
} from './leads.schema';

export const leadsRouter = Router();

leadsRouter.get(
  '/',
  authMiddleware,
  requirePermission('sales:leads', 'read'),
  leadsController.listLeads
);

leadsRouter.post(
  '/',
  authMiddleware,
  requirePermission('sales:leads', 'create'),
  validate(createLeadSchema),
  leadsController.createLead
);

leadsRouter.post(
  '/import',
  authMiddleware,
  requirePermission('sales:leads', 'create'),
  validate(importLeadsSchema),
  leadsController.importLeads
);

leadsRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('sales:leads', 'read'),
  leadsController.getLeadById
);

leadsRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('sales:leads', 'update'),
  validate(updateLeadSchema),
  leadsController.updateLead
);

leadsRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('sales:leads', 'delete'),
  leadsController.deleteLead
);

leadsRouter.post(
  '/:id/convert',
  authMiddleware,
  requirePermission('sales:leads', 'update'),
  validate(convertLeadSchema),
  leadsController.convertLead
);

leadsRouter.patch(
  '/:id/assign',
  authMiddleware,
  requirePermission('sales:leads', 'update'),
  validate(assignLeadSchema),
  leadsController.assignLead
);
