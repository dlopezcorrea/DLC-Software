import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';
import { NotFoundError, ConflictError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import type { CreateSegmentInput, UpdateSegmentInput, FilterCriterionInput } from './segments.schema';

const ALLOWED_FIELDS = new Set([
  'email',
  'firstName',
  'lastName',
  'phone',
  'jobTitle',
  'department',
  'type',
  'source',
  'emailOptIn',
  'smsOptIn',
  'isActive',
]);

function buildFieldCondition(field: string, operator: string, value: unknown): Prisma.ContactWhereInput | null {
  if (!ALLOWED_FIELDS.has(field)) return null;

  switch (operator) {
    case 'equals':
      return { [field]: { equals: value } };
    case 'contains':
      return { [field]: { contains: value as string, mode: 'insensitive' } };
    case 'startsWith':
      return { [field]: { startsWith: value as string, mode: 'insensitive' } };
    case 'endsWith':
      return { [field]: { endsWith: value as string, mode: 'insensitive' } };
    case 'greaterThan':
      return { [field]: { gt: value } };
    case 'lessThan':
      return { [field]: { lt: value } };
    case 'in':
      return { [field]: { in: value as unknown[] } };
    case 'notIn':
      return { [field]: { notIn: value as unknown[] } };
    case 'isNull':
      return { [field]: null };
    case 'isNotNull':
      return { [field]: { not: null } };
    default:
      return null;
  }
}

export function evaluateFilters(criteria: FilterCriterionInput[]): Prisma.ContactWhereInput {
  const conditions: Prisma.ContactWhereInput[] = [];

  for (const criterion of criteria) {
    const condition = buildFieldCondition(criterion.field, criterion.operator, criterion.value);
    if (condition) {
      conditions.push(condition);
    }
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { AND: conditions };
}

export async function listSegments(orgId: string) {
  const segments = await prisma.segment.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      filterCriteria: true,
      isDynamic: true,
      memberCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return segments;
}

export async function getSegmentById(orgId: string, id: string) {
  const segment = await prisma.segment.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!segment) {
    throw new NotFoundError('Segment');
  }

  const memberCount = await prisma.segmentMembership.count({ where: { segmentId: id } });

  return { ...segment, memberCount };
}

export async function createSegment(orgId: string, data: CreateSegmentInput) {
  const existing = await prisma.segment.findFirst({
    where: { organizationId: orgId, name: data.name },
  });

  if (existing) {
    throw new ConflictError(`A segment named '${data.name}' already exists`);
  }

  const segment = await prisma.segment.create({
    data: {
      organizationId: orgId,
      name: data.name,
      description: data.description ?? null,
      filterCriteria: data.filterCriteria as object,
      isDynamic: data.isDynamic ?? true,
      memberCount: 0,
    },
  });

  if (segment.isDynamic) {
    await refreshSegment(orgId, segment.id);
    return prisma.segment.findUniqueOrThrow({ where: { id: segment.id } });
  }

  return segment;
}

export async function updateSegment(orgId: string, id: string, data: UpdateSegmentInput) {
  const existing = await prisma.segment.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Segment');
  }

  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.segment.findFirst({
      where: { organizationId: orgId, name: data.name, NOT: { id } },
    });
    if (duplicate) {
      throw new ConflictError(`A segment named '${data.name}' already exists`);
    }
  }

  const segment = await prisma.segment.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.filterCriteria !== undefined && { filterCriteria: data.filterCriteria as object }),
      ...(data.isDynamic !== undefined && { isDynamic: data.isDynamic }),
    },
  });

  const isDynamic = data.isDynamic !== undefined ? data.isDynamic : existing.isDynamic;
  const criteriaChanged = data.filterCriteria !== undefined;

  if (isDynamic && (criteriaChanged || data.isDynamic !== undefined)) {
    await refreshSegment(orgId, id);
    return prisma.segment.findUniqueOrThrow({ where: { id } });
  }

  return segment;
}

export async function deleteSegment(orgId: string, id: string) {
  const existing = await prisma.segment.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Segment');
  }

  await prisma.segment.delete({ where: { id } });

  return { message: 'Segment deleted successfully' };
}

export async function refreshSegment(orgId: string, id: string) {
  const segment = await prisma.segment.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!segment) {
    throw new NotFoundError('Segment');
  }

  const criteria = segment.filterCriteria as FilterCriterionInput[];
  const filterWhere = evaluateFilters(criteria);

  const contactWhere: Prisma.ContactWhereInput = {
    organizationId: orgId,
    isActive: true,
    doNotContact: false,
    ...filterWhere,
  };

  const matchingContacts = await prisma.contact.findMany({
    where: contactWhere,
    select: { id: true },
  });

  const contactIds = matchingContacts.map((c) => c.id);

  await prisma.$transaction([
    prisma.segmentMembership.deleteMany({ where: { segmentId: id } }),
    ...(contactIds.length > 0
      ? [
          prisma.segmentMembership.createMany({
            data: contactIds.map((contactId) => ({ segmentId: id, contactId })),
            skipDuplicates: true,
          }),
        ]
      : []),
    prisma.segment.update({
      where: { id },
      data: { memberCount: contactIds.length },
    }),
  ]);

  return {
    segmentId: id,
    memberCount: contactIds.length,
    message: 'Segment membership refreshed successfully',
  };
}

export async function getSegmentContacts(
  orgId: string,
  segmentId: string,
  query: Record<string, unknown>
) {
  const segment = await prisma.segment.findFirst({
    where: { id: segmentId, organizationId: orgId },
  });

  if (!segment) {
    throw new NotFoundError('Segment');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const [memberships, total] = await Promise.all([
    prisma.segmentMembership.findMany({
      where: { segmentId },
      skip,
      take,
      orderBy: { addedAt: 'desc' },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            jobTitle: true,
            department: true,
            type: true,
            isActive: true,
            emailOptIn: true,
            smsOptIn: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.segmentMembership.count({ where: { segmentId } }),
  ]);

  const contacts = memberships.map((m) => ({ ...m.contact, addedAt: m.addedAt }));

  return {
    contacts,
    meta: buildPaginationMeta(total, page, perPage),
  };
}
