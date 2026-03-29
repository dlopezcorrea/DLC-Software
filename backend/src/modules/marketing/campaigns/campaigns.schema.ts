import { z } from 'zod';
import { CampaignType } from '@prisma/client';

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.nativeEnum(CampaignType).default('EMAIL'),
  emailTemplateId: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  subject: z.string().optional(),
  segmentIds: z.array(z.string()).optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.nativeEnum(CampaignType).optional(),
  emailTemplateId: z.string().optional().nullable(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  subject: z.string().optional(),
  segmentIds: z.array(z.string()).optional(),
});

export const scheduleCampaignSchema = z.object({
  scheduledAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'scheduledAt must be a valid date string' })
    .refine((val) => new Date(val) > new Date(), { message: 'scheduledAt must be in the future' }),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type ScheduleCampaignInput = z.infer<typeof scheduleCampaignSchema>;
