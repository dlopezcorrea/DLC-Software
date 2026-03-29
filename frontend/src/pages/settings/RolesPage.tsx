import { useQuery } from '@tanstack/react-query';
import { Plus, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/api/client';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: string[] | { id: string; name: string }[];
}

export default function RolesPage() {
  const { data: roles, isLoading, isError } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get('/org/roles').then((r) => r.data.data),
  });

  const rolesList = roles ?? [];

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Manage permission roles for your team"
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Role
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-600 text-sm">Failed to load roles.</div>
      ) : rolesList.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No roles defined"
          description="Create roles to manage team permissions."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Role Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">System</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Permissions</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rolesList.map((role) => {
                const permCount = Array.isArray(role.permissions)
                  ? role.permissions.length
                  : 0;
                return (
                  <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{role.name}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {role.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {role.isSystem ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          System
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {permCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!role.isSystem ? (
                        <button className="text-indigo-600 hover:text-indigo-700 text-xs font-medium transition-colors">
                          Edit
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
