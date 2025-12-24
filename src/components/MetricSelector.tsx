import { DecisionType, MetricDefinition } from '@/types/guard';
import { getMetricsForDecision } from '@/lib/metricRegistry';
import { cn } from '@/lib/utils';
import { Check, XCircle, AlertTriangle } from 'lucide-react';

interface MetricSelectorProps {
  decisionType: DecisionType;
  selected: string | null;
  onSelect: (metricId: string) => void;
}

export function MetricSelector({ decisionType, selected, onSelect }: MetricSelectorProps) {
  const allowedMetrics = getMetricsForDecision(decisionType);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Step 2: Select Metric
        </div>
        <div className="text-xs text-success flex items-center gap-1">
          <Check size={12} />
          <span>Certified for this decision</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {allowedMetrics.map((metric) => {
          const isSelected = selected === metric.id;
          
          return (
            <button
              key={metric.id}
              type="button"
              onClick={() => onSelect(metric.id)}
              className={cn(
                'p-2.5 rounded-lg border text-left transition-all',
                'hover:border-primary/50',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card/50'
              )}
            >
              <div className="text-sm font-medium text-foreground">
                {metric.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {metric.minSampleSize}+ samples
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="flex items-start gap-2 p-2 rounded bg-muted/30 border border-border">
        <XCircle size={14} className="text-destructive mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Only metrics certified for {decisionType} decisions are shown. Non-certified metrics will be hard blocked.
        </p>
      </div>
    </div>
  );
}
