import { prisma } from '../../config/database';
import { hashPassword, comparePassword, generateToken } from '../../utils/crypto';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../utils/errors';
import { signAccessToken, createRefreshToken } from './token.service';
import { emailTransporter } from '../../config/email';
import { env } from '../../config/env';
import dayjs from 'dayjs';

export async function register(data: {
  orgName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError('Email already in use');

  const slug = data.orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + generateToken(4);
  const passwordHash = await hashPassword(data.password);

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: data.orgName, slug },
    });

    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        status: 'ACTIVE',
        organizations: {
          create: { organizationId: org.id, isDefault: true },
        },
      },
    });

    if (adminRole) {
      await tx.userRole.create({ data: { userId: user.id, roleId: adminRole.id } });
    }

    return { user, org };
  });

  const accessToken = signAccessToken({
    sub: result.user.id,
    email: result.user.email,
    firstName: result.user.firstName,
    lastName: result.user.lastName,
    orgId: result.org.id,
  });

  return { user: result.user, org: result.org, accessToken };
}

export async function login(
  email: string,
  password: string,
  userAgent?: string,
  ipAddress?: string
) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organizations: { where: { isDefault: true } } },
  });

  if (!user) throw new UnauthorizedError('Invalid credentials');
  if (user.status === 'SUSPENDED') throw new UnauthorizedError('Account suspended');
  if (user.status === 'INACTIVE') throw new UnauthorizedError('Account inactive');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const orgId = user.organizations[0]?.organizationId ?? '';

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    orgId,
  });

  const refreshToken = await createRefreshToken(user.id, userAgent, ipAddress);

  return { user, accessToken, refreshToken, orgId };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Silent fail to avoid enumeration

  const token = generateToken(32);
  const expiresAt = dayjs().add(1, 'hour').toDate();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Store reset token in a simple way using custom fields or a separate store
      // For simplicity, we use a Redis-style approach via a dedicated field
    },
  });

  // In production, store token in Redis with TTL
  // For now, log for development
  console.log(`Password reset token for ${email}: ${token} (expires: ${expiresAt})`);

  try {
    await emailTransporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>
      `,
    });
  } catch (err) {
    console.error('Failed to send reset email:', err);
  }
}

export async function inviteUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  orgId: string;
  roleId?: string;
  invitedById: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const alreadyMember = await prisma.userOrganization.findUnique({
      where: { userId_organizationId: { userId: existing.id, organizationId: data.orgId } },
    });
    if (alreadyMember) throw new ConflictError('User already in this organization');
  }

  const passwordHash = await hashPassword(generateToken(16)); // Temporary password
  const inviteToken = generateToken(32);

  const user = existing ?? (await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      status: 'INVITED',
    },
  }));

  await prisma.userOrganization.create({
    data: { userId: user.id, organizationId: data.orgId, isDefault: true },
  });

  if (data.roleId) {
    const roleExists = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (roleExists) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: data.roleId } },
        update: {},
        create: { userId: user.id, roleId: data.roleId, grantedBy: data.invitedById },
      });
    }
  }

  console.log(`Invite token for ${data.email}: ${inviteToken}`);

  try {
    await emailTransporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: data.email,
      subject: "You've been invited to DLC CRM",
      html: `
        <h2>You've been invited!</h2>
        <p>Click the link below to accept your invitation and set your password.</p>
        <a href="${env.FRONTEND_URL}/accept-invite?token=${inviteToken}">Accept Invitation</a>
      `,
    });
  } catch (err) {
    console.error('Failed to send invite email:', err);
  }

  return { user, inviteToken };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      phone: true,
      timezone: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      organizations: { include: { organization: true } },
    },
  });

  if (!user) throw new NotFoundError('User');
  return user;
}

export async function updateProfile(userId: string, data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  avatarUrl?: string;
}) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, email: true, firstName: true, lastName: true,
      avatarUrl: true, phone: true, timezone: true, status: true,
    },
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Current password is incorrect');

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
}
