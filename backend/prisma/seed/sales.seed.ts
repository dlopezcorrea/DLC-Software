import { PrismaClient, User, Contact } from '@prisma/client';

type Account = { id: string };

export async function seedSales(
  prisma: PrismaClient,
  orgId: string,
  { contacts, accounts, salesRep }: { contacts: Contact[]; accounts: Account[]; salesRep: User }
) {
  // Create B2B Pipeline
  const pipeline = await prisma.pipeline.create({
    data: {
      organizationId: orgId,
      name: 'B2B Enterprise',
      isDefault: true,
      currency: 'USD',
      stages: {
        create: [
          { name: 'Prospecting', probability: 10, order: 1, color: '#94a3b8' },
          { name: 'Qualification', probability: 25, order: 2, color: '#60a5fa' },
          { name: 'Proposal', probability: 50, order: 3, color: '#a78bfa' },
          { name: 'Negotiation', probability: 75, order: 4, color: '#fb923c' },
          { name: 'Closed Won', probability: 100, order: 5, color: '#4ade80', isWon: true },
          { name: 'Closed Lost', probability: 0, order: 6, color: '#f87171', isLost: true },
        ],
      },
    },
    include: { stages: true },
  });

  const stageMap = Object.fromEntries(pipeline.stages.map(s => [s.name, s]));

  // Create 5 leads
  const leadStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED'] as const;
  for (let i = 0; i < 5; i++) {
    await prisma.lead.create({
      data: {
        organizationId: orgId,
        assigneeId: salesRep.id,
        firstName: `Lead${i + 1}`,
        lastName: 'Prospect',
        email: `lead${i + 1}@prospect${i + 1}.example.com`,
        company: `Prospect Company ${i + 1}`,
        source: 'WEB_FORM',
        status: leadStatuses[i],
        score: (i + 1) * 15,
        estimatedValue: (i + 1) * 10000,
      },
    });
  }

  // Create 6 opportunities across stages
  const oppData = [
    { name: 'TechVision ERP Implementation', value: 45000, accountIdx: 0, contactIdx: 0, stage: 'Proposal' },
    { name: 'FinCore Analytics Platform', value: 28000, accountIdx: 1, contactIdx: 2, stage: 'Qualification' },
    { name: 'MediCare CRM Deployment', value: 75000, accountIdx: 2, contactIdx: 4, stage: 'Negotiation' },
    { name: 'RetailMax POS Integration', value: 15000, accountIdx: 3, contactIdx: 5, stage: 'Prospecting' },
    { name: 'BuildCraft Supply Chain', value: 55000, accountIdx: 4, contactIdx: 6, stage: 'Closed Won' },
    { name: 'DataStream BI License', value: 22000, accountIdx: 6, contactIdx: 8, stage: 'Qualification' },
  ];

  const opportunities = [];
  for (const { accountIdx, contactIdx, stage, ...data } of oppData) {
    const s = stageMap[stage];
    const opp = await prisma.opportunity.create({
      data: {
        ...data,
        organizationId: orgId,
        pipelineId: pipeline.id,
        stageId: s.id,
        probability: s.probability,
        status: s.isWon ? 'WON' : s.isLost ? 'LOST' : 'OPEN',
        assigneeId: salesRep.id,
        accountId: accounts[accountIdx].id,
        contactId: contacts[contactIdx].id,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        currency: 'USD',
      },
    });
    opportunities.push(opp);

    // Log an activity for each opportunity
    await prisma.activity.create({
      data: {
        organizationId: orgId,
        userId: salesRep.id,
        opportunityId: opp.id,
        contactId: contacts[contactIdx].id,
        type: 'CALL',
        subject: `Initial call for ${data.name}`,
        isCompleted: true,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create a quote for the won opportunity
  const wonOpp = opportunities[4];
  await prisma.quote.create({
    data: {
      organizationId: orgId,
      opportunityId: wonOpp.id,
      quoteNumber: 'QUO-2024-0001',
      title: 'BuildCraft Supply Chain Solution',
      status: 'ACCEPTED',
      subtotal: 50000,
      taxRate: 0.1,
      taxAmount: 5000,
      total: 55000,
      currency: 'USD',
      acceptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productName: 'Supply Chain Software License', quantity: 1, unitPrice: 35000, discount: 0, total: 35000, order: 1 },
          { productName: 'Implementation Services', quantity: 1, unitPrice: 10000, discount: 0, total: 10000, order: 2 },
          { productName: 'Training (5 days)', quantity: 5, unitPrice: 1000, discount: 0, total: 5000, order: 3 },
        ],
      },
    },
  });

  return { pipeline, opportunities };
}
