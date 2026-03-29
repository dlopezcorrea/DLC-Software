import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeads, useDeleteLead } from '@/api/leads.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { UserPlus, Plus, Search, Eye, Trash2 } from 'lucide-react';

type LeadStatus = 'ALL' | 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED';

const STATUS_TABS: { label: string; value: LeadStatus }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Qualified', value: 'QUALIFIED' },
  { label: 'Unqualified', value: 'UNQUALIFIED' },
  { label: 'Converted', value: 'CONVERTED' },
];

export default function LeadsListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeadStatus>('ALL');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useLeads({
    search: debouncedSearch || undefined,
    page,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });
  const deleteLead = useDeleteLead();

  const leads = (data as any[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Track and manage your incoming leads"
        action={
          <Link
            to="/sales/leads/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Lead
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200">
        {/* Status filter tabs */}
        <div className="border-b border-slate-200 px-4">
          <nav className="flex gap-0">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  statusFilter === tab.value
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search leads..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No leads found"
            description="Add your first lead or adjust your filters"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Name', 'Email', 'Company', 'Source', 'Status', 'Score', 'Assignee', 'Created', ''].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead: any) => (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/sales/leads/${lead.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-600"
                        >
                          {lead.firstName} {lead.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.email ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.company ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.source ?? '-'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
                            lead.score >= 80
                              ? 'bg-green-100 text-green-700'
                              : lead.score >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {lead.score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {lead.assignee
                          ? `${lead.assignee.firstName} ${lead.assignee.lastName}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/sales/leads/${lead.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Delete this lead?')) deleteLead.mutate(lead.id);
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
              <p className="text-sm text-slate-500">{leads.length} lead(s)</p>
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
                  disabled={leads.length === 0}
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
