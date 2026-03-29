import { Router } from 'express';
import * as reportsController from './reports.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';

export const reportsRouter = Router();

reportsRouter.get(
  '/revenue',
  authMiddleware,
  requirePermission('finance', 'read'),
  reportsController.getRevenueReport
);

reportsRouter.get(
  '/outstanding',
  authMiddleware,
  requirePermission('finance', 'read'),
  reportsController.getOutstandingAR
);

reportsRouter.get(
  '/payments-received',
  authMiddleware,
  requirePermission('finance', 'read'),
  reportsController.getPaymentsReceived
);

reportsRouter.get(
  '/invoice-aging',
  authMiddleware,
  requirePermission('finance', 'read'),
  reportsController.getInvoiceAging
);

reportsRouter.get(
  '/by-account',
  authMiddleware,
  requirePermission('finance', 'read'),
  reportsController.getRevenueByAccount
);
