import { z } from 'zod';

const addressSchema = z
  .object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  })
  .optional();

export const createAccountSchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  annualRevenue: z.number().nonnegative().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: addressSchema,
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  parentId: z.string().optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  employeeCount: z.number().int().nonnegative().optional().nullable(),
  annualRevenue: z.number().nonnegative().optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: addressSchema,
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  parentId: z.string().optional().nullable(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
