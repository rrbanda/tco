import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  status?: 'healthy' | 'warning' | 'critical' | 'info';
  className?: string;
}

const statusColors = {
  healthy: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  critical: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
};

const statusIconColors = {
  healthy: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  critical: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-600',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status,
  className,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border p-6 transition-all duration-200 hover:shadow-md',
        status ? statusColors[status] : 'border-slate-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          )}
          {trend && (
            <p
              className={clsx(
                'mt-2 text-sm font-medium',
                trend.positive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              status ? statusIconColors[status] : 'bg-primary-50 text-primary-600'
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
