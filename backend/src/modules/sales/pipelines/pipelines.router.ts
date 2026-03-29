import { Router } from 'express';
import * as pipelinesController from './pipelines.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createPipelineSchema,
  updatePipelineSchema,
  createStageSchema,
  updateStageSchema,
  reorderStagesSchema,
} from './pipelines.schema';

export const pipelinesRouter = Router();

pipelinesRouter.get(
  '/',
  authMiddleware,
  pipelinesController.listPipelines
);

pipelinesRouter.post(
  '/',
  authMiddleware,
  requirePermission('sales', 'create'),
  validate(createPipelineSchema),
  pipelinesController.createPipeline
);

pipelinesRouter.get(
  '/:id',
  authMiddleware,
  pipelinesController.getPipelineById
);

pipelinesRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('sales', 'update'),
  validate(updatePipelineSchema),
  pipelinesController.updatePipeline
);

pipelinesRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('sales', 'delete'),
  pipelinesController.deletePipeline
);

// Stage routes — reorder must be defined before /:stageId to avoid route collision
pipelinesRouter.patch(
  '/:id/stages/reorder',
  authMiddleware,
  requirePermission('sales', 'update'),
  validate(reorderStagesSchema),
  pipelinesController.reorderStages
);

pipelinesRouter.post(
  '/:id/stages',
  authMiddleware,
  requirePermission('sales', 'update'),
  validate(createStageSchema),
  pipelinesController.addStage
);

pipelinesRouter.patch(
  '/:id/stages/:stageId',
  authMiddleware,
  requirePermission('sales', 'update'),
  validate(updateStageSchema),
  pipelinesController.updateStage
);

pipelinesRouter.delete(
  '/:id/stages/:stageId',
  authMiddleware,
  requirePermission('sales', 'update'),
  pipelinesController.deleteStage
);
