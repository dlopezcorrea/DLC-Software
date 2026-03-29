import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/crypto';
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination';
import { NotFoundError, ConflictError } from '../../utils/errors';
import type { CreateUserInput, UpdateUserInput } from './users.schema';

export async function listUsers(
  orgId: string,
  query: Record<string, unknown>
) {
  const { page, perPage, skip, take } = getPaginationParams(query);
  const status = query.status as string | undefined;
  const search = query.search as string | undefined;

  const where = {
    organizations: {
      some: { organizationId: orgId },
    },
    ...(status && { status: status as any }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        timezone: true,
        avatarUrl: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            grantedAt: true,
            role: {
              select: { id: true, name: true, description: true },
            },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, perPage);
  return { users, meta };
}

export async function getUserById(orgId: string, userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizations: { some: { organizationId: orgId } },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      timezone: true,
      avatarUrl: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        select: {
          grantedAt: true,
          grantedBy: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
              permissions: {
                select: {
                  permission: {
                    select: { id: true, module: true, action: true, description: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
}

export async function createUser(
  orgId: string,
  data: CreateUserInput
) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ConflictError('A user with this email already exists');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        timezone: data.timezone ?? 'UTC',
        status: 'ACTIVE',
        organizations: {
          create: { organizationId: orgId },
        },
        ...(data.roleId && {
          roles: {
            create: { roleId: data.roleId },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        timezone: true,
        status: true,
        createdAt: true,
        roles: {
          select: {
            role: { select: { id: true, name: true } },
          },
        },
      },
    });
    return created;
  });

  return user;
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new NotFoundError('User');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      timezone: true,
      avatarUrl: true,
      status: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function deactivateUser(userId: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new NotFoundError('User');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: 'INACTIVE' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function assignRole(
  userId: string,
  roleId: string,
  grantedBy: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new NotFoundError('Role');

  const userRole = await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    create: { userId, roleId, grantedBy },
    update: { grantedBy, grantedAt: new Date() },
    include: {
      role: { select: { id: true, name: true, description: true } },
    },
  });

  return userRole;
}

export async function removeRole(userId: string, roleId: string) {
  const existing = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId, roleId } },
  });

  if (!existing) {
    throw new NotFoundError('Role assignment');
  }

  await prisma.userRole.delete({
    where: { userId_roleId: { userId, roleId } },
  });
}

export async function getUserActivities(
  userId: string,
  orgId: string,
  query: Record<string, unknown>
) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where = {
    userId,
    organizationId: orgId,
  };

  const [activities, total] = await prisma.$transaction([
    prisma.activity.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        subject: true,
        description: true,
        outcome: true,
        dueAt: true,
        completedAt: true,
        isCompleted: true,
        duration: true,
        createdAt: true,
        updatedAt: true,
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lead: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        opportunity: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, perPage);
  return { activities, meta };
}
