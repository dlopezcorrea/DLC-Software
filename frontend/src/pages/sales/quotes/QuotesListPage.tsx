import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuotes, useDeleteQuote } from '@/api/quotes.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { FileText, Plus, Search, Eye, Trash2 } from 'lucide-react';

export default function QuotesListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuotes({
    search: debouncedSearch || undefined,
    page,
  });
  const deleteQuote = useDeleteQuote();

  const quotes = (data as any[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Quotes"
        description="Create and manage quotes for your customers"
        action={
          <Link
            to="/sales/quotes/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Quote
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
              placeholder="Search quotes..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : quotes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quotes yet"
            description="Create your first quote to send to a customer"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {[
                      'Quote #',
                      'Title',
                      'Opportunity',
                      'Status',
                      'Total',
                      'Valid Until',
                      'Created',
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
                  {quotes.map((q: any) => (
                    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/sales/quotes/${q.id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {q.quoteNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">{q.title}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {q.opportunity ? (
                          <Link
                            to={`/sales/opportunities/${q.opportunityId}`}
                            className="hover:text-indigo-600"
                          >
                            {q.opportunity.name}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {formatCurrency(q.total, q.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {q.validUntil ? formatDate(q.validUntil) : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(q.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/sales/quotes/${q.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Delete this quote?')) deleteQuote.mutate(q.id);
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
              <p className="text-sm text-slate-500">{quotes.length} quote(s)</p>
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
                  disabled={quotes.length === 0}
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
