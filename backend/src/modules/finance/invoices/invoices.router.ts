import { Router } from 'express';
import * as invoicesController from './invoices.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import { createInvoiceSchema, updateInvoiceSchema, recordPaymentSchema } from './invoices.schema';

export const invoicesRouter = Router();

invoicesRouter.get(
  '/',
  authMiddleware,
  requirePermission('finance', 'read'),
  invoicesController.listInvoices
);

invoicesRouter.post(
  '/',
  authMiddleware,
  requirePermission('finance', 'create'),
  validate(createInvoiceSchema),
  invoicesController.createInvoice
);

invoicesRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('finance', 'read'),
  invoicesController.getInvoiceById
);

invoicesRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('finance', 'update'),
  validate(updateInvoiceSchema),
  invoicesController.updateInvoice
);

// DELETE → void (not hard delete for non-DRAFT)
invoicesRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('finance', 'delete'),
  invoicesController.deleteInvoice
);

invoicesRouter.post(
  '/:id/send',
  authMiddleware,
  requirePermission('finance', 'update'),
  invoicesController.sendInvoice
);

invoicesRouter.post(
  '/:id/mark-paid',
  authMiddleware,
  requirePermission('finance', 'update'),
  invoicesController.markInvoicePaid
);

invoicesRouter.post(
  '/:id/payments',
  authMiddleware,
  requirePermission('finance', 'update'),
  validate(recordPaymentSchema),
  invoicesController.recordPayment
);

invoicesRouter.get(
  '/:id/payments',
  authMiddleware,
  requirePermission('finance', 'read'),
  invoicesController.getInvoicePayments
);

invoicesRouter.get(
  '/:id/pdf',
  authMiddleware,
  requirePermission('finance', 'read'),
  invoicesController.getInvoicePdfUrl
);
