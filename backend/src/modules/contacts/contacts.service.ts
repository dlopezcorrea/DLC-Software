import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination';
import type { CreateContactInput, UpdateContactInput } from './contacts.schema';

export async function listContacts(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (query.accountId && typeof query.accountId === 'string') {
    where.accountId = query.accountId;
  }

  if (query.type && typeof query.type === 'string') {
    where.type = query.type;
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
      include: {
        account: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.contact.count({ where }),
  ]);

  return {
    contacts,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getContactById(orgId: string, id: string) {
  const contact = await prisma.contact.findFirst({
    where: { id, organizationId: orgId },
    include: {
      account: {
        select: { id: true, name: true, website: true, phone: true },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      tickets: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      },
      campaignContacts: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          campaign: { select: { id: true, name: true, type: true, status: true } },
        },
      },
    },
  });

  if (!contact) {
    throw new NotFoundError('Contact');
  }

  return contact;
}

export async function createContact(orgId: string, data: CreateContactInput) {
  if (data.email) {
    const existing = await prisma.contact.findFirst({
      where: { organizationId: orgId, email: data.email, isActive: true },
    });
    if (existing) {
      throw new ConflictError(`A contact with email '${data.email}' already exists`);
    }
  }

  const contact = await prisma.contact.create({
    data: {
      organizationId: orgId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone,
      mobile: data.mobile,
      jobTitle: data.jobTitle,
      department: data.department,
      accountId: data.accountId,
      type: data.type,
      address: data.address as object | undefined,
      source: data.source,
      emailOptIn: data.emailOptIn ?? true,
      smsOptIn: data.smsOptIn ?? false,
      customFields: data.customFields as object | undefined,
    },
  });

  return contact;
}

export async function updateContact(orgId: string, id: string, data: UpdateContactInput) {
  const existing = await prisma.contact.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Contact');
  }

  if (data.email && data.email !== existing.email) {
    const duplicate = await prisma.contact.findFirst({
      where: {
        organizationId: orgId,
        email: data.email,
        isActive: true,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw new ConflictError(`A contact with email '${data.email}' already exists`);
    }
  }

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.mobile !== undefined && { mobile: data.mobile }),
      ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
      ...(data.department !== undefined && { department: data.department }),
      ...('accountId' in data && { accountId: data.accountId ?? null }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.address !== undefined && { address: data.address as object }),
      ...('source' in data && { source: data.source ?? null }),
      ...(data.emailOptIn !== undefined && { emailOptIn: data.emailOptIn }),
      ...(data.smsOptIn !== undefined && { smsOptIn: data.smsOptIn }),
      ...(data.customFields !== undefined && { customFields: data.customFields as object }),
    },
  });

  return contact;
}

export async function deleteContact(orgId: string, id: string) {
  const existing = await prisma.contact.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Contact');
  }

  await prisma.contact.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: 'Contact deleted successfully' };
}

export async function importContacts(orgId: string, contacts: CreateContactInput[]) {
  let created = 0;
  let skipped = 0;

  const emailsToCheck = contacts
    .filter((c) => c.email)
    .map((c) => c.email as string);

  const existingEmails = new Set<string>();

  if (emailsToCheck.length > 0) {
    const existingContacts = await prisma.contact.findMany({
      where: {
        organizationId: orgId,
        email: { in: emailsToCheck },
        isActive: true,
      },
      select: { email: true },
    });
    existingContacts.forEach((c) => {
      if (c.email) existingEmails.add(c.email);
    });
  }

  const toCreate = contacts.filter((c) => {
    if (c.email && existingEmails.has(c.email)) {
      skipped++;
      return false;
    }
    return true;
  });

  if (toCreate.length > 0) {
    await prisma.contact.createMany({
      data: toCreate.map((c) => ({
        organizationId: orgId,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email || null,
        phone: c.phone,
        mobile: c.mobile,
        jobTitle: c.jobTitle,
        department: c.department,
        accountId: c.accountId,
        type: c.type,
        address: c.address as object | undefined,
        source: c.source,
        emailOptIn: c.emailOptIn ?? true,
        smsOptIn: c.smsOptIn ?? false,
        customFields: c.customFields as object | undefined,
      })),
      skipDuplicates: true,
    });
    created = toCreate.length;
  }

  return { created, skipped };
}

export async function getContactActivities(
  orgId: string,
  contactId: string,
  query: Record<string, unknown>
) {
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, organizationId: orgId },
  });

  if (!contact) {
    throw new NotFoundError('Contact');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where: { contactId, organizationId: orgId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    }),
    prisma.activity.count({ where: { contactId, organizationId: orgId } }),
  ]);

  return {
    activities,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getContactTickets(
  orgId: string,
  contactId: string,
  query: Record<string, unknown>
) {
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, organizationId: orgId },
  });

  if (!contact) {
    throw new NotFoundError('Contact');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where: { contactId, organizationId: orgId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.ticket.count({ where: { contactId, organizationId: orgId } }),
  ]);

  return {
    tickets,
    meta: buildPaginationMeta(total, page, perPage),
  };
}
