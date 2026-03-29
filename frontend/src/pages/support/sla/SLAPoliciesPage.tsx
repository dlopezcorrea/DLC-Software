import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { apiClient } from '@/api/client';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

interface SLAPolicy {
  id: string;
  name: string;
  priority: string;
  firstResponseHours: number;
  resolutionHours: number;
  businessHoursOnly: boolean;
  isDefault: boolean;
  isActive: boolean;
}

export default function SLAPoliciesPage() {
  const { data: policies, isLoading, isError } = useQuery<SLAPolicy[]>({
    queryKey: ['sla-policies'],
    queryFn: () => apiClient.get('/support/sla-policies').then((r) => r.data.data),
  });

  return (
    <div>
      <PageHeader
        title="SLA Policies"
        description="Define service level agreements for ticket response and resolution times"
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-600 text-sm">Failed to load SLA policies.</div>
      ) : !policies || policies.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No SLA policies defined"
          description="Create SLA policies to set response and resolution time targets."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Priority</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">
                  First Response (hrs)
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">
                  Resolution (hrs)
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Business Hours</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Default</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{policy.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                      {policy.priority.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {policy.firstResponseHours}h
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {policy.resolutionHours}h
                  </td>
                  <td className="px-4 py-3 text-center">
                    {policy.businessHoursOnly ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {policy.isDefault ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        Default
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        policy.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
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
