import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Ticket } from 'lucide-react';
import { useTickets } from '@/api/tickets.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatters';
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_COLORS,
} from '@/utils/constants';
import { cn } from '@/utils/cn';

type StatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED' | 'CLOSED';

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Waiting', value: 'WAITING_ON_CUSTOMER' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

const PRIORITY_OPTIONS = [
  { label: 'All Priorities', value: '' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

export default function TicketsListPage() {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useTickets({
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    search: debouncedSearch || undefined,
    priority: selectedPriority || undefined,
  });

  const tickets = (data as any[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Manage customer support requests"
        action={
          <Link
            to="/support/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200">
        {/* Status filter tabs */}
        <div className="border-b border-slate-200 px-4">
          <nav className="flex gap-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
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

        {/* Filters row */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <div className="text-center py-12 text-red-600 text-sm">Failed to load tickets.</div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No tickets found"
            description="No support tickets match your current filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Ticket #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Assignee</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">SLA</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/support/tickets/${ticket.id}`}
                        className="font-mono text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        #{ticket.ticketNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/support/tickets/${ticket.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {ticket.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {ticket.contact
                        ? `${ticket.contact.firstName} ${ticket.contact.lastName}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          TICKET_PRIORITY_COLORS[ticket.priority] ?? 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {TICKET_PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} labelMap={TICKET_STATUS_LABELS} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {ticket.assignee
                        ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
                        : <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      {ticket.slaBreached ? (
                        <span className="text-red-600 font-medium text-xs">Breached</span>
                      ) : (
                        <span className="text-green-600 text-xs">On Track</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(ticket.createdAt)}</td>
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
