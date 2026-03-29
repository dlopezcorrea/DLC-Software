import { Link } from 'react-router-dom';
import { Plus, FileSignature } from 'lucide-react';
import { useContracts } from '@/api/contracts.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { CONTRACT_STATUS_LABELS } from '@/utils/constants';

export default function ContractsListPage() {
  const { data, isLoading, isError } = useContracts();
  const contracts = (data as any[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Contracts"
        description="Manage customer contracts and agreements"
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Contract
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-600 text-sm">Failed to load contracts.</div>
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="No contracts yet"
          description="Create your first contract to start managing agreements."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Contract #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Account</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Start Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">End Date</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Value</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Auto Renew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((contract: any) => (
                <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/finance/contracts/${contract.id}`}
                      className="font-mono text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {contract.contractNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{contract.account?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                    {contract.title}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={contract.status} labelMap={CONTRACT_STATUS_LABELS} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {contract.startDate ? formatDate(contract.startDate) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {contract.endDate ? formatDate(contract.endDate) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {contract.value != null
                      ? formatCurrency(contract.value, contract.currency)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {contract.autoRenew ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No</span>
                    )}
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
