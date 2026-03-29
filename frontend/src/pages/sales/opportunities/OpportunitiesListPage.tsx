import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOpportunities, useDeleteOpportunity } from '@/api/opportunities.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { TrendingUp, Plus, Search, Eye, Trash2 } from 'lucide-react';

export default function OpportunitiesListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useOpportunities({
    search: debouncedSearch || undefined,
    page,
  });
  const deleteOpportunity = useDeleteOpportunity();

  const opportunities = (data as any[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="Manage your sales opportunities and deals"
        action={
          <Link
            to="/sales/opportunities/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Opportunity
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search opportunities..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : opportunities.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No opportunities found"
            description="Create your first opportunity to start tracking deals"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {[
                      'Name',
                      'Account / Contact',
                      'Pipeline',
                      'Stage',
                      'Value',
                      'Probability',
                      'Status',
                      'Expected Close',
                      'Assignee',
                      '',
                    ].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((opp: any) => (
                    <tr key={opp.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/sales/opportunities/${opp.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-600 whitespace-nowrap"
                        >
                          {opp.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex flex-col gap-0.5">
                          {opp.account?.name && (
                            <span className="text-xs font-medium text-slate-700">
                              {opp.account.name}
                            </span>
                          )}
                          {opp.contact && (
                            <span className="text-xs text-slate-500">
                              {opp.contact.firstName} {opp.contact.lastName}
                            </span>
                          )}
                          {!opp.account && !opp.contact && <span>-</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{opp.pipeline?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{opp.stage?.name ?? '-'}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {formatCurrency(opp.value, opp.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{opp.probability}%</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={opp.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {opp.assignee
                          ? `${opp.assignee.firstName} ${opp.assignee.lastName}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/sales/opportunities/${opp.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Delete this opportunity?'))
                                deleteOpportunity.mutate(opp.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">{opportunities.length} opportunit(ies)</p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={opportunities.length === 0}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
