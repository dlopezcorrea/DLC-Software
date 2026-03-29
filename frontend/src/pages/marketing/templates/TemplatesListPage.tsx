import { useQuery } from '@tanstack/react-query';
import { FileText, Plus } from 'lucide-react';
import { apiClient } from '@/api/client';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/utils/formatters';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  previewText?: string;
  isActive: boolean;
  createdAt: string;
}

export default function TemplatesListPage() {
  const { data: templates, isLoading, isError } = useQuery<EmailTemplate[]>({
    queryKey: ['email-templates'],
    queryFn: () => apiClient.get('/marketing/templates').then((r) => r.data.data),
  });

  return (
    <div>
      <PageHeader
        title="Email Templates"
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Template
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-600 text-sm">Failed to load templates.</div>
      ) : !templates || templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates yet"
          description="Create reusable email templates for your campaigns."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Preview Text</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Active</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{template.name}</td>
                  <td className="px-4 py-3 text-slate-700">{template.subject}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                    {template.previewText ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        template.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(template.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
