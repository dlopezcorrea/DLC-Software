import { cn } from '@/utils/cn';

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  labelMap?: Record<string, string>;
}

const defaultColorMap: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
  OPEN: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  RESOLVED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  WAITING_ON_CUSTOMER: 'bg-orange-100 text-orange-700',
  DRAFT: 'bg-slate-100 text-slate-700',
  SENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
  RUNNING: 'bg-indigo-100 text-indigo-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  CONVERTED: 'bg-purple-100 text-purple-700',
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-indigo-100 text-indigo-700',
  QUALIFIED: 'bg-green-100 text-green-700',
  UNQUALIFIED: 'bg-slate-100 text-slate-600',
  EXPIRED: 'bg-orange-100 text-orange-700',
  TERMINATED: 'bg-red-100 text-red-700',
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status, colorMap, labelMap }: StatusBadgeProps) {
  const colors = colorMap ?? defaultColorMap;
  const color = colors[status] ?? 'bg-slate-100 text-slate-600';
  const label = labelMap?.[status] ?? status.replace(/_/g, ' ');

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', color)}>
      {label}
    </span>
  );
}
