import { Request, Response, NextFunction } from 'express';
import * as ticketsService from './tickets.service';
import { sendSuccess } from '../../../utils/response';

export async function listTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const { tickets, meta } = await ticketsService.listTickets(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, tickets, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getTicketById(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketsService.getTicketById(req.orgId!, req.params.id);
    sendSuccess(res, ticket);
  } catch (err) {
    next(err);
  }
}

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketsService.createTicket(req.orgId!, req.user!.id, req.body);
    sendSuccess(res, ticket, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketsService.updateTicket(req.orgId!, req.params.id, req.body);
    sendSuccess(res, ticket);
  } catch (err) {
    next(err);
  }
}

export async function deleteTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ticketsService.deleteTicket(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function assignTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketsService.assignTicket(
      req.orgId!,
      req.params.id,
      req.body.assigneeId
    );
    sendSuccess(res, ticket);
  } catch (err) {
    next(err);
  }
}

export async function changeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketsService.changeStatus(
      req.orgId!,
      req.params.id,
      req.body.status,
      req.user!.id
    );
    sendSuccess(res, ticket);
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await ticketsService.addComment(
      req.orgId!,
      req.params.id,
      req.user!.id,
      req.body
    );
    sendSuccess(res, comment, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateComment(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await ticketsService.updateComment(
      req.orgId!,
      req.params.commentId,
      req.user!.id,
      req.body.body
    );
    sendSuccess(res, comment);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ticketsService.deleteComment(
      req.orgId!,
      req.params.commentId,
      req.user!.id
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getTicketStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await ticketsService.getTicketStats(req.orgId!);
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}
