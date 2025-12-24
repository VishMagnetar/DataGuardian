import { cn } from '@/lib/utils';

interface ConfidenceGaugeProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ConfidenceGauge({ confidence, size = 'md', showLabel = true }: ConfidenceGaugeProps) {
  const percentage = Math.round(confidence * 100);
  
  const sizeClasses = {
    sm: { container: 'h-16 w-16', text: 'text-lg', label: 'text-xs' },
    md: { container: 'h-24 w-24', text: 'text-2xl', label: 'text-xs' },
    lg: { container: 'h-32 w-32', text: 'text-3xl', label: 'text-sm' },
  };

  const getColor = () => {
    if (confidence >= 0.7) return 'text-success';
    if (confidence >= 0.4) return 'text-warning';
    return 'text-destructive';
  };

  const getStrokeColor = () => {
    if (confidence >= 0.7) return 'stroke-success';
    if (confidence >= 0.4) return 'stroke-warning';
    return 'stroke-destructive';
  };

  const strokeDasharray = 2 * Math.PI * 40;
  const strokeDashoffset = strokeDasharray * (1 - confidence);

  return (
    <div className={cn('relative', sizeClasses[size].container)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn('transition-all duration-700 ease-out', getStrokeColor())}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-mono font-bold', sizeClasses[size].text, getColor())}>
          {percentage}%
        </span>
        {showLabel && (
          <span className={cn('text-muted-foreground', sizeClasses[size].label)}>
            confidence
          </span>
        )}
      </div>
    </div>
  );
}
