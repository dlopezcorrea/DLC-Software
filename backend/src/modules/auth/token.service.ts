import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { generateToken } from '../../utils/crypto';
import dayjs from 'dayjs';

export interface TokenPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  orgId: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as string,
  });
}

export async function createRefreshToken(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  const token = generateToken(40);
  const expiresAt = dayjs().add(7, 'day').toDate();

  await prisma.refreshToken.create({
    data: { userId, token, expiresAt, userAgent, ipAddress },
  });

  return token;
}

export async function rotateRefreshToken(
  oldToken: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ newRefreshToken: string; userId: string; orgId: string }> {
  const existing = await prisma.refreshToken.findUnique({ where: { token: oldToken } });

  if (!existing || existing.isRevoked || dayjs().isAfter(existing.expiresAt)) {
    if (existing) {
      // Revoke all tokens for this user (token reuse detected)
      await prisma.refreshToken.updateMany({
        where: { userId: existing.userId },
        data: { isRevoked: true },
      });
    }
    throw new Error('Invalid refresh token');
  }

  await prisma.refreshToken.update({ where: { id: existing.id }, data: { isRevoked: true } });

  const newToken = generateToken(40);
  const expiresAt = dayjs().add(7, 'day').toDate();
  await prisma.refreshToken.create({
    data: { userId: existing.userId, token: newToken, expiresAt, userAgent, ipAddress },
  });

  const membership = await prisma.userOrganization.findFirst({
    where: { userId: existing.userId, isDefault: true },
  });

  return {
    newRefreshToken: newToken,
    userId: existing.userId,
    orgId: membership?.organizationId ?? '',
  };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({ where: { token }, data: { isRevoked: true } });
}
