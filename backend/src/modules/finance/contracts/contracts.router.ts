import { Router } from 'express';
import * as contractsController from './contracts.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import { createContractSchema, updateContractSchema } from './contracts.schema';

export const contractsRouter = Router();

contractsRouter.get(
  '/',
  authMiddleware,
  requirePermission('finance', 'read'),
  contractsController.listContracts
);

contractsRouter.post(
  '/',
  authMiddleware,
  requirePermission('finance', 'create'),
  validate(createContractSchema),
  contractsController.createContract
);

contractsRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('finance', 'read'),
  contractsController.getContractById
);

contractsRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('finance', 'update'),
  validate(updateContractSchema),
  contractsController.updateContract
);

contractsRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('finance', 'delete'),
  contractsController.deleteContract
);

contractsRouter.post(
  '/:id/activate',
  authMiddleware,
  requirePermission('finance', 'update'),
  contractsController.activateContract
);

contractsRouter.post(
  '/:id/renew',
  authMiddleware,
  requirePermission('finance', 'update'),
  contractsController.renewContract
);

contractsRouter.post(
  '/:id/terminate',
  authMiddleware,
  requirePermission('finance', 'update'),
  contractsController.terminateContract
);

contractsRouter.get(
  '/:id/invoices',
  authMiddleware,
  requirePermission('finance', 'read'),
  contractsController.getContractInvoices
);
