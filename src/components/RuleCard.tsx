import { cn } from '@/lib/utils';
import { GuardRule } from '@/types/guard';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface RuleCardProps {
  rule: GuardRule;
  index: number;
}

export function RuleCard({ rule, index }: RuleCardProps) {
  const statusConfig = {
    pass: {
      icon: CheckCircle2,
      bg: 'bg-success/10',
      border: 'border-success/20',
      iconColor: 'text-success',
    },
    warn: {
      icon: AlertTriangle,
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      iconColor: 'text-warning',
    },
    fail: {
      icon: XCircle,
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
      iconColor: 'text-destructive',
    },
  };

  const config = statusConfig[rule.status];
  const Icon = config.icon;

  const categoryLabels = {
    data_integrity: 'Data Integrity',
    sample_size: 'Sample Size',
    bias: 'Bias Detection',
    metric_misuse: 'Metric Validity',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all duration-300',
        'animate-fade-in',
        config.bg,
        config.border
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', config.iconColor)}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">
              {rule.id}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {categoryLabels[rule.category]}
            </span>
          </div>
          <h4 className="font-medium text-foreground">{rule.name}</h4>
          {rule.reason && (
            <p className="text-sm text-muted-foreground mt-1">{rule.reason}</p>
          )}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {Math.round(rule.weight * 100)}%
        </span>
      </div>
    </div>
  );
}
