import { useQuery } from '@tanstack/react-query';
import { Users, Plus } from 'lucide-react';
import { apiClient } from '@/api/client';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/utils/formatters';

interface Segment {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isDynamic: boolean;
  createdAt: string;
}

export default function SegmentsListPage() {
  const { data: segments, isLoading, isError } = useQuery<Segment[]>({
    queryKey: ['segments'],
    queryFn: () => apiClient.get('/marketing/segments').then((r) => r.data.data),
  });

  return (
    <div>
      <PageHeader
        title="Segments"
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Segment
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-600 text-sm">Failed to load segments.</div>
      ) : !segments || segments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No segments yet"
          description="Create audience segments to target specific groups in your campaigns."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Members</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {segments.map((segment) => (
                <tr key={segment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{segment.name}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                    {segment.description ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {segment.memberCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        segment.isDynamic
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {segment.isDynamic ? 'Dynamic' : 'Static'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(segment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
