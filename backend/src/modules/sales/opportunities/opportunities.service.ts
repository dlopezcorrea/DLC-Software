import { prisma } from '../../../config/database';
import { NotFoundError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import type {
  CreateOpportunityInput,
  UpdateOpportunityInput,
  MarkLostInput,
} from './opportunities.schema';

export async function listOpportunities(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.pipelineId && typeof query.pipelineId === 'string') {
    where.pipelineId = query.pipelineId;
  }

  if (query.stageId && typeof query.stageId === 'string') {
    where.stageId = query.stageId;
  }

  if (query.assigneeId && typeof query.assigneeId === 'string') {
    where.assigneeId = query.assigneeId;
  }

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      {
        contact: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        stage: {
          select: { id: true, name: true, probability: true, color: true, isWon: true, isLost: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        account: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.opportunity.count({ where }),
  ]);

  return {
    opportunities,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getOpportunityById(orgId: string, id: string) {
  const opportunity = await prisma.opportunity.findFirst({
    where: { id, organizationId: orgId },
    include: {
      stage: true,
      pipeline: {
        select: { id: true, name: true, currency: true },
      },
      assignee: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          jobTitle: true,
        },
      },
      account: {
        select: { id: true, name: true, website: true, phone: true },
      },
      quotes: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          quoteNumber: true,
          title: true,
          status: true,
          total: true,
          currency: true,
          validUntil: true,
          createdAt: true,
        },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!opportunity) {
    throw new NotFoundError('Opportunity');
  }

  return opportunity;
}

export async function createOpportunity(orgId: string, data: CreateOpportunityInput) {
  const opportunity = await prisma.opportunity.create({
    data: {
      organizationId: orgId,
      name: data.name,
      pipelineId: data.pipelineId,
      stageId: data.stageId,
      value: data.value ?? 0,
      currency: data.currency ?? 'USD',
      probability: data.probability ?? 0,
      contactId: data.contactId ?? null,
      accountId: data.accountId ?? null,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
      description: data.description,
      assigneeId: data.assigneeId ?? null,
      customFields: data.customFields as object | undefined,
    },
    include: {
      stage: {
        select: { id: true, name: true, probability: true, color: true },
      },
    },
  });

  return opportunity;
}

export async function updateOpportunity(orgId: string, id: string, data: UpdateOpportunityInput) {
  const existing = await prisma.opportunity.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Opportunity');
  }

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.pipelineId !== undefined && { pipelineId: data.pipelineId }),
      ...(data.stageId !== undefined && { stageId: data.stageId }),
      ...(data.value !== undefined && { value: data.value }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.probability !== undefined && { probability: data.probability }),
      ...('contactId' in data && { contactId: data.contactId ?? null }),
      ...('accountId' in data && { accountId: data.accountId ?? null }),
      ...('leadId' in data && { leadId: data.leadId ?? null }),
      ...('expectedCloseDate' in data && {
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate as string) : null,
      }),
      ...(data.description !== undefined && { description: data.description }),
      ...('assigneeId' in data && { assigneeId: data.assigneeId ?? null }),
      ...(data.customFields !== undefined && { customFields: data.customFields as object }),
    },
    include: {
      stage: {
        select: { id: true, name: true, probability: true, color: true },
      },
    },
  });

  return opportunity;
}

export async function deleteOpportunity(orgId: string, id: string) {
  const existing = await prisma.opportunity.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Opportunity');
  }

  await prisma.opportunity.delete({ where: { id } });

  return { message: 'Opportunity deleted successfully' };
}

export async function moveToStage(orgId: string, id: string, stageId: string) {
  const existing = await prisma.opportunity.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Opportunity');
  }

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
  });

  if (!stage) {
    throw new NotFoundError('Stage');
  }

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data: {
      stageId,
      probability: stage.probability,
    },
    include: {
      stage: {
        select: { id: true, name: true, probability: true, color: true, isWon: true, isLost: true },
      },
    },
  });

  return opportunity;
}

export async function markAsWon(orgId: string, id: string, userId: string) {
  const existing = await prisma.opportunity.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Opportunity');
  }

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data: {
      status: 'WON',
      actualCloseDate: new Date(),
      probability: 100,
    },
    include: {
      stage: {
        select: { id: true, name: true },
      },
      contact: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return opportunity;
}

export async function markAsLost(orgId: string, id: string, data: MarkLostInput) {
  const existing = await prisma.opportunity.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Opportunity');
  }

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data: {
      status: 'LOST',
      actualCloseDate: new Date(),
      lostReason: data.reason,
      probability: 0,
    },
    include: {
      stage: {
        select: { id: true, name: true },
      },
      contact: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return opportunity;
}

export async function getOpportunityQuotes(orgId: string, opportunityId: string) {
  const opportunity = await prisma.opportunity.findFirst({
    where: { id: opportunityId, organizationId: orgId },
  });

  if (!opportunity) {
    throw new NotFoundError('Opportunity');
  }

  const quotes = await prisma.quote.findMany({
    where: { opportunityId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return quotes;
}
