import { RiskSummary } from '@/types/guard';
import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingDown, Info } from 'lucide-react';

interface RiskPanelProps {
  risk: RiskSummary;
  sampleSize: number;
}

const RISK_LABELS: Record<RiskSummary['financialRiskLevel'], { label: string; color: string }> = {
  low: { label: 'LOW RISK', color: 'text-success' },
  medium: { label: 'MEDIUM RISK', color: 'text-warning' },
  high: { label: 'HIGH RISK', color: 'text-destructive' },
  critical: { label: 'CRITICAL RISK', color: 'text-destructive' },
};

export function RiskPanel({ risk, sampleSize }: RiskPanelProps) {
  const riskInfo = RISK_LABELS[risk.financialRiskLevel];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className={riskInfo.color} />
        <span className={cn('text-sm font-mono font-bold', riskInfo.color)}>
          {riskInfo.label}
        </span>
      </div>
      
      {/* Confidence Band */}
      <div className="p-3 rounded-lg bg-muted/30 border border-border">
        <div className="text-xs text-muted-foreground mb-2">Confidence Range</div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-foreground">
            {Math.round(risk.confidenceBand.min * 100)}%
          </span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary/60"
              style={{ 
                marginLeft: `${risk.confidenceBand.min * 100}%`,
                width: `${(risk.confidenceBand.max - risk.confidenceBand.min) * 100}%`
              }}
            />
          </div>
          <span className="font-mono text-sm text-foreground">
            {Math.round(risk.confidenceBand.max * 100)}%
          </span>
        </div>
      </div>
      
      {/* Consequences */}
      {risk.potentialConsequences.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            What could go wrong
          </div>
          <ul className="space-y-1.5">
            {risk.potentialConsequences.map((consequence, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <TrendingDown size={14} className="text-destructive/70 mt-0.5 shrink-0" />
                <span>{consequence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Historical Context */}
      {risk.historicalContext && (
        <div className="flex items-start gap-2 p-2 rounded bg-warning/5 border border-warning/20">
          <Info size={14} className="text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {risk.historicalContext}
          </p>
        </div>
      )}
    </div>
  );
}
