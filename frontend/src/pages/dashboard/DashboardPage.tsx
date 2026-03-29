import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import MetricCard from '@/components/common/MetricCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/formatters';
import { Users, TrendingUp, LifeBuoy, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const { data: stats, isLoading } = useQuery({
    queryKey: ['org-stats'],
    queryFn: () => apiClient.get('/organizations/current/stats').then(r => r.data.data),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName ?? 'there'}!
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's an overview of your CRM</p>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Contacts"
            value={stats?.contacts ?? 0}
            icon={Users}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
            subValue="Active contacts"
          />
          <MetricCard
            title="Open Opportunities"
            value={stats?.openOpportunities ?? 0}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBg="bg-green-50"
            subValue="Deals in pipeline"
          />
          <MetricCard
            title="Open Tickets"
            value={stats?.openTickets ?? 0}
            icon={LifeBuoy}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
            subValue="Awaiting resolution"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            subValue="From paid invoices"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Contact', href: '/contacts' },
              { label: 'New Lead', href: '/sales/leads' },
              { label: 'New Ticket', href: '/support/tickets' },
              { label: 'New Invoice', href: '/finance/invoices' },
            ].map(link => (
              <a key={link.href} href={link.href}
                className="flex items-center justify-center p-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">System Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Contacts', value: stats?.contacts ?? 0 },
              { label: 'Accounts', value: stats?.accounts ?? 0 },
              { label: 'Open Opportunities', value: stats?.openOpportunities ?? 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
