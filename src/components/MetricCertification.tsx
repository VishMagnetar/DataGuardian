import { MetricCertification as CertificationType, DecisionType } from '@/types/guard';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface MetricCertificationProps {
  certification: CertificationType;
  metricName: string;
}

const DECISION_LABELS: Record<DecisionType, string> = {
  growth: 'Growth',
  pricing: 'Pricing',
  marketing: 'Marketing',
  operations: 'Operations',
  product: 'Product',
};

export function MetricCertificationBadge({ certification, metricName }: MetricCertificationProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wide">
        Metric Certification
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {certification.certifiedFor.map(decision => (
          <span 
            key={decision}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-success/10 text-success border border-success/20"
          >
            <CheckCircle size={10} />
            {DECISION_LABELS[decision]}
          </span>
        ))}
        {certification.unsafeFor.map(decision => (
          <span 
            key={decision}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-destructive/10 text-destructive/70 border border-destructive/20"
          >
            <XCircle size={10} />
            {DECISION_LABELS[decision]}
          </span>
        ))}
      </div>
      
      {certification.warnings.length > 0 && (
        <div className="space-y-1">
          {certification.warnings.map((warning, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-warning">
              <AlertCircle size={10} />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
