import { Router } from 'express';
import * as ticketsController from './tickets.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createTicketSchema,
  updateTicketSchema,
  assignTicketSchema,
  changeStatusSchema,
  createCommentSchema,
  updateCommentSchema,
} from './tickets.schema';

export const ticketsRouter = Router();

ticketsRouter.get(
  '/stats',
  authMiddleware,
  requirePermission('tickets', 'read'),
  ticketsController.getTicketStats
);

ticketsRouter.get(
  '/',
  authMiddleware,
  requirePermission('tickets', 'read'),
  ticketsController.listTickets
);

ticketsRouter.post(
  '/',
  authMiddleware,
  requirePermission('tickets', 'create'),
  validate(createTicketSchema),
  ticketsController.createTicket
);

ticketsRouter.get(
  '/:id',
  authMiddleware,
  requirePermission('tickets', 'read'),
  ticketsController.getTicketById
);

ticketsRouter.patch(
  '/:id',
  authMiddleware,
  requirePermission('tickets', 'update'),
  validate(updateTicketSchema),
  ticketsController.updateTicket
);

ticketsRouter.delete(
  '/:id',
  authMiddleware,
  requirePermission('tickets', 'delete'),
  ticketsController.deleteTicket
);

ticketsRouter.patch(
  '/:id/assign',
  authMiddleware,
  requirePermission('tickets', 'update'),
  validate(assignTicketSchema),
  ticketsController.assignTicket
);

ticketsRouter.patch(
  '/:id/status',
  authMiddleware,
  requirePermission('tickets', 'update'),
  validate(changeStatusSchema),
  ticketsController.changeStatus
);

ticketsRouter.post(
  '/:id/comments',
  authMiddleware,
  requirePermission('tickets', 'update'),
  validate(createCommentSchema),
  ticketsController.addComment
);

ticketsRouter.patch(
  '/:id/comments/:commentId',
  authMiddleware,
  requirePermission('tickets', 'update'),
  validate(updateCommentSchema),
  ticketsController.updateComment
);

ticketsRouter.delete(
  '/:id/comments/:commentId',
  authMiddleware,
  requirePermission('tickets', 'update'),
  ticketsController.deleteComment
);
