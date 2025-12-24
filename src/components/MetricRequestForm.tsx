import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DecisionType, MetricContext } from '@/types/guard';
import { DecisionSelector } from './DecisionSelector';
import { MetricSelector } from './MetricSelector';
import { getMetricById } from '@/lib/metricRegistry';
import { Scan, ChevronRight } from 'lucide-react';

interface MetricRequestFormProps {
  onSubmit: (context: MetricContext) => void;
  isProcessing: boolean;
}

export function MetricRequestForm({ onSubmit, isProcessing }: MetricRequestFormProps) {
  const [decisionType, setDecisionType] = useState<DecisionType | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [sampleSize, setSampleSize] = useState('2500');
  const [hoursAgo, setHoursAgo] = useState('12');

  const handleDecisionSelect = (decision: DecisionType) => {
    setDecisionType(decision);
    setSelectedMetric(null); // Reset metric when decision changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decisionType || !selectedMetric) return;

    const metric = getMetricById(selectedMetric);
    if (!metric) return;

    const now = new Date();
    const dataLastUpdated = new Date(now.getTime() - parseInt(hoursAgo) * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const context: MetricContext = {
      metricName: selectedMetric,
      timeRange: { start: thirtyDaysAgo, end: now },
      comparisonPeriod: { start: sixtyDaysAgo, end: thirtyDaysAgo },
      decisionType,
      sampleSize: parseInt(sampleSize),
      dataLastUpdated,
    };

    onSubmit(context);
  };

  const canSubmit = decisionType && selectedMetric && !isProcessing;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Decision Type */}
      <DecisionSelector 
        selected={decisionType} 
        onSelect={handleDecisionSelect} 
      />

      {/* Step 2: Metric Selection (only shown after decision selected) */}
      {decisionType && (
        <div className="animate-fade-in">
          <MetricSelector
            decisionType={decisionType}
            selected={selectedMetric}
            onSelect={setSelectedMetric}
          />
        </div>
      )}

      {/* Step 3: Parameters (only shown after metric selected) */}
      {selectedMetric && (
        <div className="animate-fade-in space-y-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Step 3: Parameters
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sample" className="text-xs text-muted-foreground">
                Sample Size
              </Label>
              <Input
                id="sample"
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                className="bg-muted/30 border-border font-mono text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="freshness" className="text-xs text-muted-foreground">
                Data Age (hours)
              </Label>
              <Input
                id="freshness"
                type="number"
                value={hoursAgo}
                onChange={(e) => setHoursAgo(e.target.value)}
                className="bg-muted/30 border-border font-mono text-sm h-9"
              />
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
      >
        {isProcessing ? (
          <>
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Running Guard Engine...
          </>
        ) : (
          <>
            <Scan size={16} />
            Run Guard Analysis
            <ChevronRight size={16} />
          </>
        )}
      </Button>
    </form>
  );
}
