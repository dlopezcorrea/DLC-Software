import { type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    label?: string;
  };
  loading?: boolean;
}

export default function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
  trend,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="h-7 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-200 rounded w-1/3" />
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
          {subValue && (
            <p className="text-sm text-slate-500 truncate">{subValue}</p>
          )}
          {trend !== undefined && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}%{trend.label ? ` ${trend.label}` : ' vs last month'}
            </p>
          )}
        </div>
        <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ml-4', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
