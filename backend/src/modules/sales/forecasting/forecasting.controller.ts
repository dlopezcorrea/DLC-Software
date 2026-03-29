import { Request, Response, NextFunction } from 'express';
import * as forecastingService from './forecasting.service';
import { sendSuccess } from '../../../utils/response';

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await forecastingService.getSummary(req.orgId!);
    sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
}

export async function getByStage(req: Request, res: Response, next: NextFunction) {
  try {
    const pipelineId =
      typeof req.query.pipelineId === 'string' ? req.query.pipelineId : undefined;
    const data = await forecastingService.getByStage(req.orgId!, pipelineId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getByUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await forecastingService.getByUser(req.orgId!);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getByPeriod(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = req.query.period;
    const period =
      raw === 'month' || raw === 'quarter' || raw === 'year' ? raw : 'month';
    const data = await forecastingService.getByPeriod(req.orgId!, period);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getConversionRates(req: Request, res: Response, next: NextFunction) {
  try {
    const pipelineId =
      typeof req.query.pipelineId === 'string' ? req.query.pipelineId : undefined;
    const data = await forecastingService.getConversionRates(req.orgId!, pipelineId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}
