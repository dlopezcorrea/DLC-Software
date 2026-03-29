import { prisma } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import { generateSequenceNumber } from '../../../utils/sequenceNumber';
import { emailTransporter } from '../../../config/email';
import { env } from '../../../config/env';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  RecordPaymentInput,
  InvoiceItemInput,
} from './invoices.schema';

interface TotalsResult {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export function calculateInvoiceTotals(
  items: InvoiceItemInput[],
  discountType?: string | null,
  discountValue?: number | null,
  taxRate?: number | null
): TotalsResult {
  const subtotal = items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount ?? 0));
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

export async function listInvoices(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  if (query.accountId && typeof query.accountId === 'string') {
    where.accountId = query.accountId;
  }

  if (query.dateFrom || query.dateTo) {
    const dateFilter: Record<string, unknown> = {};
    if (query.dateFrom && typeof query.dateFrom === 'string') {
      dateFilter.gte = new Date(query.dateFrom);
    }
    if (query.dateTo && typeof query.dateTo === 'string') {
      dateFilter.lte = new Date(query.dateTo);
    }
    where.issueDate = dateFilter;
  }

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.invoiceNumber = { contains: search, mode: 'insensitive' };
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
        amountDue: true,
        amountPaid: true,
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

export async function getInvoiceById(orgId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId },
    include: {
      items: { orderBy: { order: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      account: { select: { id: true, name: true, email: true, phone: true } },
      contract: { select: { id: true, contractNumber: true, title: true } },
    },
  });

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  return invoice;
}

export async function createInvoice(orgId: string, data: CreateInvoiceInput) {
  const invoiceNumber = await generateSequenceNumber('INV');
  const { subtotal, discountAmount, taxAmount, total } = calculateInvoiceTotals(
    data.items,
    data.discountType,
    data.discountValue,
    data.taxRate
  );

  const invoice = await prisma.$transaction(async (tx) => {
    const newInvoice = await tx.invoice.create({
      data: {
        organizationId: orgId,
        accountId: data.accountId ?? null,
        contractId: data.contractId ?? null,
        invoiceNumber,
        title: data.title ?? null,
        dueDate: new Date(data.dueDate),
        subtotal: subtotal.toString(),
        discountType: data.discountType ?? null,
        discountValue: data.discountValue != null ? data.discountValue.toString() : null,
        taxRate: data.taxRate != null ? data.taxRate.toString() : null,
        taxAmount: taxAmount.toString(),
        total: total.toString(),
        amountDue: total.toString(),
        amountPaid: '0',
        currency: data.currency ?? 'USD',
        notes: data.notes ?? null,
        terms: data.terms ?? null,
      },
    });

    await tx.invoiceItem.createMany({
      data: data.items.map((item, index) => ({
        invoiceId: newInvoice.id,
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        discount: (item.discount ?? 0).toString(),
        total: (item.quantity * item.unitPrice * (1 - (item.discount ?? 0))).toString(),
        order: item.order ?? index,
      })),
    });

    return tx.invoice.findUnique({
      where: { id: newInvoice.id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  });

  return invoice;
}

export async function updateInvoice(orgId: string, id: string, data: UpdateInvoiceInput) {
  const existing = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId },
    include: { items: true },
  });

  if (!existing) {
    throw new NotFoundError('Invoice');
  }

  if (existing.status !== 'DRAFT') {
    throw new ValidationError('Only DRAFT invoices can be updated');
  }

  const itemsToUse = data.items ?? existing.items.map((i) => ({
    description: i.description,
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

  const { subtotal, taxAmount, total } = calculateInvoiceTotals(
    itemsToUse,
    discountType,
    discountValue,
    taxRate
  );

  const invoice = await prisma.$transaction(async (tx) => {
    if (data.items !== undefined) {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await tx.invoiceItem.createMany({
        data: data.items.map((item, index) => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          discount: (item.discount ?? 0).toString(),
          total: (item.quantity * item.unitPrice * (1 - (item.discount ?? 0))).toString(),
          order: item.order ?? index,
        })),
      });
    }

    return tx.invoice.update({
      where: { id },
      data: {
        ...(data.accountId !== undefined && { accountId: data.accountId ?? null }),
        ...(data.contractId !== undefined && { contractId: data.contractId ?? null }),
        ...(data.title !== undefined && { title: data.title ?? null }),
        ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
        ...(data.discountType !== undefined && { discountType: data.discountType ?? null }),
        ...(data.discountValue !== undefined && {
          discountValue: data.discountValue != null ? data.discountValue.toString() : null,
        }),
        ...(data.taxRate !== undefined && {
          taxRate: data.taxRate != null ? data.taxRate.toString() : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
        ...(data.terms !== undefined && { terms: data.terms ?? null }),
        ...(data.currency !== undefined && { currency: data.currency }),
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        total: total.toString(),
        amountDue: (total - Number(existing.amountPaid)).toString(),
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  });

  return invoice;
}

export async function deleteInvoice(orgId: string, id: string) {
  const existing = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Invoice');
  }

  if (existing.status !== 'DRAFT') {
    throw new ValidationError('Only DRAFT invoices can be deleted');
  }

  await prisma.invoice.delete({ where: { id } });

  return { message: 'Invoice deleted successfully' };
}

export async function sendInvoice(orgId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId },
    include: {
      account: { select: { id: true, name: true, email: true } },
    },
  });

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  const now = new Date();

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAt: now,
    },
    include: {
      items: { orderBy: { order: 'asc' } },
      account: { select: { id: true, name: true, email: true } },
    },
  });

  if (invoice.account?.email) {
    try {
      await emailTransporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: invoice.account.email,
        subject: `Invoice ${invoice.invoiceNumber}${invoice.title ? ` - ${invoice.title}` : ''}`,
        html: `
          <p>Dear ${invoice.account.name},</p>
          <p>Please find attached your invoice <strong>${invoice.invoiceNumber}</strong>.</p>
          <p><strong>Amount Due:</strong> ${invoice.currency} ${Number(invoice.amountDue).toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
          ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
          <p>Thank you for your business.</p>
          <p>Best regards,<br/>${env.SMTP_FROM_NAME}</p>
        `,
      });
    } catch {
      // Email failure should not block the status update
    }
  }

  return updated;
}

