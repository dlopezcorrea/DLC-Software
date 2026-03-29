import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

type Account = { id: string; name: string };

export async function seedFinance(
  prisma: PrismaClient,
  orgId: string,
  { accounts }: { accounts: Account[] }
) {
  // Create 3 contracts
  const contractData = [
    { title: 'Annual Software License', accountIdx: 0, value: 45000, status: 'ACTIVE' as const, startDate: dayjs().subtract(6, 'month').toDate(), endDate: dayjs().add(6, 'month').toDate() },
    { title: 'Support & Maintenance Agreement', accountIdx: 2, value: 24000, status: 'ACTIVE' as const, startDate: dayjs().subtract(3, 'month').toDate(), endDate: dayjs().add(9, 'month').toDate() },
    { title: 'Professional Services Contract', accountIdx: 4, value: 55000, status: 'EXPIRED' as const, startDate: dayjs().subtract(18, 'month').toDate(), endDate: dayjs().subtract(6, 'month').toDate() },
  ];

  const contracts = [];
  for (let i = 0; i < contractData.length; i++) {
    const { accountIdx, ...data } = contractData[i];
    const contract = await prisma.contract.create({
      data: {
        ...data,
        organizationId: orgId,
        contractNumber: `CON-2024-${String(i + 1).padStart(4, '0')}`,
        accountId: accounts[accountIdx].id,
        currency: 'USD',
        autoRenew: i === 0,
      },
    });
    contracts.push(contract);
  }

  // Create 8 invoices
  const invoiceData = [
    { title: 'Q1 Software License', accountIdx: 0, status: 'PAID' as const, total: 11250, daysAgo: 90, contractIdx: 0 },
    { title: 'Q2 Software License', accountIdx: 0, status: 'PAID' as const, total: 11250, daysAgo: 60, contractIdx: 0 },
    { title: 'Q3 Software License', accountIdx: 0, status: 'SENT' as const, total: 11250, daysAgo: 30, contractIdx: 0 },
    { title: 'Support Services - Jan', accountIdx: 2, status: 'PAID' as const, total: 2000, daysAgo: 60, contractIdx: 1 },
    { title: 'Support Services - Feb', accountIdx: 2, status: 'PAID' as const, total: 2000, daysAgo: 30, contractIdx: 1 },
    { title: 'Professional Services - Phase 1', accountIdx: 4, status: 'PAID' as const, total: 27500, daysAgo: 120, contractIdx: 2 },
    { title: 'Professional Services - Phase 2', accountIdx: 4, status: 'OVERDUE' as const, total: 27500, daysAgo: -15, contractIdx: 2 },
    { title: 'Consulting Project', accountIdx: 6, status: 'DRAFT' as const, total: 8500, daysAgo: 0, contractIdx: null },
  ];

  for (let i = 0; i < invoiceData.length; i++) {
    const { accountIdx, contractIdx, daysAgo, total, ...data } = invoiceData[i];
    const issueDate = dayjs().subtract(daysAgo, 'day').toDate();
    const dueDate = dayjs(issueDate).add(30, 'day').toDate();
    const isPaid = data.status === 'PAID';

    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        organizationId: orgId,
        invoiceNumber: `INV-2024-${String(i + 1).padStart(4, '0')}`,
        accountId: accounts[accountIdx].id,
        contractId: contractIdx !== null ? contracts[contractIdx].id : undefined,
        issueDate,
        dueDate,
        subtotal: total / 1.1,
        taxRate: 0.1,
        taxAmount: total - total / 1.1,
        total,
        amountPaid: isPaid ? total : 0,
        amountDue: isPaid ? 0 : total,
        currency: 'USD',
        paidAt: isPaid ? dayjs(issueDate).add(15, 'day').toDate() : undefined,
        items: {
          create: [
            { description: data.title || 'Service Fee', quantity: 1, unitPrice: total / 1.1, discount: 0, total: total / 1.1, order: 1 },
          ],
        },
      },
    });

    // Create payment for paid invoices
    if (isPaid) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: total,
          currency: 'USD',
          method: 'BANK_TRANSFER',
          status: 'COMPLETED',
          paidAt: dayjs(issueDate).add(15, 'day').toDate(),
          referenceId: `PAY-${i + 1000}`,
        },
      });
    }
  }

  return { contracts };
}
