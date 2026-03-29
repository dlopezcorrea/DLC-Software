import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { prisma } from '../config/database';

interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  orgId: string;
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, firstName: true, lastName: true, status: true },
    });

    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new UnauthorizedError('User account is inactive');
    }

    req.user = user;
    req.orgId = payload.orgId;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(err);
    }
  }
}
