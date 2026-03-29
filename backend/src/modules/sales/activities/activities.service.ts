import { prisma } from '../../../config/database';
import { NotFoundError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import type { CreateActivityInput, UpdateActivityInput } from './activities.schema';

export async function listActivities(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.type && typeof query.type === 'string') {
    where.type = query.type;
  }

  if (query.userId && typeof query.userId === 'string') {
    where.userId = query.userId;
  }

  if (query.contactId && typeof query.contactId === 'string') {
    where.contactId = query.contactId;
  }

  if (query.opportunityId && typeof query.opportunityId === 'string') {
    where.opportunityId = query.opportunityId;
  }

  if (query.isCompleted !== undefined) {
    where.isCompleted = query.isCompleted === 'true' || query.isCompleted === true;
  }

  if (query.dateFrom || query.dateTo) {
    const dueAtFilter: Record<string, Date> = {};
    if (query.dateFrom && typeof query.dateFrom === 'string') {
      dueAtFilter.gte = new Date(query.dateFrom);
    }
    if (query.dateTo && typeof query.dateTo === 'string') {
      dueAtFilter.lte = new Date(query.dateTo);
    }
    where.dueAt = dueAtFilter;
  }

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  return {
    activities,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getActivityById(orgId: string, id: string) {
  const activity = await prisma.activity.findFirst({
    where: { id, organizationId: orgId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      contact: { select: { id: true, firstName: true, lastName: true, email: true } },
      lead: { select: { id: true, firstName: true, lastName: true } },
      opportunity: { select: { id: true, name: true } },
      ticket: { select: { id: true, ticketNumber: true, subject: true } },
    },
  });

  if (!activity) {
    throw new NotFoundError('Activity');
  }

  return activity;
}

export async function createActivity(
  orgId: string,
  userId: string,
  data: CreateActivityInput
) {
  const activity = await prisma.activity.create({
    data: {
      organizationId: orgId,
      userId,
      type: data.type,
      subject: data.subject,
      description: data.description ?? null,
      contactId: data.contactId ?? null,
      leadId: data.leadId ?? null,
      opportunityId: data.opportunityId ?? null,
      ticketId: data.ticketId ?? null,
      dueAt: data.dueAt ?? null,
      duration: data.duration ?? null,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return activity;
}

export async function updateActivity(orgId: string, id: string, data: UpdateActivityInput) {
  const existing = await prisma.activity.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Activity');
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      ...(data.type !== undefined && { type: data.type }),
      ...(data.subject !== undefined && { subject: data.subject }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.contactId !== undefined && { contactId: data.contactId }),
      ...(data.leadId !== undefined && { leadId: data.leadId }),
      ...(data.opportunityId !== undefined && { opportunityId: data.opportunityId }),
      ...(data.ticketId !== undefined && { ticketId: data.ticketId }),
      ...(data.dueAt !== undefined && { dueAt: data.dueAt }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.outcome !== undefined && { outcome: data.outcome }),
      ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return activity;
}

export async function deleteActivity(orgId: string, id: string) {
  const existing = await prisma.activity.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Activity');
  }

  await prisma.activity.delete({ where: { id } });

  return { message: 'Activity deleted successfully' };
}

export async function completeActivity(orgId: string, id: string) {
  const existing = await prisma.activity.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Activity');
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return activity;
}
