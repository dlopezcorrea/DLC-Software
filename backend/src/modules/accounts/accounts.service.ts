import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination';
import type { CreateAccountInput, UpdateAccountInput } from './accounts.schema';

export async function listAccounts(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (query.industry && typeof query.industry === 'string') {
    where.industry = query.industry;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true' || query.isActive === true;
  }

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { contacts: true, opportunities: true },
        },
      },
    }),
    prisma.account.count({ where }),
  ]);

  return {
    accounts,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getAccountById(orgId: string, id: string) {
  const account = await prisma.account.findFirst({
    where: { id, organizationId: orgId },
    include: {
      parent: {
        select: { id: true, name: true },
      },
      children: {
        select: { id: true, name: true, industry: true, isActive: true },
      },
      contacts: {
        where: { isActive: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          jobTitle: true,
          isActive: true,
        },
      },
      opportunities: {
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          stage: { select: { id: true, name: true, probability: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          invoiceNumber: true,
          title: true,
          status: true,
          total: true,
          amountDue: true,
          dueDate: true,
          createdAt: true,
        },
      },
      contracts: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          contractNumber: true,
          title: true,
          status: true,
          value: true,
          startDate: true,
          endDate: true,
        },
      },
      tickets: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      },
      _count: {
        select: { contacts: true, opportunities: true, invoices: true, contracts: true, tickets: true },
      },
    },
  });

  if (!account) {
    throw new NotFoundError('Account');
  }

  return account;
}

export async function createAccount(orgId: string, data: CreateAccountInput) {
  const account = await prisma.account.create({
    data: {
      organizationId: orgId,
      name: data.name,
      website: data.website || null,
      industry: data.industry || null,
      employeeCount: data.employeeCount ?? null,
      annualRevenue: data.annualRevenue ?? null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address as object | undefined,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      parentId: data.parentId || null,
    },
  });

  return account;
}

export async function updateAccount(orgId: string, id: string, data: UpdateAccountInput) {
  const existing = await prisma.account.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Account');
  }

  const account = await prisma.account.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...('website' in data && { website: data.website || null }),
      ...('industry' in data && { industry: data.industry || null }),
      ...('employeeCount' in data && { employeeCount: data.employeeCount ?? null }),
      ...('annualRevenue' in data && { annualRevenue: data.annualRevenue ?? null }),
      ...('phone' in data && { phone: data.phone || null }),
      ...('email' in data && { email: data.email || null }),
      ...(data.address !== undefined && { address: data.address as object }),
      ...('description' in data && { description: data.description || null }),
      ...('logoUrl' in data && { logoUrl: data.logoUrl || null }),
      ...('parentId' in data && { parentId: data.parentId ?? null }),
    },
  });

  return account;
}

export async function deleteAccount(orgId: string, id: string) {
  const existing = await prisma.account.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Account');
  }

  await prisma.account.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: 'Account deleted successfully' };
}

export async function getAccountContacts(
  orgId: string,
  accountId: string,
  query: Record<string, unknown>
) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, organizationId: orgId },
  });

  if (!account) {
    throw new NotFoundError('Account');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { accountId, organizationId: orgId };

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true' || query.isActive === true;
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        mobile: true,
        jobTitle: true,
        department: true,
        type: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.contact.count({ where }),
  ]);

  return {
    contacts,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getAccountOpportunities(
  orgId: string,
  accountId: string,
  query: Record<string, unknown>
) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, organizationId: orgId },
  });

  if (!account) {
    throw new NotFoundError('Account');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { accountId, organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        stage: { select: { id: true, name: true, probability: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.opportunity.count({ where }),
  ]);

  return {
    opportunities,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getAccountInvoices(
  orgId: string,
  accountId: string,
  query: Record<string, unknown>
) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, organizationId: orgId },
  });

  if (!account) {
    throw new NotFoundError('Account');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { accountId, organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        invoiceNumber: true,
        title: true,
        status: true,
        issueDate: true,
        dueDate: true,
        subtotal: true,
        total: true,
        amountPaid: true,
        amountDue: true,
        currency: true,
        createdAt: true,
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    invoices,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getAccountContracts(
  orgId: string,
  accountId: string,
  query: Record<string, unknown>
) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, organizationId: orgId },
  });

  if (!account) {
    throw new NotFoundError('Account');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { accountId, organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        contractNumber: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        value: true,
        currency: true,
        autoRenew: true,
        signedAt: true,
        createdAt: true,
      },
    }),
    prisma.contract.count({ where }),
  ]);

  return {
    contracts,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getAccountTickets(
  orgId: string,
  accountId: string,
  query: Record<string, unknown>
) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, organizationId: orgId },
  });

  if (!account) {
    throw new NotFoundError('Account');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { accountId, organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  if (query.priority && typeof query.priority === 'string') {
    where.priority = query.priority;
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    meta: buildPaginationMeta(total, page, perPage),
  };
}
