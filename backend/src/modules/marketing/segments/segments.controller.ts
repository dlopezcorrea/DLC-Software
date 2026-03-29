import { Request, Response, NextFunction } from 'express';
import * as segmentsService from './segments.service';
import { sendSuccess } from '../../../utils/response';

export async function listSegments(req: Request, res: Response, next: NextFunction) {
  try {
    const segments = await segmentsService.listSegments(req.orgId!);
    sendSuccess(res, segments);
  } catch (err) {
    next(err);
  }
}

export async function getSegmentById(req: Request, res: Response, next: NextFunction) {
  try {
    const segment = await segmentsService.getSegmentById(req.orgId!, req.params.id);
    sendSuccess(res, segment);
  } catch (err) {
    next(err);
  }
}

export async function createSegment(req: Request, res: Response, next: NextFunction) {
  try {
    const segment = await segmentsService.createSegment(req.orgId!, req.body);
    sendSuccess(res, segment, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateSegment(req: Request, res: Response, next: NextFunction) {
  try {
    const segment = await segmentsService.updateSegment(req.orgId!, req.params.id, req.body);
    sendSuccess(res, segment);
  } catch (err) {
    next(err);
  }
}

export async function deleteSegment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await segmentsService.deleteSegment(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function refreshSegment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await segmentsService.refreshSegment(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getSegmentContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const { contacts, meta } = await segmentsService.getSegmentContacts(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, contacts, 200, meta);
  } catch (err) {
    next(err);
  }
}
