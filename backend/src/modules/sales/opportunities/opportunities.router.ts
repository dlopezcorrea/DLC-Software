import { Router } from 'express';
import * as opportunitiesController from './opportunities.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  moveStageSchema,
  markLostSchema,
} from './opportunities.schema';

export const opportunitiesRouter = Router();

opportunitiesRouter.get(
  '/',
  authMiddleware,
  requirePermission('sales:opportunities', 'read'),
  opportunitiesController.listOpportunities
);

opportunitiesRouter.post(
  '/',
  authMiddleware,
  requirePermission('sales:opportunities', 'create'),
  validate(createOpportunitySchema),
  opportunitiesController.createOpportunity
);

opportunitiesRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('sales:opportunities', 'read'),
  opportunitiesController.getOpportunityById
);

opportunitiesRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('sales:opportunities', 'update'),
  validate(updateOpportunitySchema),
  opportunitiesController.updateOpportunity
);

opportunitiesRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('sales:opportunities', 'delete'),
  opportunitiesController.deleteOpportunity
);

opportunitiesRouter.patch(
  '/:id/stage',
  authMiddleware,
  requirePermission('sales:opportunities', 'update'),
  validate(moveStageSchema),
  opportunitiesController.moveToStage
);

opportunitiesRouter.post(
  '/:id/won',
  authMiddleware,
  requirePermission('sales:opportunities', 'update'),
  opportunitiesController.markAsWon
);

opportunitiesRouter.post(
  '/:id/lost',
  authMiddleware,
  requirePermission('sales:opportunities', 'update'),
  validate(markLostSchema),
  opportunitiesController.markAsLost
);

opportunitiesRouter.get(
  '/:id/quotes',
  authMiddleware,
  requirePermission('sales:opportunities', 'read'),
  opportunitiesController.getOpportunityQuotes
);
