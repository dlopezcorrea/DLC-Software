import { z } from 'zod';
import { ContactType, LeadSource } from '@prisma/client';

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
}).optional();

export const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  accountId: z.string().optional(),
  type: z.nativeEnum(ContactType).default('INDIVIDUAL'),
  address: addressSchema,
  source: z.nativeEnum(LeadSource).optional(),
  emailOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateContactSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  accountId: z.string().optional().nullable(),
  type: z.nativeEnum(ContactType).optional(),
  address: addressSchema,
  source: z.nativeEnum(LeadSource).optional().nullable(),
  emailOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const importContactsSchema = z.object({
  contacts: z.array(createContactSchema).min(1),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ImportContactsInput = z.infer<typeof importContactsSchema>;
