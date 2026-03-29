import { Request, Response, NextFunction } from 'express';
import * as organizationsService from './organizations.service';
import { sendSuccess } from '../../utils/response';

export async function getCurrent(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await organizationsService.getOrganization(req.orgId!);
    sendSuccess(res, org);
  } catch (err) {
    next(err);
  }
}

export async function updateCurrent(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await organizationsService.updateOrganization(req.orgId!, req.body);
    sendSuccess(res, org);
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await organizationsService.getOrganizationStats(req.orgId!);
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}
