import { Request, Response, NextFunction } from 'express';
import * as opportunitiesService from './opportunities.service';
import { sendSuccess } from '../../../utils/response';

export async function listOpportunities(req: Request, res: Response, next: NextFunction) {
  try {
    const { opportunities, meta } = await opportunitiesService.listOpportunities(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, opportunities, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getOpportunityById(req: Request, res: Response, next: NextFunction) {
  try {
    const opportunity = await opportunitiesService.getOpportunityById(
      req.orgId!,
      req.params.id
    );
    sendSuccess(res, opportunity);
  } catch (err) {
    next(err);
  }
}

export async function createOpportunity(req: Request, res: Response, next: NextFunction) {
  try {
    const opportunity = await opportunitiesService.createOpportunity(req.orgId!, req.body);
    sendSuccess(res, opportunity, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateOpportunity(req: Request, res: Response, next: NextFunction) {
  try {
    const opportunity = await opportunitiesService.updateOpportunity(
      req.orgId!,
      req.params.id,
      req.body
    );
    sendSuccess(res, opportunity);
  } catch (err) {
    next(err);
  }
}

export async function deleteOpportunity(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await opportunitiesService.deleteOpportunity(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function moveToStage(req: Request, res: Response, next: NextFunction) {
  try {
    const opportunity = await opportunitiesService.moveToStage(
      req.orgId!,
      req.params.id,
      req.body.stageId
    );
    sendSuccess(res, opportunity);
  } catch (err) {
    next(err);
  }
}

export async function markAsWon(req: Request, res: Response, next: NextFunction) {
  try {
    const opportunity = await opportunitiesService.markAsWon(
      req.orgId!,
      req.params.id,
      req.user!.id
    );
    sendSuccess(res, opportunity);
  } catch (err) {
    next(err);
  }
}

export async function markAsLost(req: Request, res: Response, next: NextFunction) {
  try {
    const opportunity = await opportunitiesService.markAsLost(
      req.orgId!,
      req.params.id,
      req.body
    );
    sendSuccess(res, opportunity);
  } catch (err) {
    next(err);
  }
}

export async function getOpportunityQuotes(req: Request, res: Response, next: NextFunction) {
  try {
    const quotes = await opportunitiesService.getOpportunityQuotes(
      req.orgId!,
      req.params.id
    );
    sendSuccess(res, quotes);
  } catch (err) {
    next(err);
  }
}
