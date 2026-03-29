import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export function requirePermission(module: string, action: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const hasPermission = await prisma.rolePermission.findFirst({
        where: {
          role: {
            users: { some: { userId: req.user.id } },
          },
          permission: { module, action },
        },
      });

      if (!hasPermission) {
        throw new ForbiddenError(`Permission denied: ${module}:${action}`);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireRole(...roleNames: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const hasRole = await prisma.userRole.findFirst({
        where: {
          userId: req.user.id,
          role: { name: { in: roleNames } },
        },
      });

      if (!hasRole) {
        throw new ForbiddenError('Insufficient role');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
