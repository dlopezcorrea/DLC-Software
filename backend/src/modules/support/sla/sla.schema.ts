import { z } from 'zod';
import { TicketPriority } from '@prisma/client';

export const createSLASchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priority: z.nativeEnum(TicketPriority),
  firstResponseHours: z.number().int().positive(),
  resolutionHours: z.number().int().positive(),
  businessHoursOnly: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const updateSLASchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  firstResponseHours: z.number().int().positive().optional(),
  resolutionHours: z.number().int().positive().optional(),
  businessHoursOnly: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export type CreateSLAInput = z.infer<typeof createSLASchema>;
export type UpdateSLAInput = z.infer<typeof updateSLASchema>;
