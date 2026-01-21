import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface HealthBadgeProps {
  score: 'healthy' | 'warning' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const config = {
  healthy: {
    icon: CheckCircle,
    label: 'Healthy',
    colors: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    colors: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconColor: 'text-yellow-600',
  },
  critical: {
    icon: XCircle,
    label: 'Critical',
    colors: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600',
  },
};

const sizes = {
  sm: { badge: 'px-2 py-0.5 text-xs', icon: 'w-3 h-3' },
  md: { badge: 'px-3 py-1 text-sm', icon: 'w-4 h-4' },
  lg: { badge: 'px-4 py-2 text-base', icon: 'w-5 h-5' },
};

export function HealthBadge({ score, size = 'md', showLabel = true }: HealthBadgeProps) {
  const { icon: Icon, label, colors, iconColor } = config[score];
  const sizeConfig = sizes[size];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        colors,
        sizeConfig.badge
      )}
    >
      <Icon className={clsx(sizeConfig.icon, iconColor)} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