export async function recordPayment(orgId: string, invoiceId: string, data: RecordPaymentInput) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
  });

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  if (invoice.status === 'VOID' || invoice.status === 'CANCELLED') {
    throw new ValidationError('Cannot record payment on a voided or cancelled invoice');
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount: data.amount.toString(),
        method: data.method as any,
        status: 'COMPLETED',
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        notes: data.notes ?? null,
        referenceId: data.referenceId ?? null,
        currency: invoice.currency,
      },
    });

    const newAmountPaid = Number(invoice.amountPaid) + data.amount;
    const newAmountDue = Math.max(0, Number(invoice.total) - newAmountPaid);

    let newStatus: string = invoice.status;
    const paidAt = newAmountDue <= 0 ? (data.paidAt ? new Date(data.paidAt) : new Date()) : null;

    if (newAmountDue <= 0) {
      newStatus = 'PAID';
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const updatedInvoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid.toString(),
        amountDue: newAmountDue.toString(),
        status: newStatus as any,
        ...(paidAt && { paidAt }),
      },
    });

    return { payment, invoice: updatedInvoice };
  });

  return result;
}

export async function voidInvoice(orgId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  if (invoice.status === 'PAID') {
    throw new ValidationError('Cannot void a paid invoice');
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: 'VOID' },
  });

  return updated;
}

export async function getInvoicePayments(orgId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
  });

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  const payments = await prisma.payment.findMany({
    where: { invoiceId },
    orderBy: { createdAt: 'desc' },
  });

  return payments;
}

export async function getInvoicePdfUrl(orgId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  // In production this would trigger PDF generation and return a signed URL
  const downloadUrl = `${env.STORAGE_ENDPOINT}/${env.STORAGE_BUCKET}/invoices/${invoice.invoiceNumber}.pdf`;

  return { invoiceId: id, invoiceNumber: invoice.invoiceNumber, url: downloadUrl };
}

export async function markInvoicePaid(orgId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  const remaining = Number(invoice.amountDue);

  if (remaining <= 0) {
    throw new ValidationError('Invoice is already fully paid');
  }

  return recordPayment(orgId, id, {
    amount: remaining,
    method: 'OTHER',
    notes: 'Marked as paid in full',
  });
}
