import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useAccount,
  useAccountContacts,
  useAccountOpportunities,
  useAccountInvoices,
} from '@/api/accounts.api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/formatters';
import {
  ArrowLeft, Globe, Phone, Mail, Users, TrendingUp, Receipt,
  LifeBuoy, Building2, Calendar,
} from 'lucide-react';

type Tab = 'overview' | 'contacts' | 'opportunities' | 'invoices' | 'tickets';

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: account, isLoading } = useAccount(id!);
  const { data: contacts, isLoading: contactsLoading } = useAccountContacts(id!);
  const { data: opportunities, isLoading: oppsLoading } = useAccountOpportunities(id!);
  const { data: invoices, isLoading: invoicesLoading } = useAccountInvoices(id!);

  if (isLoading) return <LoadingSpinner />;

  if (!account) {
    return (
      <EmptyState
        icon={Building2}
        title="Account not found"
        description="This account does not exist or has been deleted."
        action={
          <Link to="/accounts" className="text-sm text-indigo-600 hover:underline">
            Back to Accounts
          </Link>
        }
      />
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'tickets', label: 'Tickets' },
  ];

  const contactList = (contacts as any[]) ?? [];
  const oppList = (opportunities as any[]) ?? [];
  const invoiceList = (invoices as any[]) ?? [];

  return (
    <div>
      <Link
        to="/accounts"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Accounts
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{account.name}</h1>
            {account.industry && (
              <p className="text-slate-500 text-sm mt-0.5">{account.industry}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={account.isActive ? 'ACTIVE' : 'INACTIVE'} />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{account._count?.contacts ?? 0}</p>
            <p className="text-xs text-slate-500 mt-0.5">Contacts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{account._count?.opportunities ?? 0}</p>
            <p className="text-xs text-slate-500 mt-0.5">Opportunities</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {account.employeeCount ? account.employeeCount.toLocaleString() : '-'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Employees</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {account.annualRevenue ? formatCurrency(account.annualRevenue) : '-'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Annual Revenue</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Account Information</h2>
            <dl className="space-y-3">
              {account.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Website</dt>
                    <dd className="text-sm text-slate-900">
                      <a
                        href={account.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600"
                      >
                        {account.website}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {account.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Phone</dt>
                    <dd className="text-sm text-slate-900">{account.phone}</dd>
                  </div>
                </div>
              )}
              {account.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Email</dt>
                    <dd className="text-sm text-slate-900">
                      <a href={`mailto:${account.email}`} className="hover:text-indigo-600">
                        {account.email}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-500">Created</dt>
                  <dd className="text-sm text-slate-900">{formatDateTime(account.createdAt)}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="bg-white rounded-xl border border-slate-200">
          {contactsLoading ? (
            <LoadingSpinner />
          ) : contactList.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No contacts"
              description="No contacts are associated with this account."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Name', 'Email', 'Phone', 'Title', 'Type'].map(h => (
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
                {contactList.map((c: any) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/contacts/${c.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.email ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.phone ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.jobTitle ?? '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.type} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div className="bg-white rounded-xl border border-slate-200">
          {oppsLoading ? (
            <LoadingSpinner />
          ) : oppList.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No opportunities"
              description="No opportunities are associated with this account."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Name', 'Stage', 'Value', 'Status', 'Close Date'].map(h => (
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
                {oppList.map((o: any) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/sales/opportunities/${o.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {o.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{o.stage?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {formatCurrency(o.value)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {o.expectedCloseDate ? formatDate(o.expectedCloseDate) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-slate-200">
          {invoicesLoading ? (
            <LoadingSpinner />
          ) : invoiceList.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices"
              description="No invoices are associated with this account."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Invoice #', 'Title', 'Status', 'Total', 'Due Date'].map(h => (
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
                {invoiceList.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/finance/invoices/${inv.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{inv.title ?? '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            icon={LifeBuoy}
            title="No tickets"
            description="No support tickets are associated with this account."
          />
        </div>
      )}
    </div>
  );
}
