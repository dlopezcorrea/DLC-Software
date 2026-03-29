import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, XCircle } from 'lucide-react';
import { useInvoice, useRecordPayment, useSendInvoice, useUpdateInvoice, useInvoicePayments } from '@/api/invoices.api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/utils/constants';

const PAYMENT_METHODS = ['credit_card', 'bank_transfer', 'check', 'cash', 'other'];

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'bank_transfer',
    reference: '',
    paidAt: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const { data: invoice, isLoading, isError } = useInvoice(id!);
  const { data: paymentsData } = useInvoicePayments(id!);
  const recordPayment = useRecordPayment();
  const sendInvoice = useSendInvoice();
  const updateInvoice = useUpdateInvoice();

  const handleSend = () => {
    if (!id) return;
    sendInvoice.mutate({ id });
  };

  const handleVoid = () => {
    if (!id) return;
    updateInvoice.mutate({ id, status: 'VOID' });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    recordPayment.mutate(
      {
        id,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference || undefined,
        paidAt: paymentForm.paidAt,
        notes: paymentForm.notes || undefined,
      },
      {
        onSuccess: () => {
          setShowPaymentModal(false);
          setPaymentForm({
            amount: '',
            method: 'bank_transfer',
            reference: '',
            paidAt: new Date().toISOString().split('T')[0],
            notes: '',
          });
        },
      }
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !invoice) {
    return (
      <div className="text-center py-12 text-red-600 text-sm">
        Failed to load invoice details.
      </div>
    );
  }

  const inv = invoice as any;
  const payments = (paymentsData as any[]) ?? [];
  const lineItems: any[] = inv.items ?? inv.lineItems ?? [];

  const canSend = inv.status === 'DRAFT';
  const canMarkPaid = ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(inv.status);
  const canVoid = ['DRAFT', 'SENT'].includes(inv.status);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/finance/invoices"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 font-mono">{inv.invoiceNumber}</h1>
          <StatusBadge
            status={inv.status}
            labelMap={INVOICE_STATUS_LABELS}
            colorMap={INVOICE_STATUS_COLORS}
          />
          <div className="ml-auto flex items-center gap-2">
            {canSend && (
              <button
                onClick={handleSend}
                disabled={sendInvoice.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Invoice
              </button>
            )}
            {canMarkPaid && (
              <button
                onClick={() => {
                  setPaymentForm((f) => ({
                    ...f,
                    amount: String(inv.amountDue ?? inv.total ?? ''),
                  }));
                  setShowPaymentModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Record Payment
              </button>
            )}
            {canVoid && (
              <button
                onClick={handleVoid}
                disabled={updateInvoice.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Void
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Left: Bill To + Dates + Notes */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Bill To
            </h3>
            {inv.account ? (
              <div>
                <p className="font-semibold text-slate-900">{inv.account.name}</p>
                {inv.account.email && (
                  <p className="text-sm text-slate-500 mt-1">{inv.account.email}</p>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No billing account</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Invoice Details
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Invoice #</dt>
                <dd className="font-mono font-medium text-slate-900">{inv.invoiceNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Issue Date</dt>
                <dd className="text-slate-700">{formatDate(inv.issueDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Due Date</dt>
                <dd className="text-slate-700">{formatDate(inv.dueDate)}</dd>
              </div>
              {inv.title && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Title</dt>
                  <dd className="text-slate-700 text-right max-w-[60%]">{inv.title}</dd>
                </div>
              )}
            </dl>
          </div>

          {inv.notes && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Notes
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{inv.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Line Items + Totals */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">Line Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Qty</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Unit Price</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Discount</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs">
                        No line items
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">
                          <p className="font-medium">{item.description ?? item.productName}</p>
                          {item.notes && (
                            <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          {formatCurrency(item.unitPrice, inv.currency)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">
                          {item.discount ? `${item.discount}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {formatCurrency(item.total, inv.currency)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Footer */}
            <div className="border-t border-slate-200 px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900">{formatCurrency(inv.subtotal ?? 0, inv.currency)}</span>
              </div>
              {inv.taxAmount != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="text-slate-900">{formatCurrency(inv.taxAmount, inv.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold border-t border-slate-100 pt-2">
                <span className="text-slate-900">Total</span>
                <span className="text-slate-900">{formatCurrency(inv.total ?? 0, inv.currency)}</span>
              </div>
              {inv.amountPaid > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Amount Paid</span>
                  <span>-{formatCurrency(inv.amountPaid, inv.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
                <span className="text-slate-900">Amount Due</span>
                <span className="text-slate-900">{formatCurrency(inv.amountDue ?? 0, inv.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">Payment History</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Method</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700 capitalize">
                    {(payment.method ?? '').replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">
                    {formatCurrency(payment.amount, inv.currency)}
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

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) =>
                    setPaymentForm((f) => ({ ...f, method: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.paidAt}
                  onChange={(e) =>
                    setPaymentForm((f) => ({ ...f, paidAt: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) =>
                    setPaymentForm((f) => ({ ...f, reference: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Transaction ID, check #, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordPayment.isPending}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
