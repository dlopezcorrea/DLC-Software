import { z } from 'zod';
import { LeadSource, LeadStatus } from '@prisma/client';

export const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.nativeEnum(LeadSource).default('WEB_FORM'),
  status: z.nativeEnum(LeadStatus).default('NEW'),
  score: z.number().int().min(0).max(100).default(0),
  estimatedValue: z.number().positive().optional(),
  notes: z.string().optional(),
  assigneeId: z.string().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateLeadSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.nativeEnum(LeadSource).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  score: z.number().int().min(0).max(100).optional(),
  estimatedValue: z.number().positive().optional().nullable(),
  notes: z.string().optional(),
  assigneeId: z.string().optional().nullable(),
  customFields: z.record(z.unknown()).optional(),
});

export const convertLeadSchema = z.object({
  pipelineId: z.string().min(1),
  stageId: z.string().min(1),
  opportunityName: z.string().min(1),
  opportunityValue: z.number().min(0).optional(),
});

export const assignLeadSchema = z.object({
  assigneeId: z.string().min(1),
});

export const importLeadsSchema = z.object({
  leads: z.array(createLeadSchema).min(1),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;
export type ImportLeadsInput = z.infer<typeof importLeadsSchema>;
