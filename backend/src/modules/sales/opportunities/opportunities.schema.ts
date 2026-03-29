import { z } from 'zod';

export const createOpportunitySchema = z.object({
  name: z.string().min(1),
  pipelineId: z.string().min(1),
  stageId: z.string().min(1),
  value: z.number().min(0).default(0),
  currency: z.string().optional(),
  probability: z.number().int().min(0).max(100).default(0),
  contactId: z.string().optional(),
  accountId: z.string().optional(),
  expectedCloseDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateOpportunitySchema = z.object({
  name: z.string().min(1).optional(),
  pipelineId: z.string().min(1).optional(),
  stageId: z.string().min(1).optional(),
  value: z.number().min(0).optional(),
  currency: z.string().optional(),
  probability: z.number().int().min(0).max(100).optional(),
  contactId: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  expectedCloseDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
  description: z.string().optional(),
  assigneeId: z.string().optional().nullable(),
  customFields: z.record(z.unknown()).optional(),
});

export const moveStageSchema = z.object({
  stageId: z.string().min(1),
});

export const markLostSchema = z.object({
  reason: z.string().min(1),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type MoveStageInput = z.infer<typeof moveStageSchema>;
export type MarkLostInput = z.infer<typeof markLostSchema>;
