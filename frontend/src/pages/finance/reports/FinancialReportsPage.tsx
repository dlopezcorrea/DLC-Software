import { useOutstandingAR, useInvoiceAging, useRevenueByAccount } from '@/api/reports.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/formatters';
import { DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

const AGING_BUCKETS = [
  { key: 'current', label: 'Current' },
  { key: 'days1to30', label: '1–30 Days' },
  { key: 'days31to60', label: '31–60 Days' },
  { key: 'days61to90', label: '61–90 Days' },
  { key: 'days90plus', label: '90+ Days' },
];

const AGING_COLORS = [
  'bg-green-500',
  'bg-yellow-400',
  'bg-orange-400',
  'bg-red-400',
  'bg-red-600',
];

function MetricCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function FinancialReportsPage() {
  const { data: arData, isLoading: arLoading } = useOutstandingAR();
  const { data: agingData, isLoading: agingLoading } = useInvoiceAging();
  const { data: revenueByAccountData, isLoading: rbaLoading } = useRevenueByAccount();

  const ar = (arData as any) ?? {};
  const aging = (agingData as any) ?? {};
  const revenueByAccount = (revenueByAccountData as any[]) ?? [];

  // Compute max value for bar visualization
  const agingValues = AGING_BUCKETS.map((b) => Number(aging[b.key] ?? 0));
  const maxAgingValue = Math.max(...agingValues, 1);

  // Derived metrics from AR data
  const totalOutstanding = ar.totalOutstanding ?? ar.total ?? 0;
  const revenueThisYear = ar.revenueThisYear ?? ar.revenue ?? 0;
  const overdueAmount = ar.overdueAmount ?? ar.overdue ?? 0;

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        description="Overview of revenue, outstanding balances, and invoice aging"
      />

      {/* Metric Cards */}
      {arLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <MetricCard
            icon={DollarSign}
            label="Total Outstanding AR"
            value={formatCurrency(totalOutstanding)}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <MetricCard
            icon={TrendingUp}
            label="Revenue This Year"
            value={formatCurrency(revenueThisYear)}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <MetricCard
            icon={AlertTriangle}
            label="Overdue Amount"
            value={formatCurrency(overdueAmount)}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />
        </div>
      )}

      {/* Invoice Aging */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Invoice Aging</h2>
        {agingLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            {AGING_BUCKETS.map((bucket, i) => {
              const value = Number(aging[bucket.key] ?? 0);
              const pct = maxAgingValue > 0 ? (value / maxAgingValue) * 100 : 0;
              return (
                <div key={bucket.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{bucket.label}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(value)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${AGING_COLORS[i]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Revenue by Account */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Revenue by Account</h2>
          <p className="text-xs text-slate-500 mt-0.5">Top 10 accounts by total revenue</p>
        </div>
        {rbaLoading ? (
          <LoadingSpinner />
        ) : revenueByAccount.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">No data available.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">#</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Account</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Total Revenue</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {revenueByAccount.slice(0, 10).map((row: any, idx: number) => (
                <tr key={row.accountId ?? idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.accountName ?? row.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {formatCurrency(row.totalRevenue ?? row.revenue ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {(row.invoiceCount ?? row.count ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
