import { Router } from 'express';
import * as segmentsController from './segments.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import { createSegmentSchema, updateSegmentSchema } from './segments.schema';

export const segmentsRouter = Router();

segmentsRouter.get(
  '/',
  authMiddleware,
  requirePermission('marketing', 'read'),
  segmentsController.listSegments
);

segmentsRouter.post(
  '/',
  authMiddleware,
  requirePermission('marketing', 'create'),
  validate(createSegmentSchema),
  segmentsController.createSegment
);

segmentsRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('marketing', 'read'),
  segmentsController.getSegmentById
);

segmentsRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('marketing', 'update'),
  validate(updateSegmentSchema),
  segmentsController.updateSegment
);

segmentsRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('marketing', 'delete'),
  segmentsController.deleteSegment
);

segmentsRouter.post(
  '/:id/refresh',
  authMiddleware,
  requirePermission('marketing', 'update'),
  segmentsController.refreshSegment
);

segmentsRouter.get(
  '/:id/contacts',
  authMiddleware,
  requirePermission('marketing', 'read'),
  segmentsController.getSegmentContacts
);
