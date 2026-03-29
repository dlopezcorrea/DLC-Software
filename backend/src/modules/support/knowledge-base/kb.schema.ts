import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export const createArticleSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

export const updateArticleSchema = z.object({
  categoryId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const articleFeedbackSchema = z.object({
  helpful: z.boolean(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleFeedbackInput = z.infer<typeof articleFeedbackSchema>;
