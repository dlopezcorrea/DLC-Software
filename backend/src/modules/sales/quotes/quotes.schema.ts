import { z } from 'zod';

export const quoteItemSchema = z.object({
  productName: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).max(1).default(0),
  order: z.number().int().optional(),
});

export const createQuoteSchema = z.object({
  opportunityId: z.string().min(1),
  title: z.string().min(1),
  validUntil: z.coerce.date().optional(),
  items: z.array(quoteItemSchema).min(1),
  discountType: z.enum(['percent', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  currency: z.string().optional(),
});

export const updateQuoteSchema = z.object({
  title: z.string().min(1).optional(),
  validUntil: z.coerce.date().optional().nullable(),
  items: z.array(quoteItemSchema).min(1).optional(),
  discountType: z.enum(['percent', 'fixed']).optional().nullable(),
  discountValue: z.number().min(0).optional().nullable(),
  taxRate: z.number().min(0).max(1).optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  currency: z.string().optional(),
});

export const sendQuoteSchema = z.object({
  email: z.string().email(),
});

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type SendQuoteInput = z.infer<typeof sendQuoteSchema>;
