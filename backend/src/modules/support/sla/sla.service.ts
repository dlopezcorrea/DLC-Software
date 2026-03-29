import { prisma } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import type { CreateSLAInput, UpdateSLAInput } from './sla.schema';

// ─── List SLA Policies ────────────────────────────────────────────────────────

export async function listSLAPolicies(orgId: string) {
  const policies = await prisma.sLAPolicy.findMany({
    where: { organizationId: orgId },
    orderBy: [{ priority: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });

  return policies.map((policy) => ({
    ...policy,
    ticketCount: policy._count.tickets,
    _count: undefined,
  }));
}

// ─── Get SLA Policy By ID ─────────────────────────────────────────────────────

export async function getSLAPolicyById(orgId: string, id: string) {
  const policy = await prisma.sLAPolicy.findFirst({
    where: { id, organizationId: orgId },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });

  if (!policy) {
    throw new NotFoundError('SLA Policy');
  }

  return {
    ...policy,
    ticketCount: policy._count.tickets,
    _count: undefined,
  };
}

// ─── Create SLA Policy ────────────────────────────────────────────────────────

export async function createSLAPolicy(orgId: string, data: CreateSLAInput) {
  if (data.isDefault) {
    await prisma.sLAPolicy.updateMany({
      where: {
        organizationId: orgId,
        priority: data.priority,
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }

  const policy = await prisma.sLAPolicy.create({
    data: {
      organizationId: orgId,
      name: data.name,
      description: data.description,
      priority: data.priority,
      firstResponseHours: data.firstResponseHours,
      resolutionHours: data.resolutionHours,
      businessHoursOnly: data.businessHoursOnly ?? true,
      isDefault: data.isDefault ?? false,
    },
  });

  return policy;
}

// ─── Update SLA Policy ────────────────────────────────────────────────────────

export async function updateSLAPolicy(orgId: string, id: string, data: UpdateSLAInput) {
  const existing = await prisma.sLAPolicy.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('SLA Policy');
  }

  const priorityForDefault = data.priority ?? existing.priority;

  if (data.isDefault === true) {
    await prisma.sLAPolicy.updateMany({
      where: {
        organizationId: orgId,
        priority: priorityForDefault,
        isDefault: true,
        NOT: { id },
      },
      data: { isDefault: false },
    });
  }

  const policy = await prisma.sLAPolicy.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.firstResponseHours !== undefined && {
        firstResponseHours: data.firstResponseHours,
      }),
      ...(data.resolutionHours !== undefined && { resolutionHours: data.resolutionHours }),
      ...(data.businessHoursOnly !== undefined && {
        businessHoursOnly: data.businessHoursOnly,
      }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
    },
  });

  return policy;
}

// ─── Delete SLA Policy ────────────────────────────────────────────────────────

export async function deleteSLAPolicy(orgId: string, id: string) {
  const existing = await prisma.sLAPolicy.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('SLA Policy');
  }

  const openTicketCount = await prisma.ticket.count({
    where: {
      slaPolicyId: id,
      status: { notIn: ['RESOLVED', 'CLOSED'] },
    },
  });

  if (openTicketCount > 0) {
    throw new ValidationError(
      `Cannot delete SLA policy with ${openTicketCount} open ticket(s). Reassign or close them first.`
    );
  }

  await prisma.sLAPolicy.delete({ where: { id } });

  return { message: 'SLA policy deleted successfully' };
}

// ─── Get SLA Report ───────────────────────────────────────────────────────────

export async function getSLAReport(orgId: string) {
  const policies = await prisma.sLAPolicy.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  });

  const now = new Date();

  const report = await Promise.all(
    policies.map(async (policy) => {
      const [totalTickets, breachedTickets] = await Promise.all([
        prisma.ticket.count({ where: { slaPolicyId: policy.id } }),
        prisma.ticket.count({
          where: {
            slaPolicyId: policy.id,
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

      const complianceRate =
        totalTickets > 0
          ? Math.round(((totalTickets - breachedTickets) / totalTickets) * 100 * 100) / 100
          : 100;

      return {
        policyId: policy.id,
        name: policy.name,
        priority: policy.priority,
        totalTickets,
        breachedTickets,
        complianceRate,
      };
    })
  );

  return { policies: report };
}
