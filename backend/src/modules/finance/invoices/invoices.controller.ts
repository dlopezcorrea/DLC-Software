import { Request, Response, NextFunction } from 'express';
import * as invoicesService from './invoices.service';
import { sendSuccess } from '../../../utils/response';

export async function listInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const { invoices, meta } = await invoicesService.listInvoices(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, invoices, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getInvoiceById(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoicesService.getInvoiceById(req.orgId!, req.params.id);
    sendSuccess(res, invoice);
  } catch (err) {
    next(err);
  }
}

export async function createInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoicesService.createInvoice(req.orgId!, req.body);
    sendSuccess(res, invoice, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoicesService.updateInvoice(req.orgId!, req.params.id, req.body);
    sendSuccess(res, invoice);
  } catch (err) {
    next(err);
  }
}

export async function deleteInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await invoicesService.voidInvoice(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function sendInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoicesService.sendInvoice(req.orgId!, req.params.id);
    sendSuccess(res, invoice);
  } catch (err) {
    next(err);
  }
}

export async function recordPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await invoicesService.recordPayment(req.orgId!, req.params.id, req.body);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function markInvoicePaid(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await invoicesService.markInvoicePaid(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getInvoicePayments(req: Request, res: Response, next: NextFunction) {
  try {
    const payments = await invoicesService.getInvoicePayments(req.orgId!, req.params.id);
    sendSuccess(res, payments);
  } catch (err) {
    next(err);
  }
}

export async function getInvoicePdfUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await invoicesService.getInvoicePdfUrl(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
