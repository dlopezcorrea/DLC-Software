import { z } from 'zod';
import { ActivityType } from '@prisma/client';

export const createActivitySchema = z.object({
  type: z.nativeEnum(ActivityType),
  subject: z.string().min(1),
  description: z.string().optional(),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  opportunityId: z.string().optional(),
  ticketId: z.string().optional(),
  dueAt: z.coerce.date().optional(),
  duration: z.number().int().positive().optional(),
});

export const updateActivitySchema = z.object({
  type: z.nativeEnum(ActivityType).optional(),
  subject: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  opportunityId: z.string().optional().nullable(),
  ticketId: z.string().optional().nullable(),
  dueAt: z.coerce.date().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  outcome: z.string().optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
