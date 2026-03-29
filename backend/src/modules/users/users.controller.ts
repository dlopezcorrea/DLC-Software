import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  assignRole,
  removeRole,
  getUserActivities,
} from './users.service';

export async function listUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { users, meta } = await listUsers(req.orgId, req.query as Record<string, unknown>);
    sendSuccess(res, users, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getUserByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await getUserById(req.orgId, req.params.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function createUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await createUser(req.orgId, req.body);
    sendSuccess(res, user, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await updateUser(req.params.id, req.body);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function deactivateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await deactivateUser(req.params.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function getUserActivitiesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { activities, meta } = await getUserActivities(
      req.params.id,
      req.orgId,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, activities, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function assignRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { roleId } = req.body as { roleId: string };
    const userRole = await assignRole(req.params.id, roleId, req.user.id);
    sendSuccess(res, userRole, 201);
  } catch (err) {
    next(err);
  }
}

export async function removeRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await removeRole(req.params.id, req.params.roleId);
    sendSuccess(res, { message: 'Role removed successfully' });
  } catch (err) {
    next(err);
  }
}
