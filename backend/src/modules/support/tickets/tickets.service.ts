import { prisma } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import { generateSequenceNumber } from '../../../utils/sequenceNumber';
import type {
  CreateTicketInput,
  UpdateTicketInput,
  CreateCommentInput,
} from './tickets.schema';

// ─── SLA Helper ──────────────────────────────────────────────────────────────

async function calculateSLADates(
  priority: string,
  slaPolicyId: string | undefined | null,
  createdAt: Date
): Promise<{ firstResponseDue: Date | null; resolutionDue: Date | null }> {
  if (!slaPolicyId) {
    return { firstResponseDue: null, resolutionDue: null };
  }

  const policy = await prisma.sLAPolicy.findUnique({
    where: { id: slaPolicyId },
  });

  if (!policy) {
    return { firstResponseDue: null, resolutionDue: null };
  }

  const firstResponseDue = new Date(
    createdAt.getTime() + policy.firstResponseHours * 60 * 60 * 1000
  );
  const resolutionDue = new Date(
    createdAt.getTime() + policy.resolutionHours * 60 * 60 * 1000
  );

  return { firstResponseDue, resolutionDue };
}

// ─── List Tickets ─────────────────────────────────────────────────────────────

export async function listTickets(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  if (query.priority && typeof query.priority === 'string') {
    where.priority = query.priority;
  }

  if (query.assigneeId && typeof query.assigneeId === 'string') {
    where.assigneeId = query.assigneeId;
  }

  if (query.channel && typeof query.channel === 'string') {
    where.channel = query.channel;
  }

  if (query.contactId && typeof query.contactId === 'string') {
    where.contactId = query.contactId;
  }

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { ticketNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        account: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

// ─── Get Ticket By ID ─────────────────────────────────────────────────────────

export async function getTicketById(orgId: string, id: string) {
  const ticket = await prisma.ticket.findFirst({
    where: { id, organizationId: orgId },
    include: {
      assignee: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      contact: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      account: {
        select: { id: true, name: true, website: true },
      },
      slaPolicy: true,
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket');
  }

  return ticket;
}

// ─── Create Ticket ────────────────────────────────────────────────────────────

export async function createTicket(
  orgId: string,
  userId: string,
  data: CreateTicketInput
) {
  const ticketNumber = await generateSequenceNumber('TKT');
  const createdAt = new Date();

  const { firstResponseDue, resolutionDue } = await calculateSLADates(
    data.priority ?? 'MEDIUM',
    data.slaPolicyId,
    createdAt
  );

  const ticket = await prisma.ticket.create({
    data: {
      organizationId: orgId,
      ticketNumber,
      subject: data.subject,
      description: data.description,
      priority: data.priority ?? 'MEDIUM',
      channel: data.channel ?? 'WEB_FORM',
      contactId: data.contactId ?? null,
      accountId: data.accountId ?? null,
      tags: data.tags ?? [],
      slaPolicyId: data.slaPolicyId ?? null,
      customFields: data.customFields as object | undefined,
      createdById: userId,
      firstResponseDue,
      resolutionDue,
    },
    include: {
      assignee: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
      contact: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      account: {
        select: { id: true, name: true },
      },
    },
  });

  return ticket;
}

// ─── Update Ticket ────────────────────────────────────────────────────────────

export async function updateTicket(
  orgId: string,
  id: string,
  data: UpdateTicketInput
) {
  const existing = await prisma.ticket.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Ticket');
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      ...(data.subject !== undefined && { subject: data.subject }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.channel !== undefined && { channel: data.channel }),
      ...('contactId' in data && { contactId: data.contactId ?? null }),
      ...('accountId' in data && { accountId: data.accountId ?? null }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...('slaPolicyId' in data && { slaPolicyId: data.slaPolicyId ?? null }),
      ...(data.customFields !== undefined && { customFields: data.customFields as object }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  return ticket;
}

// ─── Delete Ticket ────────────────────────────────────────────────────────────

export async function deleteTicket(orgId: string, id: string) {
  const existing = await prisma.ticket.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Ticket');
  }

  await prisma.ticket.delete({ where: { id } });

  return { message: 'Ticket deleted successfully' };
}

// ─── Assign Ticket ────────────────────────────────────────────────────────────

export async function assignTicket(orgId: string, id: string, assigneeId: string) {
  const existing = await prisma.ticket.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Ticket');
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { assigneeId },
    include: {
      assignee: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
  });

  return ticket;
}

// ─── Change Status ────────────────────────────────────────────────────────────

export async function changeStatus(
  orgId: string,
  id: string,
  status: string,
  userId: string
) {
  const existing = await prisma.ticket.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Ticket');
  }

  const now = new Date();
  const updateData: Record<string, unknown> = { status };

  if (status === 'RESOLVED' && !existing.resolvedAt) {
    updateData.resolvedAt = now;
  }

  if (status === 'CLOSED' && !existing.closedAt) {
    updateData.closedAt = now;
  }

  if (!existing.firstResponseAt && existing.assigneeId === userId) {
    updateData.firstResponseAt = now;
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: updateData,
  });

  return ticket;
}

// ─── Add Comment ──────────────────────────────────────────────────────────────

export async function addComment(
  orgId: string,
  ticketId: string,
  userId: string,
  data: CreateCommentInput
) {
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, organizationId: orgId },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket');
  }

  const comment = await prisma.ticketComment.create({
    data: {
      ticketId,
      userId,
      body: data.body,
      isInternal: data.isInternal ?? false,
      attachments: data.attachments as object | undefined,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
  });

  if (!ticket.firstResponseAt && !data.isInternal) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { firstResponseAt: new Date() },
    });
  }

  return comment;
}

// ─── Update Comment ───────────────────────────────────────────────────────────

export async function updateComment(
  orgId: string,
  commentId: string,
  userId: string,
  body: string
) {
  const comment = await prisma.ticketComment.findFirst({
    where: {
      id: commentId,
      userId,
      ticket: { organizationId: orgId },
    },
  });

  if (!comment) {
    throw new NotFoundError('Comment');
  }

  const updated = await prisma.ticketComment.update({
    where: { id: commentId },
    data: { body },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
  });

  return updated;
}

// ─── Delete Comment ───────────────────────────────────────────────────────────

export async function deleteComment(
  orgId: string,
  commentId: string,
  userId: string
) {
  const comment = await prisma.ticketComment.findFirst({
    where: {
      id: commentId,
      userId,
      ticket: { organizationId: orgId },
    },
  });

  if (!comment) {
    throw new NotFoundError('Comment');
  }

  await prisma.ticketComment.delete({ where: { id: commentId } });

  return { message: 'Comment deleted successfully' };
}

// ─── Get Ticket Stats ─────────────────────────────────────────────────────────

export async function getTicketStats(orgId: string) {
  const now = new Date();

  const [open, inProgress, resolved, closed, slaBreached] = await Promise.all([
    prisma.ticket.count({ where: { organizationId: orgId, status: 'OPEN' } }),
    prisma.ticket.count({ where: { organizationId: orgId, status: 'IN_PROGRESS' } }),
    prisma.ticket.count({ where: { organizationId: orgId, status: 'RESOLVED' } }),
    prisma.ticket.count({ where: { organizationId: orgId, status: 'CLOSED' } }),
    prisma.ticket.count({
      where: {
        organizationId: orgId,
        OR: [
          { slaBreached: true },
          {
            resolutionDue: { lt: now },
            status: { notIn: ['RESOLVED', 'CLOSED'] },
          },
        ],
      },
    }),
  ]);

  return { open, inProgress, resolved, closed, slaBreached };
}
