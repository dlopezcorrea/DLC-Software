import { Request, Response, NextFunction } from 'express';
import * as kbService from './kb.service';
import { sendSuccess } from '../../../utils/response';

// ─── Categories ───────────────────────────────────────────────────────────────

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await kbService.listCategories(req.orgId!);
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await kbService.createCategory(req.orgId!, req.body);
    sendSuccess(res, category, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await kbService.updateCategory(req.orgId!, req.params.id, req.body);
    sendSuccess(res, category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await kbService.deleteCategory(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export async function listArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const { articles, meta } = await kbService.listArticles(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, articles, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getArticleById(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await kbService.getArticleById(req.orgId!, req.params.id);
    sendSuccess(res, article);
  } catch (err) {
    next(err);
  }
}

export async function createArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await kbService.createArticle(req.orgId!, req.body);
    sendSuccess(res, article, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await kbService.updateArticle(req.orgId!, req.params.id, req.body);
    sendSuccess(res, article);
  } catch (err) {
    next(err);
  }
}

export async function deleteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await kbService.deleteArticle(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function publishArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await kbService.publishArticle(req.orgId!, req.params.id);
    sendSuccess(res, article);
  } catch (err) {
    next(err);
  }
}

export async function submitFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await kbService.submitFeedback(req.params.id, req.body.helpful);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function searchKB(req: Request, res: Response, next: NextFunction) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const result = await kbService.searchKB(req.orgId!, q);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
