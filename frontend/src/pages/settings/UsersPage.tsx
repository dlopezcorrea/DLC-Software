import { useQuery } from '@tanstack/react-query';
import { UserPlus, Users } from 'lucide-react';
import { apiClient } from '@/api/client';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatRelativeTime } from '@/utils/formatters';

interface OrgUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  role?: { name: string };
  lastLoginAt?: string;
  avatarUrl?: string;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-700';
    case 'INACTIVE':
      return 'bg-slate-100 text-slate-500';
    case 'INVITED':
      return 'bg-yellow-100 text-yellow-700';
    case 'SUSPENDED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export default function UsersPage() {
  const { data: users, isLoading, isError } = useQuery<OrgUser[]>({
    queryKey: ['org-users'],
    queryFn: () => apiClient.get('/org/users').then((r) => r.data.data),
  });

  const usersList = users ?? [];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage team members and their access"
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <UserPlus className="w-4 h-4" />
            Invite New User
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-600 text-sm">Failed to load users.</div>
      ) : usersList.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Invite team members to get started."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((user) => {
                const initials = getInitials(user.firstName, user.lastName);
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={initials}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                        )}
                        <span className="font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {user.role?.name ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {user.lastLoginAt ? (
                        <span title={formatDate(user.lastLoginAt)}>
                          {formatRelativeTime(user.lastLoginAt)}
                        </span>
                      ) : (
                        <span className="text-slate-300">Never</span>
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
