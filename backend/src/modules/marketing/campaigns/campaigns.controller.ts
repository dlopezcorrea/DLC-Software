import { Request, Response, NextFunction } from 'express';
import * as campaignsService from './campaigns.service';
import { sendSuccess } from '../../../utils/response';

export async function listCampaigns(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaigns, meta } = await campaignsService.listCampaigns(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, campaigns, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getCampaignById(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignsService.getCampaignById(req.orgId!, req.params.id);
    sendSuccess(res, campaign);
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignsService.createCampaign(req.orgId!, req.body);
    sendSuccess(res, campaign, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignsService.updateCampaign(req.orgId!, req.params.id, req.body);
    sendSuccess(res, campaign);
  } catch (err) {
    next(err);
  }
}

export async function deleteCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await campaignsService.deleteCampaign(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function scheduleCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignsService.scheduleCampaign(
      req.orgId!,
      req.params.id,
      req.body.scheduledAt
    );
    sendSuccess(res, campaign);
  } catch (err) {
    next(err);
  }
}

export async function sendNow(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignsService.sendNow(req.orgId!, req.params.id);
    sendSuccess(res, campaign);
  } catch (err) {
    next(err);
  }
}

export async function pauseCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignsService.pauseCampaign(req.orgId!, req.params.id);
    sendSuccess(res, campaign);
  } catch (err) {
    next(err);
  }
}

export async function cancelCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignsService.cancelCampaign(req.orgId!, req.params.id);
    sendSuccess(res, campaign);
  } catch (err) {
    next(err);
  }
}

export async function getCampaignAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await campaignsService.getCampaignAnalytics(req.orgId!, req.params.id);
    sendSuccess(res, analytics);
  } catch (err) {
    next(err);
  }
}

export async function getCampaignContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const { contacts, meta } = await campaignsService.getCampaignContacts(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, contacts, 200, meta);
  } catch (err) {
    next(err);
  }
}
