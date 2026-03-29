import { Request, Response, NextFunction } from 'express';
import * as contactsService from './contacts.service';
import { sendSuccess } from '../../utils/response';

export async function listContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const { contacts, meta } = await contactsService.listContacts(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, contacts, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getContactById(req: Request, res: Response, next: NextFunction) {
  try {
    const contact = await contactsService.getContactById(req.orgId!, req.params.id);
    sendSuccess(res, contact);
  } catch (err) {
    next(err);
  }
}

export async function createContact(req: Request, res: Response, next: NextFunction) {
  try {
    const contact = await contactsService.createContact(req.orgId!, req.body);
    sendSuccess(res, contact, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateContact(req: Request, res: Response, next: NextFunction) {
  try {
    const contact = await contactsService.updateContact(req.orgId!, req.params.id, req.body);
    sendSuccess(res, contact);
  } catch (err) {
    next(err);
  }
}

export async function deleteContact(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contactsService.deleteContact(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function importContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contactsService.importContacts(req.orgId!, req.body.contacts);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function getContactActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const { activities, meta } = await contactsService.getContactActivities(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, activities, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getContactTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const { tickets, meta } = await contactsService.getContactTickets(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, tickets, 200, meta);
  } catch (err) {
    next(err);
  }
}
