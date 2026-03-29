import { Request, Response, NextFunction } from 'express';
import * as accountsService from './accounts.service';
import { sendSuccess } from '../../utils/response';

export async function listAccounts(req: Request, res: Response, next: NextFunction) {
  try {
    const { accounts, meta } = await accountsService.listAccounts(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, accounts, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getAccountById(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await accountsService.getAccountById(req.orgId!, req.params.id);
    sendSuccess(res, account);
  } catch (err) {
    next(err);
  }
}

export async function createAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await accountsService.createAccount(req.orgId!, req.body);
    sendSuccess(res, account, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await accountsService.updateAccount(req.orgId!, req.params.id, req.body);
    sendSuccess(res, account);
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accountsService.deleteAccount(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getAccountContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const { contacts, meta } = await accountsService.getAccountContacts(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, contacts, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getAccountOpportunities(req: Request, res: Response, next: NextFunction) {
  try {
    const { opportunities, meta } = await accountsService.getAccountOpportunities(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, opportunities, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getAccountInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const { invoices, meta } = await accountsService.getAccountInvoices(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, invoices, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getAccountContracts(req: Request, res: Response, next: NextFunction) {
  try {
    const { contracts, meta } = await accountsService.getAccountContracts(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, contracts, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getAccountTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const { tickets, meta } = await accountsService.getAccountTickets(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, tickets, 200, meta);
  } catch (err) {
    next(err);
  }
}
