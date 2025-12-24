import { DecisionType } from '@/types/guard';
import { DECISION_TYPE_LABELS, DECISION_TYPE_DESCRIPTIONS } from '@/lib/metricRegistry';
import { cn } from '@/lib/utils';
import { TrendingUp, DollarSign, Megaphone, Settings, Package, LucideIcon } from 'lucide-react';

interface DecisionSelectorProps {
  selected: DecisionType | null;
  onSelect: (decision: DecisionType) => void;
}

const DECISION_ICONS: Record<DecisionType, LucideIcon> = {
  growth: TrendingUp,
  pricing: DollarSign,
  marketing: Megaphone,
  operations: Settings,
  product: Package,
};

export function DecisionSelector({ selected, onSelect }: DecisionSelectorProps) {
  const decisions: DecisionType[] = ['growth', 'pricing', 'marketing', 'operations', 'product'];
  
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Step 1: Select Decision Type
      </div>
      <div className="space-y-2">
        {decisions.map((decision) => {
          const Icon = DECISION_ICONS[decision];
          const isSelected = selected === decision;
          
          return (
            <button
              key={decision}
              type="button"
              onClick={() => onSelect(decision)}
              className={cn(
                'w-full p-3 rounded-lg border text-left transition-all',
                'hover:border-primary/50',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card/50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-1.5 rounded',
                  isSelected ? 'bg-primary/20' : 'bg-muted/50'
                )}>
                  <Icon size={14} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {DECISION_TYPE_LABELS[decision]}
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-0.5">
                    {DECISION_TYPE_DESCRIPTIONS[decision]}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
