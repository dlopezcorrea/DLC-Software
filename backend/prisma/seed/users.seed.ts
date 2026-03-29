import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

interface Roles {
  adminRole: { id: string };
  salesRepRole: { id: string };
  supportRole: { id: string };
  financeRole: { id: string };
  marketingRole: { id: string };
}

async function createUser(
  prisma: PrismaClient,
  orgId: string,
  data: { email: string; password: string; firstName: string; lastName: string },
  roleId: string
) {
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      status: 'ACTIVE',
      organizations: { create: { organizationId: orgId, isDefault: true } },
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId } },
    update: {},
    create: { userId: user.id, roleId },
  });

  return user;
}

export async function seedUsers(prisma: PrismaClient, orgId: string, roles: Roles) {
  const admin = await createUser(
    prisma, orgId,
    { email: 'admin@acme-crm.com', password: 'Admin1234!', firstName: 'Alice', lastName: 'Admin' },
    roles.adminRole.id
  );

  const salesRep = await createUser(
    prisma, orgId,
    { email: 'sales@acme-crm.com', password: 'Sales1234!', firstName: 'Bob', lastName: 'Sales' },
    roles.salesRepRole.id
  );

  const supportAgent = await createUser(
    prisma, orgId,
    { email: 'support@acme-crm.com', password: 'Support1234!', firstName: 'Carol', lastName: 'Support' },
    roles.supportRole.id
  );

  const financeManager = await createUser(
    prisma, orgId,
    { email: 'finance@acme-crm.com', password: 'Finance1234!', firstName: 'Dave', lastName: 'Finance' },
    roles.financeRole.id
  );

  const marketingManager = await createUser(
    prisma, orgId,
    { email: 'marketing@acme-crm.com', password: 'Mktg1234!', firstName: 'Eve', lastName: 'Marketing' },
    roles.marketingRole.id
  );

  return { admin, salesRep, supportAgent, financeManager, marketingManager };
}
