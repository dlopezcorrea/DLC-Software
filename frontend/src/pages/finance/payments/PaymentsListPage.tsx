import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { apiClient } from '@/api/client';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatCurrency } from '@/utils/formatters';

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  accountName?: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paidAt: string;
  reference?: string;
}

export default function PaymentsListPage() {
  const { data: payments, isLoading, isError } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => apiClient.get('/payments').then((r) => r.data.data),
  });

  const paymentsList = payments ?? [];

  return (
    <div>
      <PageHeader
        title="Payments"
        description="View all recorded payments"
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-600 text-sm">Failed to load payments.</div>
      ) : paymentsList.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments recorded"
          description="Payments will appear here once invoices are paid."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Account</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Method</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Paid At</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentsList.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    {payment.invoiceId ? (
                      <Link
                        to={`/finance/invoices/${payment.invoiceId}`}
                        className="font-mono text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {payment.invoiceNumber ?? payment.invoiceId}
                      </Link>
                    ) : (
                      <span className="text-slate-400 font-mono">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{payment.accountName ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize">
                    {(payment.method ?? '').replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'COMPLETED' || payment.status === 'SUCCESS'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : payment.status === 'FAILED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {payment.paidAt ? formatDate(payment.paidAt) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {payment.reference ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
