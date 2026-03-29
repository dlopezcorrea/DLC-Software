import { Request, Response, NextFunction } from 'express';
import * as quotesService from './quotes.service';
import { sendSuccess } from '../../../utils/response';

export async function listQuotes(req: Request, res: Response, next: NextFunction) {
  try {
    const { quotes, meta } = await quotesService.listQuotes(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, quotes, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getQuoteById(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.getQuoteById(req.orgId!, req.params.id);
    sendSuccess(res, quote);
  } catch (err) {
    next(err);
  }
}

export async function createQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.createQuote(req.orgId!, req.body);
    sendSuccess(res, quote, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.updateQuote(req.orgId!, req.params.id, req.body);
    sendSuccess(res, quote);
  } catch (err) {
    next(err);
  }
}

export async function deleteQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await quotesService.deleteQuote(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function sendQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.sendQuote(req.orgId!, req.params.id, req.body.email);
    sendSuccess(res, quote);
  } catch (err) {
    next(err);
  }
}

export async function acceptQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.acceptQuote(req.orgId!, req.params.id);
    sendSuccess(res, quote);
  } catch (err) {
    next(err);
  }
}

export async function rejectQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.rejectQuote(req.orgId!, req.params.id);
    sendSuccess(res, quote);
  } catch (err) {
    next(err);
  }
}

export async function convertToInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await quotesService.convertToInvoice(
      req.orgId!,
      req.params.id,
      req.user!.id
    );
    sendSuccess(res, invoice, 201);
  } catch (err) {
    next(err);
  }
}
