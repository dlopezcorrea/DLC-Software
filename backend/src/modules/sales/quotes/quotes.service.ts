import { prisma } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import { generateSequenceNumber } from '../../../utils/sequenceNumber';
import type { CreateQuoteInput, UpdateQuoteInput, QuoteItemInput } from './quotes.schema';

interface TotalsResult {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

function calculateTotals(
  items: QuoteItemInput[],
  discountType?: string | null,
  discountValue?: number | null,
  taxRate?: number | null
): TotalsResult {
  const subtotal = items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice * (1 - item.discount);
    return sum + lineTotal;
  }, 0);

  let discountAmount = 0;
  if (discountType === 'percent' && discountValue != null) {
    discountAmount = subtotal * discountValue;
  } else if (discountType === 'fixed' && discountValue != null) {
    discountAmount = Math.min(discountValue, subtotal);
  }

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = taxRate != null ? afterDiscount * taxRate : 0;
  const total = afterDiscount + taxAmount;

  return { subtotal, discountAmount, taxAmount, total };
}

export async function listQuotes(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  if (query.opportunityId && typeof query.opportunityId === 'string') {
    where.opportunityId = query.opportunityId;
  }

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.OR = [
      { quoteNumber: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        opportunity: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.quote.count({ where }),
  ]);

  return {
    quotes,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getQuoteById(orgId: string, id: string) {
  const quote = await prisma.quote.findFirst({
    where: { id, organizationId: orgId },
    include: {
      items: { orderBy: { order: 'asc' } },
      opportunity: {
        select: {
          id: true,
          name: true,
          value: true,
          status: true,
          contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  if (!quote) {
    throw new NotFoundError('Quote');
  }

  return quote;
}

export async function createQuote(orgId: string, data: CreateQuoteInput) {
  const opportunity = await prisma.opportunity.findFirst({
    where: { id: data.opportunityId, organizationId: orgId },
  });

  if (!opportunity) {
    throw new NotFoundError('Opportunity');
  }

  const quoteNumber = await generateSequenceNumber('QUO');
  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(
    data.items,
    data.discountType,
    data.discountValue,
    data.taxRate
  );

  const quote = await prisma.$transaction(async (tx) => {
    const newQuote = await tx.quote.create({
      data: {
        organizationId: orgId,
        opportunityId: data.opportunityId,
        quoteNumber,
        title: data.title,
        validUntil: data.validUntil ?? null,
        subtotal: subtotal.toString(),
        discountType: data.discountType ?? null,
        discountValue: data.discountValue != null ? data.discountValue.toString() : null,
        taxRate: data.taxRate != null ? data.taxRate.toString() : null,
        taxAmount: taxAmount.toString(),
        total: total.toString(),
        currency: data.currency ?? 'USD',
        notes: data.notes ?? null,
        terms: data.terms ?? null,
      },
    });

    await tx.quoteItem.createMany({
      data: data.items.map((item, index) => ({
        quoteId: newQuote.id,
        productName: item.productName,
        description: item.description ?? null,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        discount: item.discount.toString(),
        total: (item.quantity * item.unitPrice * (1 - item.discount)).toString(),
        order: item.order ?? index,
      })),
    });

    return tx.quote.findUnique({
      where: { id: newQuote.id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  });

  return quote;
}

export async function updateQuote(orgId: string, id: string, data: UpdateQuoteInput) {
  const existing = await prisma.quote.findFirst({
    where: { id, organizationId: orgId },
    include: { items: true },
  });

  if (!existing) {
    throw new NotFoundError('Quote');
  }

  const itemsToUse = data.items ?? existing.items.map((i) => ({
    productName: i.productName,
    description: i.description ?? undefined,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    discount: Number(i.discount),
    order: i.order,
  }));

  const discountType = data.discountType !== undefined ? data.discountType : existing.discountType;
  const discountValue =
    data.discountValue !== undefined
      ? data.discountValue
      : existing.discountValue != null
      ? Number(existing.discountValue)
      : null;
  const taxRate =
    data.taxRate !== undefined
      ? data.taxRate
      : existing.taxRate != null
      ? Number(existing.taxRate)
      : null;

  const { subtotal, taxAmount, total } = calculateTotals(
    itemsToUse,
    discountType,
    discountValue,
    taxRate
  );

  const quote = await prisma.$transaction(async (tx) => {
    if (data.items !== undefined) {
      await tx.quoteItem.deleteMany({ where: { quoteId: id } });
      await tx.quoteItem.createMany({
        data: data.items.map((item, index) => ({
          quoteId: id,
          productName: item.productName,
          description: item.description ?? null,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          discount: item.discount.toString(),
          total: (item.quantity * item.unitPrice * (1 - item.discount)).toString(),
          order: item.order ?? index,
        })),
      });
    }

    return tx.quote.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && {
          discountValue: data.discountValue != null ? data.discountValue.toString() : null,
        }),
        ...(data.taxRate !== undefined && {
          taxRate: data.taxRate != null ? data.taxRate.toString() : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.terms !== undefined && { terms: data.terms }),
        ...(data.currency !== undefined && { currency: data.currency }),
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        total: total.toString(),
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  });

  return quote;
}

export async function deleteQuote(orgId: string, id: string) {
  const existing = await prisma.quote.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Quote');
  }

  if (existing.status !== 'DRAFT') {
    throw new ValidationError('Only DRAFT quotes can be deleted');
  }

  await prisma.quote.delete({ where: { id } });

  return { message: 'Quote deleted successfully' };
}

export async function sendQuote(orgId: string, id: string, email: string) {
  const existing = await prisma.quote.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Quote');
  }

  const now = new Date();

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAt: now,
    },
    include: { items: { orderBy: { order: 'asc' } } },
  });

  // Log the send action; actual email delivery is handled externally
  await prisma.auditLog.create({
    data: {
      organizationId: orgId,
      action: 'UPDATE',
      entityType: 'Quote',
      entityId: id,
      changes: { action: 'sent', sentTo: email, sentAt: now.toISOString() },
    },
  });

  return quote;
}

export async function acceptQuote(orgId: string, id: string) {
  const existing = await prisma.quote.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Quote');
  }

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
    include: { items: { orderBy: { order: 'asc' } } },
  });

  return quote;
}

export async function rejectQuote(orgId: string, id: string) {
  const existing = await prisma.quote.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Quote');
  }

  const quote = await prisma.quote.update({
    where: { id },
    data: { status: 'REJECTED' },
    include: { items: { orderBy: { order: 'asc' } } },
  });

  return quote;
}

export async function convertToInvoice(orgId: string, id: string, userId: string) {
  const quote = await prisma.quote.findFirst({
    where: { id, organizationId: orgId },
    include: {
      items: { orderBy: { order: 'asc' } },
      opportunity: {
        select: { id: true, name: true, accountId: true },
      },
    },
  });

  if (!quote) {
    throw new NotFoundError('Quote');
  }

  const invoiceNumber = await generateSequenceNumber('INV');
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await prisma.$transaction(async (tx) => {
    const newInvoice = await tx.invoice.create({
      data: {
        organizationId: orgId,
        accountId: quote.opportunity.accountId ?? null,
        invoiceNumber,
        title: quote.title,
        dueDate,
        subtotal: quote.subtotal,
        discountType: quote.discountType ?? null,
        discountValue: quote.discountValue ?? null,
        taxRate: quote.taxRate ?? null,
        taxAmount: quote.taxAmount,
        total: quote.total,
        amountDue: quote.total,
        currency: quote.currency,
        notes: quote.notes ?? null,
        terms: quote.terms ?? null,
      },
    });

    await tx.invoiceItem.createMany({
      data: quote.items.map((item) => ({
        invoiceId: newInvoice.id,
        description: item.productName + (item.description ? ` — ${item.description}` : ''),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.total,
        order: item.order,
      })),
    });

    await tx.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: 'CREATE',
        entityType: 'Invoice',
        entityId: newInvoice.id,
        changes: { convertedFromQuote: id, quoteNumber: quote.quoteNumber },
      },
    });

    return tx.invoice.findUnique({
      where: { id: newInvoice.id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  });

  return invoice;
}
