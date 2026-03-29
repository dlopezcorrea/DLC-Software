import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export async function tenancyMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.orgId) {
      throw new UnauthorizedError();
    }

    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId: req.orgId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenError('Not a member of this organization');
    }

    next();
  } catch (err) {
    next(err);
  }
}
