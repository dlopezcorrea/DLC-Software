import { PrismaClient } from '@prisma/client';

export async function seedOrganizations(prisma: PrismaClient) {
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      website: 'https://acme-corp.example.com',
      phone: '+1-555-000-0001',
      currency: 'USD',
      timezone: 'America/New_York',
      address: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
    },
  });

  return { org };
}
