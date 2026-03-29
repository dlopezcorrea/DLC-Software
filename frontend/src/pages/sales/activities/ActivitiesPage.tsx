import { useState } from 'react';
import { useActivities, useDeleteActivity, useCompleteActivity } from '@/api/activities.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import {
  Calendar, Plus, Search, Trash2, CheckCircle2, Circle,
  Phone, Mail, Video, FileText, StickyNote, Users,
} from 'lucide-react';

type ActivityType = 'ALL' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE' | 'DEMO';

const TYPE_TABS: { label: string; value: ActivityType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Call', value: 'CALL' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'Meeting', value: 'MEETING' },
  { label: 'Task', value: 'TASK' },
  { label: 'Note', value: 'NOTE' },
  { label: 'Demo', value: 'DEMO' },
];

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: CheckCircle2,
  NOTE: StickyNote,
  DEMO: Video,
};

function ActivityTypeIcon({ type, className }: { type: string; className?: string }) {
  const Icon = ACTIVITY_ICONS[type] ?? FileText;
  return <Icon className={className} />;
}

const TYPE_COLORS: Record<string, string> = {
  CALL: 'bg-blue-100 text-blue-600',
  EMAIL: 'bg-indigo-100 text-indigo-600',
  MEETING: 'bg-purple-100 text-purple-600',
  TASK: 'bg-orange-100 text-orange-600',
  NOTE: 'bg-slate-100 text-slate-600',
  DEMO: 'bg-green-100 text-green-600',
};

export default function ActivitiesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<ActivityType>('ALL');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useActivities({
    search: debouncedSearch || undefined,
    page,
    type: typeFilter !== 'ALL' ? typeFilter : undefined,
  });
  const deleteActivity = useDeleteActivity();
  const completeActivity = useCompleteActivity();

  const activities = (data as any[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Activities"
        description="Track calls, emails, meetings, tasks, and notes"
        action={
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> Log Activity
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200">
        {/* Type filter tabs */}
        <div className="border-b border-slate-200 px-4">
          <nav className="flex gap-0">
            {TYPE_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setTypeFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  typeFilter === tab.value
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
              placeholder="Search activities..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No activities found"
            description="Log an activity to keep track of your customer interactions"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Type', 'Subject', 'Contact', 'Related To', 'Due Date', 'Status', 'Created', ''].map(h => (
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
                  {activities.map((a: any) => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
                            TYPE_COLORS[a.type] ?? 'bg-slate-100 text-slate-600'
                          )}
                        >
                          <ActivityTypeIcon type={a.type} className="w-3 h-3" />
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{a.subject}</p>
                        {a.description && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-48">
                            {a.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.contact
                          ? `${a.contact.firstName} ${a.contact.lastName}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.opportunity?.name ?? a.lead?.firstName ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {a.dueAt ? formatDate(a.dueAt) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                            a.isCompleted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {a.isCompleted ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                          {a.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(a.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!a.isCompleted && (
                            <button
                              onClick={() => completeActivity.mutate(a.id)}
                              title="Mark complete"
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Delete this activity?')) deleteActivity.mutate(a.id);
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
              <p className="text-sm text-slate-500">{activities.length} activit(ies)</p>
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
                  disabled={activities.length === 0}
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
