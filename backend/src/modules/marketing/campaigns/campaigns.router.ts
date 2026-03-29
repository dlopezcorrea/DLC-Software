import { Router } from 'express';
import * as campaignsController from './campaigns.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createCampaignSchema,
  updateCampaignSchema,
  scheduleCampaignSchema,
} from './campaigns.schema';

export const campaignsRouter = Router();

campaignsRouter.get(
  '/',
  authMiddleware,
  requirePermission('marketing', 'read'),
  campaignsController.listCampaigns
);

campaignsRouter.post(
  '/',
  authMiddleware,
  requirePermission('marketing', 'create'),
  validate(createCampaignSchema),
  campaignsController.createCampaign
);

campaignsRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('marketing', 'read'),
  campaignsController.getCampaignById
);

campaignsRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('marketing', 'update'),
  validate(updateCampaignSchema),
  campaignsController.updateCampaign
);

campaignsRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('marketing', 'delete'),
  campaignsController.deleteCampaign
);

campaignsRouter.post(
  '/:id/schedule',
  authMiddleware,
  requirePermission('marketing', 'update'),
  validate(scheduleCampaignSchema),
  campaignsController.scheduleCampaign
);

campaignsRouter.post(
  '/:id/send-now',
  authMiddleware,
  requirePermission('marketing', 'update'),
  campaignsController.sendNow
);

campaignsRouter.post(
  '/:id/pause',
  authMiddleware,
  requirePermission('marketing', 'update'),
  campaignsController.pauseCampaign
);

campaignsRouter.post(
  '/:id/cancel',
  authMiddleware,
  requirePermission('marketing', 'update'),
  campaignsController.cancelCampaign
);

campaignsRouter.get(
  '/:id/analytics',
  authMiddleware,
  requirePermission('marketing', 'read'),
  campaignsController.getCampaignAnalytics
);

campaignsRouter.get(
  '/:id/contacts',
  authMiddleware,
  requirePermission('marketing', 'read'),
  campaignsController.getCampaignContacts
);
