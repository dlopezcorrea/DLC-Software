import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import type { UpdateOrganizationInput } from './organizations.schema';

export async function getOrganization(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  if (!org) {
    throw new NotFoundError('Organization');
  }

  const { _count, ...orgData } = org;

  return {
    ...orgData,
    memberCount: _count.users,
  };
}

export async function updateOrganization(orgId: string, data: UpdateOrganizationInput) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });

  if (!org) {
    throw new NotFoundError('Organization');
  }

  const updated = await prisma.organization.update({
    where: { id: orgId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.website !== undefined && { website: data.website || null }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl || null }),
    },
  });

  return updated;
}

export async function getOrganizationStats(orgId: string) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });

  if (!org) {
    throw new NotFoundError('Organization');
  }

  const [
    contacts,
    accounts,
    openOpportunities,
    openTickets,
    revenueAggregate,
  ] = await Promise.all([
    prisma.contact.count({
      where: { organizationId: orgId, isActive: true },
    }),
    prisma.account.count({
      where: { organizationId: orgId, isActive: true },
    }),
    prisma.opportunity.count({
      where: { organizationId: orgId, status: 'OPEN' },
    }),
    prisma.ticket.count({
      where: {
        organizationId: orgId,
        status: { notIn: ['CLOSED', 'RESOLVED'] },
      },
    }),
    prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: 'PAID',
      },
      _sum: { total: true },
    }),
  ]);

  return {
    contacts,
    accounts,
    openOpportunities,
    openTickets,
    totalRevenue: revenueAggregate._sum.total ?? 0,
  };
}
