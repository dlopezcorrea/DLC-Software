import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
}).optional();

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: addressSchema,
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
