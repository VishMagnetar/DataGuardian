import { useState } from 'react';
import { MetricRequestForm } from '@/components/MetricRequestForm';
import { DecisionOutput } from '@/components/DecisionOutput';
import { DecisionLogTable } from '@/components/DecisionLog';
import { runGuardEngine } from '@/lib/guardEngine';
import { MetricContext, GuardResult, DecisionLog, AuditRecord, RuleResult } from '@/types/guard';
import { Shield } from 'lucide-react';

// Create complete audit record from context and result
function createAuditRecord(
  context: MetricContext,
  result: GuardResult
): AuditRecord {
  const ruleResults: RuleResult[] = result.rules.map(rule => {
    const score = rule.status === 'pass' ? 1 : rule.status === 'warn' ? 0.5 : 0;
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      status: rule.status,
      reason: rule.reason,
      weight: rule.weight,
      weightContribution: rule.weight * score,
    };
  });

  const triggeredRules = result.rules
    .filter(r => r.status !== 'pass')
    .map(r => r.id);

  return {
    decisionId: crypto.randomUUID(),
    timestamp: new Date(),
    decisionType: context.decisionType,
    metricName: context.metricName,
    inputContext: {
      timeRange: context.timeRange,
      comparisonPeriod: context.comparisonPeriod,
      segmentLevel: context.segmentLevel,
      sampleSize: context.sampleSize,
      dataLastUpdatedAt: context.dataLastUpdated,
    },
    guardEvaluation: {
      triggeredRules,
      ruleResults,
      totalRulesEvaluated: result.rules.length,
    },
    decisionState: {
      originalStatus: result.status,
      originalConfidence: result.confidence,
      finalStatus: result.status,
      finalConfidence: result.confidence,
    },
    override: {
      overrideUsed: false,
      overrideReason: null,
    },
    outcomeTracking: {
      outcome: 'Unknown',
    },
  };
}

const Index = () => {
  const [result, setResult] = useState<GuardResult | null>(null);
  const [currentContext, setCurrentContext] = useState<MetricContext | null>(null);
  const [currentAuditRecord, setCurrentAuditRecord] = useState<AuditRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<DecisionLog[]>([]);

  const handleSubmit = async (context: MetricContext) => {
    setIsProcessing(true);
    setResult(null);
    setCurrentContext(context);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 600));

    const guardResult = runGuardEngine(context);
    setResult(guardResult);

    // Create IMMUTABLE audit record immediately
    const auditRecord = createAuditRecord(context, guardResult);
    setCurrentAuditRecord(auditRecord);

    // Create decision log entry with full audit lineage
    const newLog: DecisionLog = {
      id: auditRecord.decisionId,
      metric: context.metricName,
      status: guardResult.status,
      confidence: guardResult.confidence,
      timestamp: auditRecord.timestamp,
      decisionType: context.decisionType,
      auditRecord: auditRecord,
    };

    // Append-only log
    setLogs((prev) => [newLog, ...prev].slice(0, 100));

    setIsProcessing(false);
  };

  // Handle override: ONLY for WARN status
  const handleOverride = (justification: string, adjustedConfidence: number, failedRules: string[]) => {
    if (!result || !currentContext || !currentAuditRecord) return;
    if (result.status !== 'WARN') return; // Safety check

    // Lineage rule: final_confidence must NEVER be higher than original_confidence
    const safeConfidence = Math.min(adjustedConfidence, currentAuditRecord.decisionState.originalConfidence);

    // Create NEW audit record for override (append-only, original unchanged)
    const overrideAuditRecord: AuditRecord = {
      ...currentAuditRecord,
      decisionId: crypto.randomUUID(), // New unique ID
      timestamp: new Date(),
      decisionState: {
        ...currentAuditRecord.decisionState,
        finalStatus: 'OVERRIDDEN',
        finalConfidence: safeConfidence,
      },
      override: {
        overrideUsed: true,
        overrideReason: justification,
        overrideTimestamp: new Date(),
      },
    };

    // Create override log entry
    const overrideLog: DecisionLog = {
      id: overrideAuditRecord.decisionId,
      metric: currentContext.metricName,
      status: 'OVERRIDDEN',
      confidence: safeConfidence,
      timestamp: overrideAuditRecord.timestamp,
      decisionType: currentContext.decisionType,
      auditRecord: overrideAuditRecord,
    };

    // Append to log (immutable, append-only)
    setLogs((prev) => [overrideLog, ...prev].slice(0, 100));

    // Update result to reflect override
    setResult({
      ...result,
      status: 'OVERRIDDEN',
      confidence: safeConfidence,
      explanation: `Warning overridden. Confidence reduced from ${Math.round(result.confidence * 100)}% to ${Math.round(safeConfidence * 100)}% (capped at 45%).`,
      suggestedAction: 'Decision logged for permanent audit. Risk accepted by user.',
    });
  };

  // Handle outcome update for existing log entries
  const handleOutcomeUpdate = (logId: string, outcome: 'Positive' | 'Neutral' | 'Negative', notes?: string) => {
    setLogs((prev) => prev.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          auditRecord: {
            ...log.auditRecord,
            outcomeTracking: {
              outcome,
              outcomeNotes: notes,
              outcomeUpdatedAt: new Date(),
            },
          },
        };
      }
      return log;
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Decision Guard</span>
            <span className="text-xs text-muted-foreground ml-2">Analytics Validation Engine</span>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Panel - Request Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <MetricRequestForm onSubmit={handleSubmit} isProcessing={isProcessing} />
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-3 space-y-8">
            {/* Decision Output */}
            <div className="min-h-[300px]">
              {result && currentContext ? (
                <DecisionOutput
                  result={result}
                  metricName={currentContext.metricName}
                  sampleSize={currentContext.sampleSize}
                  onOverride={result.status === 'WARN' ? handleOverride : undefined}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-lg">
                  <Shield size={24} className="text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a decision type and metric to run analysis
                  </p>
                </div>
              )}
            </div>

            {/* Decision Log */}
            {logs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Decision Audit Log (Immutable)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {logs.length} entries
                  </span>
                </div>
                <DecisionLogTable logs={logs} onOutcomeUpdate={handleOutcomeUpdate} />
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container max-w-5xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Built by ME(Vishal Mankar) to prevent decisions based on misleading data · 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
