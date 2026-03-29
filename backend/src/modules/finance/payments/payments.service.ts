import { prisma } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import type { CreatePaymentInput, UpdatePaymentInput, RefundPaymentInput } from './payments.schema';

export async function listPayments(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  // Build a where clause scoped to the org via the invoice relation
  const invoiceWhere: Record<string, unknown> = { organizationId: orgId };

  if (query.method && typeof query.method === 'string') {
    // filtered at payment level below
  }

  const paymentWhere: Record<string, unknown> = {
    invoice: invoiceWhere,
  };

  if (query.method && typeof query.method === 'string') {
    paymentWhere.method = query.method;
  }

  if (query.status && typeof query.status === 'string') {
    paymentWhere.status = query.status;
  }

  if (query.dateFrom || query.dateTo) {
    const dateFilter: Record<string, unknown> = {};
    if (query.dateFrom && typeof query.dateFrom === 'string') {
      dateFilter.gte = new Date(query.dateFrom);
    }
    if (query.dateTo && typeof query.dateTo === 'string') {
      dateFilter.lte = new Date(query.dateTo);
    }
    paymentWhere.paidAt = dateFilter;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: paymentWhere,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            title: true,
            currency: true,
            account: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where: paymentWhere }),
  ]);

  return {
    payments,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getPaymentById(orgId: string, id: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      id,
      invoice: { organizationId: orgId },
    },
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          title: true,
          total: true,
          amountPaid: true,
          amountDue: true,
          currency: true,
          status: true,
          account: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError('Payment');
  }

  return payment;
}

export async function createPayment(orgId: string, data: CreatePaymentInput) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: data.invoiceId, organizationId: orgId },
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
        invoiceId: data.invoiceId,
        amount: data.amount.toString(),
        method: data.method as any,
        status: 'COMPLETED',
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        notes: data.notes ?? null,
        referenceId: data.referenceId ?? null,
        gateway: data.gateway ?? null,
        currency: invoice.currency,
      },
    });

    const newAmountPaid = Number(invoice.amountPaid) + data.amount;
    const newAmountDue = Math.max(0, Number(invoice.total) - newAmountPaid);

    let newStatus: string = invoice.status;
    const paidAt =
      newAmountDue <= 0 ? (data.paidAt ? new Date(data.paidAt) : new Date()) : null;

    if (newAmountDue <= 0) {
      newStatus = 'PAID';
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const updatedInvoice = await tx.invoice.update({
      where: { id: data.invoiceId },
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

export async function updatePayment(orgId: string, id: string, data: UpdatePaymentInput) {
  const existing = await prisma.payment.findFirst({
    where: {
      id,
      invoice: { organizationId: orgId },
    },
  });

  if (!existing) {
    throw new NotFoundError('Payment');
  }

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      ...(data.notes !== undefined && { notes: data.notes ?? null }),
      ...(data.referenceId !== undefined && { referenceId: data.referenceId ?? null }),
    },
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          title: true,
          currency: true,
          account: { select: { id: true, name: true } },
        },
      },
    },
  });

  return payment;
}

export async function refundPayment(orgId: string, id: string, data: RefundPaymentInput) {
  const payment = await prisma.payment.findFirst({
    where: {
      id,
      invoice: { organizationId: orgId },
    },
    include: {
      invoice: true,
    },
  });

  if (!payment) {
    throw new NotFoundError('Payment');
  }

  if (payment.status === 'REFUNDED') {
    throw new ValidationError('Payment has already been refunded');
  }

  const refundAmount = data.amount ?? Number(payment.amount);
  const originalAmount = Number(payment.amount);

  if (refundAmount > originalAmount) {
    throw new ValidationError('Refund amount cannot exceed original payment amount');
  }

  const isFullRefund = refundAmount >= originalAmount;
  const newPaymentStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id },
      data: { status: newPaymentStatus as any },
    });

    const invoice = payment.invoice;
    const newAmountPaid = Math.max(0, Number(invoice.amountPaid) - refundAmount);
    const newAmountDue = Math.max(0, Number(invoice.total) - newAmountPaid);

    let newInvoiceStatus: string = invoice.status;
    if (newAmountPaid <= 0) {
      newInvoiceStatus = 'SENT';
    } else if (newAmountPaid > 0 && newAmountDue > 0) {
      newInvoiceStatus = 'PARTIALLY_PAID';
    }

    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: newAmountPaid.toString(),
        amountDue: newAmountDue.toString(),
        status: newInvoiceStatus as any,
        paidAt: newInvoiceStatus !== 'PAID' ? null : invoice.paidAt,
      },
    });

    return { payment: updatedPayment, invoice: updatedInvoice };
  });

  return result;
}
