import { Router } from 'express';
import * as kbController from './kb.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  createArticleSchema,
  updateArticleSchema,
  articleFeedbackSchema,
} from './kb.schema';

export const kbRouter = Router();

// ─── Categories ───────────────────────────────────────────────────────────────

kbRouter.get(
  '/categories',
  authMiddleware,
  requirePermission('support:kb', 'read'),
  kbController.listCategories
);

kbRouter.post(
  '/categories',
  authMiddleware,
  requirePermission('support:kb', 'create'),
  validate(createCategorySchema),
  kbController.createCategory
);

kbRouter.patch(
  '/categories/:id',
  authMiddleware,
  requirePermission('support:kb', 'update'),
  validate(updateCategorySchema),
  kbController.updateCategory
);

kbRouter.delete(
  '/categories/:id',
  authMiddleware,
  requirePermission('support:kb', 'delete'),
  kbController.deleteCategory
);

// ─── Search (before /:id to avoid route conflict) ─────────────────────────────

kbRouter.get(
  '/search',
  authMiddleware,
  requirePermission('support:kb', 'read'),
  kbController.searchKB
);

// ─── Articles ─────────────────────────────────────────────────────────────────

kbRouter.get(
  '/articles',
  authMiddleware,
  requirePermission('support:kb', 'read'),
  kbController.listArticles
);

kbRouter.post(
  '/articles',
  authMiddleware,
  requirePermission('support:kb', 'create'),
  validate(createArticleSchema),
  kbController.createArticle
);

kbRouter.get(
  '/articles/:id',
  authMiddleware,
  requirePermission('support:kb', 'read'),
  kbController.getArticleById
);

kbRouter.patch(
  '/articles/:id',
  authMiddleware,
  requirePermission('support:kb', 'update'),
  validate(updateArticleSchema),
  kbController.updateArticle
);

kbRouter.delete(
  '/articles/:id',
  authMiddleware,
  requirePermission('support:kb', 'delete'),
  kbController.deleteArticle
);

kbRouter.post(
  '/articles/:id/publish',
  authMiddleware,
  requirePermission('support:kb', 'update'),
  kbController.publishArticle
);

// Public route — no auth required
kbRouter.post(
  '/articles/:id/feedback',
  validate(articleFeedbackSchema),
  kbController.submitFeedback
);
