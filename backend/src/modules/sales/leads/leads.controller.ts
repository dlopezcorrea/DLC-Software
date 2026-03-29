import { Request, Response, NextFunction } from 'express';
import * as leadsService from './leads.service';
import { sendSuccess } from '../../../utils/response';

export async function listLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const { leads, meta } = await leadsService.listLeads(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, leads, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getLeadById(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await leadsService.getLeadById(req.orgId!, req.params.id);
    sendSuccess(res, lead);
  } catch (err) {
    next(err);
  }
}

export async function createLead(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await leadsService.createLead(req.orgId!, req.body);
    sendSuccess(res, lead, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateLead(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await leadsService.updateLead(req.orgId!, req.params.id, req.body);
    sendSuccess(res, lead);
  } catch (err) {
    next(err);
  }
}

export async function deleteLead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leadsService.deleteLead(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function convertLead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leadsService.convertLead(
      req.orgId!,
      req.params.id,
      req.body,
      req.user!.id
    );
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function assignLead(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await leadsService.assignLead(
      req.orgId!,
      req.params.id,
      req.body.assigneeId
    );
    sendSuccess(res, lead);
  } catch (err) {
    next(err);
  }
}

export async function importLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leadsService.importLeads(req.orgId!, req.body.leads);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}
