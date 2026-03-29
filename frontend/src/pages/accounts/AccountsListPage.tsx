import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccounts, useDeleteAccount } from '@/api/accounts.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatters';
import { Building2, Plus, Search, Eye, Trash2 } from 'lucide-react';

export default function AccountsListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useAccounts({ search: debouncedSearch || undefined, page });
  const deleteAccount = useDeleteAccount();

  const accounts = (data as any[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Manage your business accounts and organizations"
        action={
          <Link
            to="/accounts/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Account
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
              placeholder="Search accounts..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No accounts yet"
            description="Add your first account to get started"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Name', 'Industry', 'Website', 'Contacts', 'Opportunities', 'Created', ''].map(h => (
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
                  {accounts.map((a: any) => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/accounts/${a.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-600"
                        >
                          {a.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{a.industry ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.website ? (
                          <a
                            href={a.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-indigo-600 truncate max-w-32 block"
                          >
                            {a.website.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a._count?.contacts ?? 0}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a._count?.opportunities ?? 0}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(a.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/accounts/${a.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Delete this account?')) deleteAccount.mutate(a.id);
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
              <p className="text-sm text-slate-500">{accounts.length} account(s)</p>
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
                  disabled={accounts.length === 0}
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
