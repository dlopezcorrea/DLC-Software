import { Router } from 'express';
import * as contactsController from './contacts.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createContactSchema,
  updateContactSchema,
  importContactsSchema,
} from './contacts.schema';

export const contactsRouter = Router();

contactsRouter.get(
  '/',
  authMiddleware,
  requirePermission('contacts', 'read'),
  contactsController.listContacts
);

contactsRouter.post(
  '/',
  authMiddleware,
  requirePermission('contacts', 'create'),
  validate(createContactSchema),
  contactsController.createContact
);

contactsRouter.post(
  '/import',
  authMiddleware,
  requirePermission('contacts', 'create'),
  validate(importContactsSchema),
  contactsController.importContacts
);

contactsRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('contacts', 'read'),
  contactsController.getContactById
);

contactsRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('contacts', 'update'),
  validate(updateContactSchema),
  contactsController.updateContact
);

contactsRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('contacts', 'delete'),
  contactsController.deleteContact
);

contactsRouter.get(
  '/:id/activities',
  authMiddleware,
  requirePermission('contacts', 'read'),
  contactsController.getContactActivities
);

contactsRouter.get(
  '/:id/tickets',
  authMiddleware,
  requirePermission('contacts', 'read'),
  contactsController.getContactTickets
);
