import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useInvoices } from '@/api/invoices.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/utils/constants';
import { cn } from '@/utils/cn';

type InvoiceStatusFilter =
  | 'ALL'
  | 'DRAFT'
  | 'SENT'
  | 'PAID'
  | 'OVERDUE'
  | 'PARTIALLY_PAID';

const STATUS_TABS: { label: string; value: InvoiceStatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
];

export default function InvoicesListPage() {
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatusFilter>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useInvoices({
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    page,
  });

  const invoices = (data as any[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Manage billing and invoice collection"
        action={
          <Link
            to="/finance/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200">
        {/* Status filter tabs */}
        <div className="border-b border-slate-200 px-4">
          <nav className="flex gap-0 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setSelectedStatus(tab.value);
                  setPage(1);
                }}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                  selectedStatus === tab.value
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <div className="text-center py-12 text-red-600 text-sm">Failed to load invoices.</div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description="Create your first invoice to start billing."
            action={
              <Link
                to="/finance/invoices/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Invoice
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Account</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Issue Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Due Date</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Amount Due</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/finance/invoices/${invoice.id}`}
                        className="font-mono text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {invoice.account?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 font-medium">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(invoice.amountDue, invoice.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={invoice.status}
                        labelMap={INVOICE_STATUS_LABELS}
                        colorMap={INVOICE_STATUS_COLORS}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/finance/invoices/${invoice.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
