import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createRoleSchema,
  updateRoleSchema,
  updatePermissionsSchema,
} from './roles.schema';
import {
  listRolesHandler,
  createRoleHandler,
  getRoleByIdHandler,
  updateRoleHandler,
  deleteRoleHandler,
  updateRolePermissionsHandler,
  listPermissionsHandler,
} from './roles.controller';

const router = Router();

// GET /roles — list all roles
router.get(
  '/',
  authMiddleware,
  listRolesHandler
);

// POST /roles — create a new role
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  validate(createRoleSchema),
  createRoleHandler
);

// GET /roles/permissions — list all available permissions grouped by module
// NOTE: must be defined before /:id to avoid "permissions" being treated as an id
router.get(
  '/permissions',
  authMiddleware,
  listPermissionsHandler
);

// GET /roles/:id — get single role with permissions
router.get(
  '/:id',
  authMiddleware,
  getRoleByIdHandler
);

// PATCH /roles/:id — update role metadata
router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validate(updateRoleSchema),
  updateRoleHandler
);

// DELETE /roles/:id — delete role
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  deleteRoleHandler
);

// PUT /roles/:id/permissions — replace all permissions for a role
router.put(
  '/:id/permissions',
  authMiddleware,
  requireRole('admin'),
  validate(updatePermissionsSchema),
  updateRolePermissionsHandler
);

export default router;
