import { prisma } from '../../../config/database';
import { NotFoundError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import type { CreateLeadInput, UpdateLeadInput, ConvertLeadInput } from './leads.schema';

export async function listLeads(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  if (query.assigneeId && typeof query.assigneeId === 'string') {
    where.assigneeId = query.assigneeId;
  }

  if (query.source && typeof query.source === 'string') {
    where.source = query.source;
  }

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getLeadById(orgId: string, id: string) {
  const lead = await prisma.lead.findFirst({
    where: { id, organizationId: orgId },
    include: {
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
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!lead) {
    throw new NotFoundError('Lead');
  }

  return lead;
}

export async function createLead(orgId: string, data: CreateLeadInput) {
  const lead = await prisma.lead.create({
    data: {
      organizationId: orgId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone,
      company: data.company,
      jobTitle: data.jobTitle,
      source: data.source,
      status: data.status,
      score: data.score,
      estimatedValue: data.estimatedValue !== undefined ? data.estimatedValue : null,
      notes: data.notes,
      assigneeId: data.assigneeId || null,
      customFields: data.customFields as object | undefined,
    },
  });

  return lead;
}

export async function updateLead(orgId: string, id: string, data: UpdateLeadInput) {
  const existing = await prisma.lead.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Lead');
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.company !== undefined && { company: data.company }),
      ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
      ...(data.source !== undefined && { source: data.source }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.score !== undefined && { score: data.score }),
      ...('estimatedValue' in data && { estimatedValue: data.estimatedValue ?? null }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...('assigneeId' in data && { assigneeId: data.assigneeId ?? null }),
      ...(data.customFields !== undefined && { customFields: data.customFields as object }),
    },
  });

  return lead;
}

export async function deleteLead(orgId: string, id: string) {
  const existing = await prisma.lead.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Lead');
  }

  await prisma.lead.delete({ where: { id } });

  return { message: 'Lead deleted successfully' };
}

export async function convertLead(
  orgId: string,
  id: string,
  data: ConvertLeadInput,
  userId: string
) {
  const lead = await prisma.lead.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!lead) {
    throw new NotFoundError('Lead');
  }

  const stage = await prisma.stage.findFirst({
    where: { id: data.stageId, pipelineId: data.pipelineId },
  });

  const [contact, opportunity] = await prisma.$transaction(async (tx) => {
    const newContact = await tx.contact.create({
      data: {
        organizationId: orgId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email || null,
        phone: lead.phone,
        jobTitle: lead.jobTitle,
        source: lead.source,
      },
    });

    const newOpportunity = await tx.opportunity.create({
      data: {
        organizationId: orgId,
        name: data.opportunityName,
        pipelineId: data.pipelineId,
        stageId: data.stageId,
        contactId: newContact.id,
        leadId: lead.id,
        value: data.opportunityValue ?? 0,
        probability: stage?.probability ?? 0,
        assigneeId: lead.assigneeId,
      },
    });

    await tx.lead.update({
      where: { id },
      data: {
        status: 'CONVERTED',
        contactId: newContact.id,
        convertedAt: new Date(),
      },
    });

    return [newContact, newOpportunity];
  });

  return { contact, opportunity };
}

export async function assignLead(orgId: string, id: string, assigneeId: string) {
  const existing = await prisma.lead.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Lead');
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: { assigneeId },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return lead;
}

export async function importLeads(orgId: string, leads: CreateLeadInput[]) {
  let created = 0;
  let skipped = 0;

  const emailsToCheck = leads.filter((l) => l.email).map((l) => l.email as string);

  const existingEmails = new Set<string>();

  if (emailsToCheck.length > 0) {
    const existingLeads = await prisma.lead.findMany({
      where: {
        organizationId: orgId,
        email: { in: emailsToCheck },
      },
      select: { email: true },
    });
    existingLeads.forEach((l) => {
      if (l.email) existingEmails.add(l.email);
    });
  }

  const toCreate = leads.filter((l) => {
    if (l.email && existingEmails.has(l.email)) {
      skipped++;
      return false;
    }
    return true;
  });

  if (toCreate.length > 0) {
    await prisma.lead.createMany({
      data: toCreate.map((l) => ({
        organizationId: orgId,
        firstName: l.firstName,
        lastName: l.lastName,
        email: l.email || null,
        phone: l.phone,
        company: l.company,
        jobTitle: l.jobTitle,
        source: l.source,
        status: l.status,
        score: l.score,
        estimatedValue: l.estimatedValue !== undefined ? l.estimatedValue : null,
        notes: l.notes,
        assigneeId: l.assigneeId || null,
        customFields: (l.customFields as object | undefined) ?? null,
      })),
      skipDuplicates: true,
    });
    created = toCreate.length;
  }

  return { created, skipped };
}
