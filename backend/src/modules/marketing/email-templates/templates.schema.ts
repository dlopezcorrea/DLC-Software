import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlBody: z.string().min(1, 'HTML body is required'),
  plainBody: z.string().optional(),
  variables: z.array(z.string()).optional(),
  previewText: z.string().optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  htmlBody: z.string().min(1).optional(),
  plainBody: z.string().optional(),
  variables: z.array(z.string()).optional(),
  previewText: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const previewTemplateSchema = z.object({
  data: z.record(z.string(), z.string()),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type PreviewTemplateInput = z.infer<typeof previewTemplateSchema>;
