import { PrismaClient } from '@prisma/client';
import { seedRoles } from './roles.seed';
import { seedOrganizations } from './organizations.seed';
import { seedUsers } from './users.seed';
import { seedContacts } from './contacts.seed';
import { seedSales } from './sales.seed';
import { seedSupport } from './support.seed';
import { seedFinance } from './finance.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const { adminRole, salesRepRole, supportRole, financeRole, marketingRole } = await seedRoles(prisma);
  console.log('✅ Roles and permissions seeded');

  const { org } = await seedOrganizations(prisma);
  console.log('✅ Organization seeded');

  const { admin, salesRep, supportAgent } = await seedUsers(prisma, org.id, { adminRole, salesRepRole, supportRole, financeRole, marketingRole });
  console.log('✅ Users seeded');

  const { contacts, accounts } = await seedContacts(prisma, org.id);
  console.log('✅ Contacts and accounts seeded');

  await seedSales(prisma, org.id, { contacts, accounts, salesRep });
  console.log('✅ Sales data seeded');

  await seedSupport(prisma, org.id, { contacts, accounts, supportAgent, admin });
  console.log('✅ Support data seeded');

  await seedFinance(prisma, org.id, { accounts });
  console.log('✅ Finance data seeded');

  console.log('\n🎉 Seed complete!');
  console.log('\n📧 Login credentials:');
  console.log('   Admin:   admin@acme-crm.com / Admin1234!');
  console.log('   Sales:   sales@acme-crm.com / Sales1234!');
  console.log('   Support: support@acme-crm.com / Support1234!');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
