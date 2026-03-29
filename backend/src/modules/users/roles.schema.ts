import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
});

export const updatePermissionsSchema = z.object({
  permissionIds: z.array(z.string()).min(0, 'permissionIds must be an array'),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>;
