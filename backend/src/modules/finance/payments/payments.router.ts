import { Router } from 'express';
import * as paymentsController from './payments.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createPaymentSchema,
  updatePaymentSchema,
  refundPaymentSchema,
} from './payments.schema';

export const paymentsRouter = Router();

paymentsRouter.get(
  '/',
  authMiddleware,
  requirePermission('finance', 'read'),
  paymentsController.listPayments
);

paymentsRouter.post(
  '/',
  authMiddleware,
  requirePermission('finance', 'create'),
  validate(createPaymentSchema),
  paymentsController.createPayment
);

paymentsRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('finance', 'read'),
  paymentsController.getPaymentById
);

paymentsRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('finance', 'update'),
  validate(updatePaymentSchema),
  paymentsController.updatePayment
);

paymentsRouter.post(
  '/:id/refund',
  authMiddleware,
  requirePermission('finance', 'update'),
  validate(refundPaymentSchema),
  paymentsController.refundPayment
);
