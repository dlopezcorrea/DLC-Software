import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response';
import {
  listRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  updateRolePermissions,
  listPermissions,
} from './roles.service';

export async function listRolesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = await listRoles();
    sendSuccess(res, roles);
  } catch (err) {
    next(err);
  }
}

export async function createRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const role = await createRole(req.body);
    sendSuccess(res, role, 201);
  } catch (err) {
    next(err);
  }
}

export async function getRoleByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const role = await getRoleById(req.params.id);
    sendSuccess(res, role);
  } catch (err) {
    next(err);
  }
}

export async function updateRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const role = await updateRole(req.params.id, req.body);
    sendSuccess(res, role);
  } catch (err) {
    next(err);
  }
}

export async function deleteRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await deleteRole(req.params.id);
    sendSuccess(res, { message: 'Role deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updateRolePermissionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { permissionIds } = req.body as { permissionIds: string[] };
    const role = await updateRolePermissions(req.params.id, permissionIds);
    sendSuccess(res, role);
  } catch (err) {
    next(err);
  }
}

export async function listPermissionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const permissions = await listPermissions();
    sendSuccess(res, permissions);
  } catch (err) {
    next(err);
  }
}
