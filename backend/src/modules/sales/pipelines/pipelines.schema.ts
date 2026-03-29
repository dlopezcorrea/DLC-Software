import { z } from 'zod';

export const createPipelineSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  currency: z.string().default('USD'),
});

export const updatePipelineSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
});

export const createStageSchema = z.object({
  name: z.string().min(1),
  probability: z.number().int().min(0).max(100),
  color: z.string().optional(),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
});

export const updateStageSchema = z.object({
  name: z.string().min(1).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  color: z.string().optional(),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderStagesSchema = z.object({
  stages: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().min(0),
    })
  ).min(1),
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;
export type CreateStageInput = z.infer<typeof createStageSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
export type ReorderStagesInput = z.infer<typeof reorderStagesSchema>;
