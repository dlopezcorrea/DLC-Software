import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createUserSchema, updateUserSchema, assignRoleSchema } from './users.schema';
import {
  listUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deactivateUserHandler,
  getUserActivitiesHandler,
  assignRoleHandler,
  removeRoleHandler,
} from './users.controller';

const router = Router();

// GET /users — list all users in org
router.get(
  '/',
  authMiddleware,
  requirePermission('users', 'read'),
  listUsersHandler
);

// GET /users/:id — get single user
router.get(
  '/:id',
  authMiddleware,
  getUserByIdHandler
);

// POST /users — create a new user
router.post(
  '/',
  authMiddleware,
  requirePermission('users', 'create'),
  validate(createUserSchema),
  createUserHandler
);

// PATCH /users/:id — update user fields
router.patch(
  '/:id',
  authMiddleware,
  requirePermission('users', 'update'),
  validate(updateUserSchema),
  updateUserHandler
);

// DELETE /users/:id — deactivate user
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('users', 'delete'),
  deactivateUserHandler
);

// GET /users/:id/activities — get user activity log
router.get(
  '/:id/activities',
  authMiddleware,
  getUserActivitiesHandler
);

// POST /users/:id/roles — assign role to user
router.post(
  '/:id/roles',
  authMiddleware,
  requirePermission('users', 'update'),
  validate(assignRoleSchema),
  assignRoleHandler
);

// DELETE /users/:id/roles/:roleId — remove role from user
router.delete(
  '/:id/roles/:roleId',
  authMiddleware,
  requirePermission('users', 'update'),
  removeRoleHandler
);

export default router;
