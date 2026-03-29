import { Request, Response, NextFunction } from 'express';
import * as slaService from './sla.service';
import { sendSuccess } from '../../../utils/response';

export async function listSLAPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const policies = await slaService.listSLAPolicies(req.orgId!);
    sendSuccess(res, policies);
  } catch (err) {
    next(err);
  }
}

export async function getSLAPolicyById(req: Request, res: Response, next: NextFunction) {
  try {
    const policy = await slaService.getSLAPolicyById(req.orgId!, req.params.id);
    sendSuccess(res, policy);
  } catch (err) {
    next(err);
  }
}

export async function createSLAPolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const policy = await slaService.createSLAPolicy(req.orgId!, req.body);
    sendSuccess(res, policy, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateSLAPolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const policy = await slaService.updateSLAPolicy(req.orgId!, req.params.id, req.body);
    sendSuccess(res, policy);
  } catch (err) {
    next(err);
  }
}

export async function deleteSLAPolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await slaService.deleteSLAPolicy(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getSLAReport(req: Request, res: Response, next: NextFunction) {
  try {
    const report = await slaService.getSLAReport(req.orgId!);
    sendSuccess(res, report);
  } catch (err) {
    next(err);
  }
}
