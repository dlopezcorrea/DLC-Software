import { prisma } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import { generateSequenceNumber } from '../../../utils/sequenceNumber';
import type { CreateContractInput, UpdateContractInput } from './contracts.schema';

export async function listContracts(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  if (query.accountId && typeof query.accountId === 'string') {
    where.accountId = query.accountId;
  }

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.OR = [
      { contractNumber: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { id: true, name: true } },
      },
    }),
    prisma.contract.count({ where }),
  ]);

  return {
    contracts,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getContractById(orgId: string, id: string) {
  const contract = await prisma.contract.findFirst({
    where: { id, organizationId: orgId },
    include: {
      account: { select: { id: true, name: true, email: true, phone: true } },
      invoices: {
        select: {
          id: true,
          invoiceNumber: true,
          title: true,
          status: true,
          issueDate: true,
          dueDate: true,
          total: true,
          amountDue: true,
          currency: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!contract) {
    throw new NotFoundError('Contract');
  }

  return contract;
}

export async function createContract(orgId: string, data: CreateContractInput) {
  const contractNumber = await generateSequenceNumber('CON');

  const contract = await prisma.contract.create({
    data: {
      organizationId: orgId,
      contractNumber,
      accountId: data.accountId ?? null,
      contactId: data.contactId ?? null,
      title: data.title,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      value: data.value != null ? data.value.toString() : null,
      currency: data.currency ?? 'USD',
      autoRenew: data.autoRenew ?? false,
      renewalDays: data.renewalDays ?? null,
      terms: data.terms ?? null,
      documentUrl: data.documentUrl ?? null,
    },
    include: {
      account: { select: { id: true, name: true } },
    },
  });

  return contract;
}

export async function updateContract(orgId: string, id: string, data: UpdateContractInput) {
  const existing = await prisma.contract.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Contract');
  }

  if (existing.status !== 'DRAFT' && existing.status !== 'ACTIVE') {
    throw new ValidationError('Only DRAFT or ACTIVE contracts can be updated');
  }

  const contract = await prisma.contract.update({
    where: { id },
    data: {
      ...(data.accountId !== undefined && { accountId: data.accountId ?? null }),
      ...(data.contactId !== undefined && { contactId: data.contactId ?? null }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.startDate !== undefined && {
        startDate: data.startDate ? new Date(data.startDate) : null,
      }),
      ...(data.endDate !== undefined && {
        endDate: data.endDate ? new Date(data.endDate) : null,
      }),
      ...(data.value !== undefined && {
        value: data.value != null ? data.value.toString() : null,
      }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.autoRenew !== undefined && { autoRenew: data.autoRenew }),
      ...(data.renewalDays !== undefined && { renewalDays: data.renewalDays ?? null }),
      ...(data.terms !== undefined && { terms: data.terms ?? null }),
      ...(data.documentUrl !== undefined && { documentUrl: data.documentUrl ?? null }),
    },
    include: {
      account: { select: { id: true, name: true } },
    },
  });

  return contract;
}

export async function deleteContract(orgId: string, id: string) {
  const existing = await prisma.contract.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Contract');
  }

  if (existing.status !== 'DRAFT') {
    throw new ValidationError('Only DRAFT contracts can be deleted');
  }

  await prisma.contract.delete({ where: { id } });

  return { message: 'Contract deleted successfully' };
}

export async function activateContract(orgId: string, id: string) {
  const existing = await prisma.contract.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Contract');
  }

  if (existing.status !== 'DRAFT') {
    throw new ValidationError('Only DRAFT contracts can be activated');
  }

  const contract = await prisma.contract.update({
    where: { id },
    data: { status: 'ACTIVE' },
    include: {
      account: { select: { id: true, name: true } },
    },
  });

  return contract;
}

export async function renewContract(orgId: string, id: string) {
  const existing = await prisma.contract.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Contract');
  }

  if (existing.status !== 'ACTIVE') {
    throw new ValidationError('Only ACTIVE contracts can be renewed');
  }

  // Calculate new dates: new startDate = old endDate, new endDate = old endDate + duration
  let newStartDate: Date | null = null;
  let newEndDate: Date | null = null;

  if (existing.endDate) {
    newStartDate = new Date(existing.endDate);

    if (existing.startDate && existing.endDate) {
      const durationMs =
        existing.endDate.getTime() - existing.startDate.getTime();
      newEndDate = new Date(existing.endDate.getTime() + durationMs);
    } else if (existing.renewalDays) {
      newEndDate = new Date(
        existing.endDate.getTime() + existing.renewalDays * 24 * 60 * 60 * 1000
      );
    }
  }

  const contractNumber = await generateSequenceNumber('CON');

  const [renewedOriginal, newContract] = await prisma.$transaction(async (tx) => {
    const renewed = await tx.contract.update({
      where: { id },
      data: { status: 'RENEWED' },
    });

    const created = await tx.contract.create({
      data: {
        organizationId: orgId,
        contractNumber,
        accountId: existing.accountId,
        contactId: existing.contactId,
        title: existing.title,
        startDate: newStartDate,
        endDate: newEndDate,
        value: existing.value,
        currency: existing.currency,
        autoRenew: existing.autoRenew,
        renewalDays: existing.renewalDays,
        terms: existing.terms,
        documentUrl: existing.documentUrl,
        status: 'ACTIVE',
      },
      include: {
        account: { select: { id: true, name: true } },
      },
    });

    return [renewed, created];
  });

  return { previousContract: renewedOriginal, newContract };
}

export async function terminateContract(orgId: string, id: string) {
  const existing = await prisma.contract.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Contract');
  }

  if (existing.status === 'TERMINATED') {
    throw new ValidationError('Contract is already terminated');
  }

  const contract = await prisma.contract.update({
    where: { id },
    data: { status: 'TERMINATED' },
    include: {
      account: { select: { id: true, name: true } },
    },
  });

  return contract;
}

export async function getContractInvoices(
  orgId: string,
  contractId: string,
  query: Record<string, unknown>
) {
  const contract = await prisma.contract.findFirst({
    where: { id: contractId, organizationId: orgId },
  });

  if (!contract) {
    throw new NotFoundError('Contract');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = {
    contractId,
    organizationId: orgId,
  };

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
        total: true,
        amountPaid: true,
        amountDue: true,
        currency: true,
        createdAt: true,
        account: { select: { id: true, name: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    invoices,
    meta: buildPaginationMeta(total, page, perPage),
  };
}
