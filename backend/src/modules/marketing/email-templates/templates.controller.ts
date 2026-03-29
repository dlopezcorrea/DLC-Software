import { Request, Response, NextFunction } from 'express';
import * as templatesService from './templates.service';
import { sendSuccess } from '../../../utils/response';

export async function listTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const { templates, meta } = await templatesService.listTemplates(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, templates, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getTemplateById(req: Request, res: Response, next: NextFunction) {
  try {
    const template = await templatesService.getTemplateById(req.orgId!, req.params.id);
    sendSuccess(res, template);
  } catch (err) {
    next(err);
  }
}

export async function createTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const template = await templatesService.createTemplate(req.orgId!, req.body);
    sendSuccess(res, template, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const template = await templatesService.updateTemplate(
      req.orgId!,
      req.params.id,
      req.body
    );
    sendSuccess(res, template);
  } catch (err) {
    next(err);
  }
}

export async function deleteTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await templatesService.deleteTemplate(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function previewTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await templatesService.previewTemplate(
      req.orgId!,
      req.params.id,
      req.body
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
