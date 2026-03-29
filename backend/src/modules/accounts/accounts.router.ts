import { Router } from 'express';
import * as accountsController from './accounts.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createAccountSchema, updateAccountSchema } from './accounts.schema';

export const accountsRouter = Router();

accountsRouter.get(
  '/',
  authMiddleware,
  requirePermission('accounts', 'read'),
  accountsController.listAccounts
);

accountsRouter.post(
  '/',
  authMiddleware,
  requirePermission('accounts', 'create'),
  validate(createAccountSchema),
  accountsController.createAccount
);

accountsRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('accounts', 'read'),
  accountsController.getAccountById
);

accountsRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('accounts', 'update'),
  validate(updateAccountSchema),
  accountsController.updateAccount
);

accountsRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('accounts', 'delete'),
  accountsController.deleteAccount
);

accountsRouter.get(
  '/:id/contacts',
  authMiddleware,
  requirePermission('accounts', 'read'),
  accountsController.getAccountContacts
);

accountsRouter.get(
  '/:id/opportunities',
  authMiddleware,
  requirePermission('accounts', 'read'),
  accountsController.getAccountOpportunities
);

accountsRouter.get(
  '/:id/invoices',
  authMiddleware,
  requirePermission('accounts', 'read'),
  accountsController.getAccountInvoices
);

accountsRouter.get(
  '/:id/contracts',
  authMiddleware,
  requirePermission('accounts', 'read'),
  accountsController.getAccountContracts
);

accountsRouter.get(
  '/:id/tickets',
  authMiddleware,
  requirePermission('accounts', 'read'),
  accountsController.getAccountTickets
);
