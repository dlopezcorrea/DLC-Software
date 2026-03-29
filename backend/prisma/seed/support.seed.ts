import { PrismaClient, User, Contact } from '@prisma/client';

type Account = { id: string };

export async function seedSupport(
  prisma: PrismaClient,
  orgId: string,
  { contacts, accounts, supportAgent, admin }: { contacts: Contact[]; accounts: Account[]; supportAgent: User; admin: User }
) {
  // SLA Policies
  const slaPolicies = await Promise.all([
    prisma.sLAPolicy.create({ data: { organizationId: orgId, name: 'Urgent SLA', priority: 'URGENT', firstResponseHours: 1, resolutionHours: 4, isDefault: true } }),
    prisma.sLAPolicy.create({ data: { organizationId: orgId, name: 'High Priority SLA', priority: 'HIGH', firstResponseHours: 4, resolutionHours: 24, isDefault: true } }),
    prisma.sLAPolicy.create({ data: { organizationId: orgId, name: 'Medium Priority SLA', priority: 'MEDIUM', firstResponseHours: 8, resolutionHours: 48, isDefault: true } }),
    prisma.sLAPolicy.create({ data: { organizationId: orgId, name: 'Low Priority SLA', priority: 'LOW', firstResponseHours: 24, resolutionHours: 72, isDefault: true } }),
  ]);

  // Knowledge Base
  const kbCategory = await prisma.kBCategory.create({
    data: {
      organizationId: orgId,
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Everything you need to know to get started',
      isPublic: true,
    },
  });

  await prisma.kBArticle.createMany({
    data: [
      { categoryId: kbCategory.id, title: 'How to create a contact', slug: 'how-to-create-a-contact', content: '# Creating a Contact\n\nTo create a contact, navigate to Contacts and click New Contact...', status: 'PUBLISHED', publishedAt: new Date(), isPublic: true },
      { categoryId: kbCategory.id, title: 'Setting up your pipeline', slug: 'setting-up-pipeline', content: '# Pipeline Setup\n\nNavigate to Sales > Pipeline to configure your stages...', status: 'PUBLISHED', publishedAt: new Date(), isPublic: true },
      { categoryId: kbCategory.id, title: 'Creating your first campaign', slug: 'first-campaign', content: '# Email Campaigns\n\nGo to Marketing > Campaigns to create your first email campaign...', status: 'PUBLISHED', publishedAt: new Date(), isPublic: true },
    ],
  });

  // Tickets
  const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'WAITING_ON_CUSTOMER'] as const;
  const ticketPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
  const channels = ['EMAIL', 'WEB_FORM', 'PHONE'] as const;

  const ticketSubjects = [
    'Cannot access my account',
    'Data not syncing correctly',
    'Invoice generation error',
    'Feature request: bulk import',
    'Slow performance on reports',
    'Email campaign not sending',
    'Contact merge is not working',
    'Pipeline stages not saving',
    'SLA breach notification missing',
    'Integration with external tool failing',
  ];

  for (let i = 0; i < 10; i++) {
    const ticket = await prisma.ticket.create({
      data: {
        organizationId: orgId,
        ticketNumber: `TKT-2024-${String(i + 1).padStart(4, '0')}`,
        subject: ticketSubjects[i],
        description: `Detailed description of the issue: ${ticketSubjects[i]}. Steps to reproduce: 1. Login 2. Navigate to the affected area 3. Observe the error.`,
        status: ticketStatuses[i % ticketStatuses.length],
        priority: ticketPriorities[i % ticketPriorities.length],
        channel: channels[i % channels.length],
        contactId: contacts[i % contacts.length].id,
        accountId: i < 7 ? accounts[i % accounts.length].id : undefined,
        assigneeId: i % 2 === 0 ? supportAgent.id : undefined,
        createdById: admin.id,
        slaPolicyId: slaPolicies[i % slaPolicies.length].id,
        firstResponseDue: new Date(Date.now() + 4 * 60 * 60 * 1000),
        resolutionDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Add a comment to each ticket
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        userId: supportAgent.id,
        body: `Thank you for reaching out. We have received your ticket and are investigating the issue. We will update you within our SLA timeframe.`,
        isInternal: false,
      },
    });
  }

  return { slaPolicies, kbCategory };
}
