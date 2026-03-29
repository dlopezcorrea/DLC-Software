import { Router } from 'express';
import * as quotesController from './quotes.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createQuoteSchema,
  updateQuoteSchema,
  sendQuoteSchema,
} from './quotes.schema';

export const quotesRouter = Router();

quotesRouter.get(
  '/',
  authMiddleware,
  requirePermission('sales:quotes', 'read'),
  quotesController.listQuotes
);

quotesRouter.post(
  '/',
  authMiddleware,
  requirePermission('sales:quotes', 'create'),
  validate(createQuoteSchema),
  quotesController.createQuote
);

quotesRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('sales:quotes', 'read'),
  quotesController.getQuoteById
);

quotesRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('sales:quotes', 'update'),
  validate(updateQuoteSchema),
  quotesController.updateQuote
);

quotesRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('sales:quotes', 'delete'),
  quotesController.deleteQuote
);

quotesRouter.post(
  '/:id/send',
  authMiddleware,
  requirePermission('sales:quotes', 'update'),
  validate(sendQuoteSchema),
  quotesController.sendQuote
);

quotesRouter.post(
  '/:id/accept',
  authMiddleware,
  requirePermission('sales:quotes', 'update'),
  quotesController.acceptQuote
);

quotesRouter.post(
  '/:id/reject',
  authMiddleware,
  requirePermission('sales:quotes', 'update'),
  quotesController.rejectQuote
);

quotesRouter.post(
  '/:id/convert-to-invoice',
  authMiddleware,
  requirePermission('sales:quotes', 'update'),
  quotesController.convertToInvoice
);
