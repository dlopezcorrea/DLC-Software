import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CAMPAIGN_STATUS_LABELS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';

interface CampaignDetail {
  id: string;
  name: string;
  type: string;
  status: string;
  fromEmail?: string;
  subject?: string;
  scheduledAt?: string;
  createdAt: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount?: number;
  openCount: number;
  clickCount: number;
  bounceCount?: number;
  unsubscribeCount?: number;
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: campaign, isLoading, isError } = useQuery<CampaignDetail>({
    queryKey: ['campaigns', id],
    queryFn: () =>
      apiClient.get(`/marketing/campaigns/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError || !campaign) {
    return (
      <div className="text-center py-12 text-red-600 text-sm">
        Failed to load campaign details.
      </div>
    );
  }

  const openRate =
    campaign.sentCount > 0
      ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1)
      : '0.0';
  const clickRate =
    campaign.sentCount > 0
      ? ((campaign.clickCount / campaign.sentCount) * 100).toFixed(1)
      : '0.0';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/marketing/campaigns"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
          <StatusBadge status={campaign.status} labelMap={CAMPAIGN_STATUS_LABELS} />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Type</p>
          <p className="text-sm font-semibold text-slate-900 capitalize">{campaign.type.toLowerCase()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">From Email</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{campaign.fromEmail ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Subject</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{campaign.subject ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Scheduled At</p>
          <p className="text-sm font-semibold text-slate-900">
            {campaign.scheduledAt ? formatDate(campaign.scheduledAt) : '—'}
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Recipients" value={campaign.totalRecipients.toLocaleString()} />
        <StatCard label="Sent" value={campaign.sentCount.toLocaleString()} />
        <StatCard
          label="Delivered"
          value={(campaign.deliveredCount ?? 0).toLocaleString()}
        />
        <StatCard
          label="Opened"
          value={campaign.openCount.toLocaleString()}
          sub={`${openRate}% open rate`}
        />
        <StatCard
          label="Clicked"
          value={campaign.clickCount.toLocaleString()}
          sub={`${clickRate}% click rate`}
        />
        <StatCard
          label="Bounced"
          value={(campaign.bounceCount ?? 0).toLocaleString()}
        />
        <StatCard
          label="Unsubscribed"
          value={(campaign.unsubscribeCount ?? 0).toLocaleString()}
        />
      </div>
    </div>
  );
}
