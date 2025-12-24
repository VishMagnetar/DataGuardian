export type DecisionStatus = 'BLOCK' | 'WARN' | 'ALLOW' | 'OVERRIDDEN';

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';

export type DecisionType = 'growth' | 'pricing' | 'marketing' | 'operations' | 'product';

export interface GuardRule {
  id: string;
  name: string;
  category: 'data_integrity' | 'sample_size' | 'bias' | 'metric_misuse';
  status: 'pass' | 'fail' | 'warn';
  reason?: string;
  weight: number;
}

export interface MetricContext {
  metricName: string;
  timeRange: { start: Date; end: Date };
  comparisonPeriod?: { start: Date; end: Date };
  segmentLevel?: string;
  decisionType: DecisionType;
  sampleSize: number;
  dataLastUpdated: Date;
}

export interface GuardResult {
  status: DecisionStatus;
  confidence: number;
  rules: GuardRule[];
  explanation: string;
  suggestedAction: string;
  timestamp: Date;
  riskSummary?: RiskSummary;
  metricCertification?: MetricCertification;
}

// Full audit lineage record - IMMUTABLE after creation
export type OutcomeStatus = 'Positive' | 'Neutral' | 'Negative' | 'Unknown';

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  category: GuardRule['category'];
  status: 'pass' | 'warn' | 'fail';
  reason?: string;
  weight: number;
  weightContribution: number; // actual contribution to confidence
}

export interface AuditRecord {
  // Identity
  decisionId: string;
  timestamp: Date;
  
  // Decision context
  decisionType: DecisionType;
  metricName: string;
  
  // Input context - complete capture
  inputContext: {
    timeRange: { start: Date; end: Date };
    comparisonPeriod?: { start: Date; end: Date };
    segmentLevel?: string;
    sampleSize: number;
    dataLastUpdatedAt: Date;
  };
  
  // Guard evaluation - full lineage
  guardEvaluation: {
    triggeredRules: string[]; // rule IDs that didn't pass
    ruleResults: RuleResult[];
    totalRulesEvaluated: number;
  };
  
  // Decision state - before and after
  decisionState: {
    originalStatus: DecisionStatus;
    originalConfidence: number;
    finalStatus: DecisionStatus;
    finalConfidence: number;
  };
  
  // Override tracking
  override: {
    overrideUsed: boolean;
    overrideReason: string | null;
    overrideTimestamp?: Date;
  };
  
  // Outcome tracking - can be updated later
  outcomeTracking: {
    outcome: OutcomeStatus;
    outcomeNotes?: string;
    outcomeUpdatedAt?: Date;
  };
}

// Simplified view for table display
export interface DecisionLog {
  id: string;
  metric: string;
  status: DecisionStatus;
  confidence: number;
  timestamp: Date;
  decisionType: DecisionType;
  // Full audit record reference
  auditRecord: AuditRecord;
}

// Metric Registry - defines allowed metrics per decision type
export interface MetricDefinition {
  id: string;
  name: string;
  allowedDecisions: DecisionType[];
  minSampleSize: number;
  refreshRateHours: number;
  counterMetrics: string[];
  category: 'revenue' | 'engagement' | 'conversion' | 'retention' | 'cost' | 'efficiency';
}

// Risk summary for "Why You Should Care" panel
export interface RiskSummary {
  financialRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidenceBand: { min: number; max: number };
  potentialConsequences: string[];
  historicalContext?: string;
}

// Metric certification system
export interface MetricCertification {
  certifiedFor: DecisionType[];
  unsafeFor: DecisionType[];
  certificationScore: number;
  warnings: string[];
}
