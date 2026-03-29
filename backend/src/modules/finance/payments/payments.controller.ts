import { Request, Response, NextFunction } from 'express';
import * as paymentsService from './payments.service';
import { sendSuccess } from '../../../utils/response';

export async function listPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const { payments, meta } = await paymentsService.listPayments(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, payments, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getPaymentById(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await paymentsService.getPaymentById(req.orgId!, req.params.id);
    sendSuccess(res, payment);
  } catch (err) {
    next(err);
  }
}

export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentsService.createPayment(req.orgId!, req.body);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function updatePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await paymentsService.updatePayment(req.orgId!, req.params.id, req.body);
    sendSuccess(res, payment);
  } catch (err) {
    next(err);
  }
}

export async function refundPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentsService.refundPayment(req.orgId!, req.params.id, req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
