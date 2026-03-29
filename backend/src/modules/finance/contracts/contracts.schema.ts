import { z } from 'zod';

export const createContractSchema = z.object({
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  title: z.string().min(1),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
  value: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  autoRenew: z.boolean().default(false),
  renewalDays: z.number().int().positive().optional(),
  terms: z.string().optional(),
  documentUrl: z.string().url({ message: 'Invalid URL' }).optional(),
});

export const updateContractSchema = z.object({
  accountId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  title: z.string().min(1).optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional()
    .nullable(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional()
    .nullable(),
  value: z.number().nonnegative().optional().nullable(),
  currency: z.string().length(3).optional(),
  autoRenew: z.boolean().optional(),
  renewalDays: z.number().int().positive().optional().nullable(),
  terms: z.string().optional().nullable(),
  documentUrl: z.string().url({ message: 'Invalid URL' }).optional().nullable(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
