import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useCampaigns } from '@/api/campaigns.api';
import { CAMPAIGN_STATUS_LABELS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Running', value: 'RUNNING' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function CampaignsListPage() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const params = selectedStatus ? { status: selectedStatus } : undefined;
  const { data: campaigns, isLoading, isError } = useCampaigns(params);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        action={
          <Link
            to="/marketing/campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        }
      />

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              selectedStatus === tab.value
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-600 text-sm">Failed to load campaigns.</div>
      ) : !campaigns || campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns found"
          description="Create your first campaign to start reaching your audience."
          action={
            <Link
              to="/marketing/campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Sent / Opens / Clicks</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Scheduled At</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/marketing/campaigns/${campaign.id}`}
                      className="font-medium text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {campaign.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{campaign.type.toLowerCase()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={campaign.status} labelMap={CAMPAIGN_STATUS_LABELS} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {campaign.sentCount.toLocaleString()} / {campaign.openCount.toLocaleString()} / {campaign.clickCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {campaign.scheduledAt ? formatDate(campaign.scheduledAt) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(campaign.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
