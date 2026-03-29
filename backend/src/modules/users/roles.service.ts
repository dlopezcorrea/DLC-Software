import { prisma } from '../../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../../utils/errors';
import type { CreateRoleInput, UpdateRoleInput } from './roles.schema';

export async function listRoles() {
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      isSystem: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { permissions: true, users: true },
      },
    },
  });

  return roles;
}

export async function createRole(data: CreateRoleInput) {
  const existing = await prisma.role.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new ConflictError(`A role with the name "${data.name}" already exists`);
  }

  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isSystem: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return role;
}

export async function getRoleById(id: string) {
  const role = await prisma.role.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isSystem: true,
      createdAt: true,
      updatedAt: true,
      permissions: {
        select: {
          permission: {
            select: {
              id: true,
              module: true,
              action: true,
              description: true,
            },
          },
        },
      },
      _count: {
        select: { users: true },
      },
    },
  });

  if (!role) {
    throw new NotFoundError('Role');
  }

  return role;
}

export async function updateRole(id: string, data: UpdateRoleInput) {
  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Role');
  }

  if (existing.isSystem) {
    throw new ForbiddenError('System roles cannot be modified');
  }

  if (data.name && data.name !== existing.name) {
    const nameConflict = await prisma.role.findUnique({ where: { name: data.name } });
    if (nameConflict) {
      throw new ConflictError(`A role with the name "${data.name}" already exists`);
    }
  }

  const updated = await prisma.role.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      isSystem: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function deleteRole(id: string) {
  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Role');
  }

  if (existing.isSystem) {
    throw new ForbiddenError('System roles cannot be deleted');
  }

  await prisma.role.delete({ where: { id } });
}

export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[]
) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new NotFoundError('Role');
  }

  if (role.isSystem) {
    throw new ForbiddenError('Permissions on system roles cannot be modified');
  }

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId } });

    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      });
    }
  });

  const updated = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      name: true,
      description: true,
      isSystem: true,
      permissions: {
        select: {
          permission: {
            select: { id: true, module: true, action: true, description: true },
          },
        },
      },
    },
  });

  return updated;
}

export async function listPermissions() {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }],
    select: {
      id: true,
      module: true,
      action: true,
      description: true,
    },
  });

  // Group by module
  const grouped = permissions.reduce<
    Record<string, { id: string; action: string; description: string | null }[]>
  >((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push({
      id: perm.id,
      action: perm.action,
      description: perm.description,
    });
    return acc;
  }, {});

  return grouped;
}
