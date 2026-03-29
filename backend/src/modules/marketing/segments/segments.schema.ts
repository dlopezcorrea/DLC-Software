import { z } from 'zod';

export const filterOperatorEnum = z.enum([
  'equals',
  'contains',
  'startsWith',
  'endsWith',
  'greaterThan',
  'lessThan',
  'in',
  'notIn',
  'isNull',
  'isNotNull',
]);

export const filterCriterionSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: filterOperatorEnum,
  value: z.unknown().optional(),
});

export const createSegmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  filterCriteria: z.array(filterCriterionSchema).min(1, 'At least one filter criterion is required'),
  isDynamic: z.boolean().default(true),
});

export const updateSegmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  filterCriteria: z.array(filterCriterionSchema).optional(),
  isDynamic: z.boolean().optional(),
});

export type FilterCriterionInput = z.infer<typeof filterCriterionSchema>;
export type CreateSegmentInput = z.infer<typeof createSegmentSchema>;
export type UpdateSegmentInput = z.infer<typeof updateSegmentSchema>;
