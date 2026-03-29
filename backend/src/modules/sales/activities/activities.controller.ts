import { Request, Response, NextFunction } from 'express';
import * as activitiesService from './activities.service';
import { sendSuccess } from '../../../utils/response';

export async function listActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const { activities, meta } = await activitiesService.listActivities(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, activities, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getActivityById(req: Request, res: Response, next: NextFunction) {
  try {
    const activity = await activitiesService.getActivityById(req.orgId!, req.params.id);
    sendSuccess(res, activity);
  } catch (err) {
    next(err);
  }
}

export async function createActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const activity = await activitiesService.createActivity(
      req.orgId!,
      req.user!.id,
      req.body
    );
    sendSuccess(res, activity, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const activity = await activitiesService.updateActivity(
      req.orgId!,
      req.params.id,
      req.body
    );
    sendSuccess(res, activity);
  } catch (err) {
    next(err);
  }
}

export async function deleteActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await activitiesService.deleteActivity(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function completeActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const activity = await activitiesService.completeActivity(req.orgId!, req.params.id);
    sendSuccess(res, activity);
  } catch (err) {
    next(err);
  }
}
