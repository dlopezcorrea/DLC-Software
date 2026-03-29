import { Request, Response, NextFunction } from 'express';
import * as reportsService from './reports.service';
import { sendSuccess } from '../../../utils/response';

export async function getRevenueReport(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getRevenueReport(
      req.orgId!,
      req.query as Record<string, string>
    );
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getOutstandingAR(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getOutstandingAR(req.orgId!);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getPaymentsReceived(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getPaymentsReceived(
      req.orgId!,
      req.query as Record<string, string>
    );
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getInvoiceAging(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getInvoiceAging(req.orgId!);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getRevenueByAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getRevenueByAccount(
      req.orgId!,
      req.query as Record<string, string>
    );
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}
