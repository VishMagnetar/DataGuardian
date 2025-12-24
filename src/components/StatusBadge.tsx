import { cn } from '@/lib/utils';
import { DecisionStatus } from '@/types/guard';
import { ShieldAlert, ShieldCheck, ShieldX, ShieldOff } from 'lucide-react';

interface StatusBadgeProps {
  status: DecisionStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  };

  const statusConfig = {
    BLOCK: {
      bg: 'bg-destructive/20',
      text: 'text-destructive',
      border: 'border-destructive/30',
      glow: 'glow-destructive',
      Icon: ShieldX,
      label: 'BLOCKED',
    },
    WARN: {
      bg: 'bg-warning/20',
      text: 'text-warning',
      border: 'border-warning/30',
      glow: 'glow-warning',
      Icon: ShieldAlert,
      label: 'WARNING',
    },
    ALLOW: {
      bg: 'bg-success/20',
      text: 'text-success',
      border: 'border-success/30',
      glow: 'glow-success',
      Icon: ShieldCheck,
      label: 'ALLOWED',
    },
    OVERRIDDEN: {
      bg: 'bg-warning/30',
      text: 'text-warning',
      border: 'border-warning/50',
      glow: 'glow-warning',
      Icon: ShieldOff,
      label: 'OVERRIDDEN',
    },
  };

  const config = statusConfig[status];
  const Icon = config.Icon;

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold rounded-md border',
        'transition-all duration-200',
        sizeClasses[size],
        config.bg,
        config.text,
        config.border,
        size === 'lg' && config.glow
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
