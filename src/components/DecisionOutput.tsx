import { useState } from 'react';
import { GuardResult } from '@/types/guard';
import { StatusBadge } from './StatusBadge';
import { ConfidenceGauge } from './ConfidenceGauge';
import { RuleCard } from './RuleCard';
import { RiskPanel } from './RiskPanel';
import { MetricCertificationBadge } from './MetricCertification';
import { OverrideModal } from './OverrideModal';
import { applyOverridePenalty } from '@/lib/guardEngine';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldOff, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecisionOutputProps {
  result: GuardResult;
  metricName: string;
  sampleSize: number;
  onOverride?: (justification: string, adjustedConfidence: number, failedRules: string[]) => void;
}

export function DecisionOutput({ result, metricName, sampleSize, onOverride }: DecisionOutputProps) {
  const [showRules, setShowRules] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  
  // Override ONLY allowed for WARN status
  const canOverride = result.status === 'WARN' && onOverride;
  const isOverridden = result.status === 'OVERRIDDEN';
  const isBlocked = result.status === 'BLOCK';
  
  const warnRules = result.rules.filter(r => r.status === 'warn');
  const adjustedConfidence = applyOverridePenalty(result.confidence);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overridden Banner */}
      {isOverridden && (
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3">
          <ShieldOff size={18} className="text-warning mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-warning">OVERRIDDEN — Risk Accepted</div>
            <p className="text-xs text-muted-foreground mt-1">
              This decision proceeded after overriding system warnings. Action logged permanently.
            </p>
          </div>
        </div>
      )}

      {/* Status Header */}
      <div className={cn(
        'p-6 rounded-lg border',
        result.status === 'BLOCK' && 'bg-destructive/5 border-destructive/30',
        result.status === 'WARN' && 'bg-warning/5 border-warning/30',
        result.status === 'ALLOW' && 'bg-success/5 border-success/30',
        result.status === 'OVERRIDDEN' && 'bg-warning/5 border-warning/40'
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={result.status} size="lg" />
            <div>
              <p className="text-sm text-foreground">{result.explanation}</p>
              <p className="text-xs text-muted-foreground mt-1">{result.suggestedAction}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <ConfidenceGauge confidence={result.confidence} size="sm" showLabel={false} />
            <div className="font-mono text-sm text-muted-foreground mt-1">
              {Math.round(result.confidence * 100)}%
            </div>
          </div>
        </div>
        
        {/* Override Button (ONLY for WARN) */}
        {canOverride && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowOverrideModal(true)}
              className="text-warning border-warning/30 hover:bg-warning/10"
            >
              <AlertTriangle size={14} className="mr-2" />
              Override Warning (Requires Justification)
            </Button>
            <span className="text-xs text-muted-foreground ml-3">
              Confidence capped at {Math.round(adjustedConfidence * 100)}%
            </span>
          </div>
        )}

        {/* BLOCK cannot be overridden */}
        {isBlocked && (
          <div className="mt-4 pt-4 border-t border-destructive/20">
            <div className="flex items-center gap-2 text-xs text-destructive">
              <Ban size={14} />
              <span>This decision cannot be overridden.</span>
            </div>
          </div>
        )}
      </div>

      {/* Why You Should Care Panel */}
      {result.riskSummary && (
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Why This Matters
          </div>
          <RiskPanel risk={result.riskSummary} sampleSize={sampleSize} />
        </div>
      )}

      {/* Metric Certification */}
      {result.metricCertification && (
        <div className="p-4 rounded-lg bg-card border border-border">
          <MetricCertificationBadge 
            certification={result.metricCertification} 
            metricName={metricName} 
          />
        </div>
      )}

      {/* Collapsible Rules Detail */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button 
          onClick={() => setShowRules(!showRules)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <span>Guard Rule Details ({result.rules.length} rules)</span>
          {showRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {showRules && (
          <div className="p-4 pt-0 space-y-2 animate-fade-in">
            {result.rules.map((rule, index) => (
              <RuleCard key={rule.id} rule={rule} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Override Modal */}
      {showOverrideModal && warnRules.length > 0 && (
        <OverrideModal
          failedRules={warnRules.map(r => ({ name: r.name, reason: r.reason }))}
          originalConfidence={result.confidence}
          adjustedConfidence={adjustedConfidence}
          onConfirm={(justification) => {
            onOverride?.(justification, adjustedConfidence, warnRules.map(r => r.name));
            setShowOverrideModal(false);
          }}
          onCancel={() => setShowOverrideModal(false)}
        />
      )}
    </div>
  );
}
