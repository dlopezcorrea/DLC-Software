import { Router } from 'express';
import * as activitiesController from './activities.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import { createActivitySchema, updateActivitySchema } from './activities.schema';

export const activitiesRouter = Router();

activitiesRouter.get(
  '/',
  authMiddleware,
  requirePermission('sales:activities', 'read'),
  activitiesController.listActivities
);

activitiesRouter.post(
  '/',
  authMiddleware,
  requirePermission('sales:activities', 'create'),
  validate(createActivitySchema),
  activitiesController.createActivity
);

activitiesRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('sales:activities', 'read'),
  activitiesController.getActivityById
);

activitiesRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('sales:activities', 'update'),
  validate(updateActivitySchema),
  activitiesController.updateActivity
);

activitiesRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('sales:activities', 'delete'),
  activitiesController.deleteActivity
);

activitiesRouter.patch(
  '/:id/complete',
  authMiddleware,
  requirePermission('sales:activities', 'update'),
  activitiesController.completeActivity
);
