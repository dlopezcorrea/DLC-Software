import { PrismaClient } from '@prisma/client';

const MODULES = ['contacts', 'accounts', 'sales', 'marketing', 'support', 'finance', 'users', 'organizations'];
const ACTIONS = ['read', 'create', 'update', 'delete', 'export'];

const ROLE_PERMISSIONS: Record<string, Array<{ module: string; action: string }>> = {
  super_admin: MODULES.flatMap(m => ACTIONS.map(a => ({ module: m, action: a }))),
  admin: MODULES.flatMap(m => ACTIONS.map(a => ({ module: m, action: a }))),
  sales_manager: [
    ...['contacts', 'accounts', 'sales'].flatMap(m => ACTIONS.map(a => ({ module: m, action: a }))),
    { module: 'marketing', action: 'read' },
    { module: 'finance', action: 'read' },
  ],
  sales_rep: [
    ...['contacts', 'accounts'].map(m => ({ module: m, action: 'read' })),
    ...['sales'].flatMap(m => ['read', 'create', 'update'].map(a => ({ module: m, action: a }))),
  ],
  marketing_manager: [
    ...['marketing'].flatMap(m => ACTIONS.map(a => ({ module: m, action: a }))),
    { module: 'contacts', action: 'read' },
    { module: 'contacts', action: 'create' },
    { module: 'contacts', action: 'update' },
  ],
  support_agent: [
    { module: 'contacts', action: 'read' },
    { module: 'accounts', action: 'read' },
    ...['support'].flatMap(m => ACTIONS.map(a => ({ module: m, action: a }))),
  ],
  finance_manager: [
    { module: 'contacts', action: 'read' },
    { module: 'accounts', action: 'read' },
    ...['finance'].flatMap(m => ACTIONS.map(a => ({ module: m, action: a }))),
  ],
  read_only: MODULES.map(m => ({ module: m, action: 'read' })),
};

export async function seedRoles(prisma: PrismaClient) {
  // Create all permissions
  const permissionMap = new Map<string, string>();
  for (const module of MODULES) {
    for (const action of ACTIONS) {
      const perm = await prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: {},
        create: { module, action, description: `${action} ${module}` },
      });
      permissionMap.set(`${module}:${action}`, perm.id);
    }
  }

  const roleNames = Object.keys(ROLE_PERMISSIONS);
  const roleMap: Record<string, { id: string; name: string }> = {};

  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, isSystem: true, description: `${name.replace(/_/g, ' ')} role` },
    });
    roleMap[name] = role;

    // Assign permissions
    const perms = ROLE_PERMISSIONS[name];
    for (const { module, action } of perms) {
      const permId = permissionMap.get(`${module}:${action}`);
      if (permId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
          update: {},
          create: { roleId: role.id, permissionId: permId },
        });
      }
    }
  }

  return {
    adminRole: roleMap.admin,
    salesRepRole: roleMap.sales_rep,
    supportRole: roleMap.support_agent,
    financeRole: roleMap.finance_manager,
    marketingRole: roleMap.marketing_manager,
  };
}
