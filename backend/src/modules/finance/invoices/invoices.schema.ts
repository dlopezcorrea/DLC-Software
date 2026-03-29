import { z } from 'zod';

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number(),
  discount: z.number().min(0).max(1).default(0),
  order: z.number().int().optional(),
});

export const createInvoiceSchema = z.object({
  accountId: z.string().optional(),
  contractId: z.string().optional(),
  title: z.string().optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  items: z.array(invoiceItemSchema).min(1),
  discountType: z.enum(['percent', 'fixed']).optional(),
  discountValue: z.number().nonnegative().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  currency: z.string().length(3).optional(),
});

export const updateInvoiceSchema = z.object({
  accountId: z.string().optional(),
  contractId: z.string().optional(),
  title: z.string().optional(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
  items: z.array(invoiceItemSchema).min(1).optional(),
  discountType: z.enum(['percent', 'fixed']).optional().nullable(),
  discountValue: z.number().nonnegative().optional().nullable(),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  currency: z.string().length(3).optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CASH', 'CHECK', 'OTHER']),
  paidAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
  notes: z.string().optional(),
  referenceId: z.string().optional(),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
