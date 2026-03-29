import { prisma } from '../../../config/database';
import { ValidationError } from '../../../utils/errors';

// ─── Revenue Report ────────────────────────────────────────────────────────────

interface RevenueReportQuery {
  from?: string;
  to?: string;
  groupBy?: string;
}

interface RevenuePeriod {
  period: string;
  revenue: number;
  invoiceCount: number;
}

export async function getRevenueReport(
  orgId: string,
  query: RevenueReportQuery
): Promise<RevenuePeriod[]> {
  const groupBy = (query.groupBy as 'day' | 'month' | 'year') ?? 'month';

  if (!['day', 'month', 'year'].includes(groupBy)) {
    throw new ValidationError('groupBy must be one of: day, month, year');
  }

  const fromDate = query.from ? new Date(query.from) : new Date(new Date().getFullYear(), 0, 1);
  const toDate = query.to ? new Date(query.to) : new Date();

  // Use raw SQL for date truncation / grouping
  let dateTrunc: string;
  let periodFormat: string;

  if (groupBy === 'day') {
    dateTrunc = 'day';
    periodFormat = 'YYYY-MM-DD';
  } else if (groupBy === 'year') {
    dateTrunc = 'year';
    periodFormat = 'YYYY';
  } else {
    dateTrunc = 'month';
    periodFormat = 'YYYY-MM';
  }

  const rows = await prisma.$queryRawUnsafe<
    { period: string; revenue: string; invoice_count: string }[]
  >(
    `
    SELECT
      TO_CHAR(DATE_TRUNC($1, p."paidAt"), $2) AS period,
      SUM(p.amount)::text                      AS revenue,
      COUNT(DISTINCT p."invoiceId")::text       AS invoice_count
    FROM "Payment" p
    INNER JOIN "Invoice" i ON i.id = p."invoiceId"
    WHERE i."organizationId" = $3
      AND p.status = 'COMPLETED'
      AND p."paidAt" >= $4
      AND p."paidAt" <= $5
    GROUP BY DATE_TRUNC($1, p."paidAt")
    ORDER BY DATE_TRUNC($1, p."paidAt") ASC
    `,
    dateTrunc,
    periodFormat,
    orgId,
    fromDate,
    toDate
  );

  return rows.map((row) => ({
    period: row.period,
    revenue: Number(row.revenue),
    invoiceCount: Number(row.invoice_count),
  }));
}

// ─── Outstanding AR ─────────────────────────────────────────────────────────

interface InvoiceStatusBucket {
  status: string;
  count: number;
  amount: number;
}

interface OutstandingARResult {
  totalOutstanding: number;
  overdueAmount: number;
  invoicesByStatus: InvoiceStatusBucket[];
}

export async function getOutstandingAR(orgId: string): Promise<OutstandingARResult> {
  const now = new Date();

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
    },
    select: {
      status: true,
      amountDue: true,
      dueDate: true,
    },
  });

  let totalOutstanding = 0;
  let overdueAmount = 0;
  const statusMap = new Map<string, { count: number; amount: number }>();

  for (const inv of invoices) {
    const due = Number(inv.amountDue);
    totalOutstanding += due;

    if (inv.dueDate < now) {
      overdueAmount += due;
    }

    const existing = statusMap.get(inv.status) ?? { count: 0, amount: 0 };
    statusMap.set(inv.status, {
      count: existing.count + 1,
      amount: existing.amount + due,
    });
  }

  const invoicesByStatus: InvoiceStatusBucket[] = Array.from(statusMap.entries()).map(
    ([status, data]) => ({
      status,
      count: data.count,
      amount: data.amount,
    })
  );

  return { totalOutstanding, overdueAmount, invoicesByStatus };
}

// ─── Payments Received ──────────────────────────────────────────────────────

interface PaymentsReceivedQuery {
  from?: string;
  to?: string;
}

export async function getPaymentsReceived(orgId: string, query: PaymentsReceivedQuery) {
  const fromDate = query.from ? new Date(query.from) : new Date(new Date().getFullYear(), 0, 1);
  const toDate = query.to ? new Date(query.to) : new Date();

  const payments = await prisma.payment.findMany({
    where: {
      invoice: { organizationId: orgId },
      status: 'COMPLETED',
      paidAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    orderBy: { paidAt: 'desc' },
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

  return payments;
}

// ─── Invoice Aging ───────────────────────────────────────────────────────────

interface InvoiceAgingResult {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
}

export async function getInvoiceAging(orgId: string): Promise<InvoiceAgingResult> {
  const now = new Date();

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
    },
    select: {
      dueDate: true,
      amountDue: true,
    },
  });

  const result: InvoiceAgingResult = {
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    over90: 0,
  };

  for (const inv of invoices) {
    const due = Number(inv.amountDue);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / msPerDay);

    if (daysOverdue <= 0) {
      result.current += due;
    } else if (daysOverdue <= 30) {
      result.days30 += due;
    } else if (daysOverdue <= 60) {
      result.days60 += due;
    } else if (daysOverdue <= 90) {
      result.days90 += due;
    } else {
      result.over90 += due;
    }
  }

  return result;
}

// ─── Revenue by Account ──────────────────────────────────────────────────────

interface RevenueByAccountQuery {
  from?: string;
  to?: string;
}

interface AccountRevenueRow {
  accountId: string;
  accountName: string;
  revenue: number;
  invoiceCount: number;
}

export async function getRevenueByAccount(
  orgId: string,
  query: RevenueByAccountQuery
): Promise<AccountRevenueRow[]> {
  const fromDate = query.from ? new Date(query.from) : new Date(new Date().getFullYear(), 0, 1);
  const toDate = query.to ? new Date(query.to) : new Date();

  const rows = await prisma.$queryRawUnsafe<
    {
      account_id: string;
      account_name: string;
      revenue: string;
      invoice_count: string;
    }[]
  >(
    `
    SELECT
      a.id                                    AS account_id,
      a.name                                  AS account_name,
      COALESCE(SUM(p.amount), 0)::text        AS revenue,
      COUNT(DISTINCT p."invoiceId")::text     AS invoice_count
    FROM "Account" a
    INNER JOIN "Invoice" i  ON i."accountId" = a.id
    INNER JOIN "Payment" p  ON p."invoiceId" = i.id
    WHERE a."organizationId" = $1
      AND p.status = 'COMPLETED'
      AND p."paidAt" >= $2
      AND p."paidAt" <= $3
    GROUP BY a.id, a.name
    ORDER BY COALESCE(SUM(p.amount), 0) DESC
    `,
    orgId,
    fromDate,
    toDate
  );

  return rows.map((row) => ({
    accountId: row.account_id,
    accountName: row.account_name,
    revenue: Number(row.revenue),
    invoiceCount: Number(row.invoice_count),
  }));
}
