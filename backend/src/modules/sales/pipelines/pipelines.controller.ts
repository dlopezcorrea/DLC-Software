import { Request, Response, NextFunction } from 'express';
import * as pipelinesService from './pipelines.service';
import { sendSuccess } from '../../../utils/response';

export async function listPipelines(req: Request, res: Response, next: NextFunction) {
  try {
    const pipelines = await pipelinesService.listPipelines(req.orgId!);
    sendSuccess(res, pipelines);
  } catch (err) {
    next(err);
  }
}

export async function createPipeline(req: Request, res: Response, next: NextFunction) {
  try {
    const pipeline = await pipelinesService.createPipeline(req.orgId!, req.body);
    sendSuccess(res, pipeline, 201);
  } catch (err) {
    next(err);
  }
}

export async function getPipelineById(req: Request, res: Response, next: NextFunction) {
  try {
    const pipeline = await pipelinesService.getPipelineById(req.orgId!, req.params.id);
    sendSuccess(res, pipeline);
  } catch (err) {
    next(err);
  }
}

export async function updatePipeline(req: Request, res: Response, next: NextFunction) {
  try {
    const pipeline = await pipelinesService.updatePipeline(req.orgId!, req.params.id, req.body);
    sendSuccess(res, pipeline);
  } catch (err) {
    next(err);
  }
}

export async function deletePipeline(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pipelinesService.deletePipeline(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function addStage(req: Request, res: Response, next: NextFunction) {
  try {
    const stage = await pipelinesService.addStage(req.params.id, req.body);
    sendSuccess(res, stage, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateStage(req: Request, res: Response, next: NextFunction) {
  try {
    const stage = await pipelinesService.updateStage(
      req.params.id,
      req.params.stageId,
      req.body
    );
    sendSuccess(res, stage);
  } catch (err) {
    next(err);
  }
}

export async function deleteStage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pipelinesService.deleteStage(req.params.id, req.params.stageId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function reorderStages(req: Request, res: Response, next: NextFunction) {
  try {
    const stages = await pipelinesService.reorderStages(req.params.id, req.body);
    sendSuccess(res, stages);
  } catch (err) {
    next(err);
  }
}
