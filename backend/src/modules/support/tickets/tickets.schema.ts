import { z } from 'zod';
import { TicketPriority, TicketChannel, TicketStatus } from '@prisma/client';

export const createTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
  priority: z.nativeEnum(TicketPriority).default('MEDIUM'),
  channel: z.nativeEnum(TicketChannel).default('WEB_FORM'),
  contactId: z.string().optional(),
  accountId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  slaPolicyId: z.string().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateTicketSchema = z.object({
  subject: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  channel: z.nativeEnum(TicketChannel).optional(),
  contactId: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  slaPolicyId: z.string().optional().nullable(),
  customFields: z.record(z.unknown()).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
});

export const assignTicketSchema = z.object({
  assigneeId: z.string().min(1),
});

export const changeStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
});

export const createCommentSchema = z.object({
  body: z.string().min(1),
  isInternal: z.boolean().default(false),
  attachments: z.unknown().optional(),
});

export const updateCommentSchema = z.object({
  body: z.string().min(1),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
