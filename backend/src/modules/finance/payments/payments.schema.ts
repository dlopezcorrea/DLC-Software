import { z } from 'zod';

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CASH', 'CHECK', 'OTHER']),
  paidAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
  notes: z.string().optional(),
  referenceId: z.string().optional(),
  gateway: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  notes: z.string().optional().nullable(),
  referenceId: z.string().optional().nullable(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
