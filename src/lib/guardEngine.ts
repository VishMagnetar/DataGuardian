import { GuardRule, MetricContext, GuardResult, DecisionStatus, RiskSummary } from '@/types/guard';
import { getMetricById, isMetricValidForDecision, getMetricCertification } from './metricRegistry';

const EXPECTED_UPDATE_HOURS = 24;
const MIN_SAMPLE_SIZE = 100;
const CONCENTRATION_THRESHOLD = 0.6;
const SEGMENT_DRIFT_THRESHOLD = 0.25;

export function runDataFreshnessRule(context: MetricContext): GuardRule {
  const hoursSinceUpdate = (Date.now() - context.dataLastUpdated.getTime()) / (1000 * 60 * 60);
  const metric = getMetricById(context.metricName.toLowerCase().replace(/\s+/g, ''));
  const expectedHours = metric?.refreshRateHours || EXPECTED_UPDATE_HOURS;
  const threshold = expectedHours * 1.5;
  
  const passed = hoursSinceUpdate <= threshold;
  
  return {
    id: 'A1',
    name: 'Data Freshness',
    category: 'data_integrity',
    status: passed ? 'pass' : 'fail',
    reason: passed ? undefined : `Data is ${Math.round(hoursSinceUpdate)}h old, exceeds ${threshold}h threshold`,
    weight: 0.3,
  };
}

export function runPartialDataRule(context: MetricContext, historicalAvg: number = 1000): GuardRule {
  const currentCount = context.sampleSize;
  const threshold = historicalAvg * 0.7;
  const passed = currentCount >= threshold;
  
  return {
    id: 'A2',
    name: 'Partial Data Detection',
    category: 'data_integrity',
    status: passed ? 'pass' : 'fail',
    reason: passed ? undefined : `Record count ${currentCount} is below 70% of historical average (${historicalAvg})`,
    weight: 0.3,
  };
}

export function runMinSampleRule(context: MetricContext): GuardRule {
  const metric = getMetricById(context.metricName.toLowerCase().replace(/\s+/g, ''));
  const minSample = metric?.minSampleSize || MIN_SAMPLE_SIZE;
  const passed = context.sampleSize >= minSample;
  
  return {
    id: 'B1',
    name: 'Minimum Sample Threshold',
    category: 'sample_size',
    status: passed ? 'pass' : 'fail',
    reason: passed ? undefined : `Sample size ${context.sampleSize} is below minimum threshold of ${minSample}`,
    weight: 0.25,
  };
}

export function runComparisonValidityRule(context: MetricContext, comparisonSampleSize: number = 150): GuardRule {
  if (!context.comparisonPeriod) {
    return {
      id: 'B2',
      name: 'Comparison Validity',
      category: 'sample_size',
      status: 'pass',
      weight: 0.25,
    };
  }
  
  const passed = comparisonSampleSize >= MIN_SAMPLE_SIZE;
  
  return {
    id: 'B2',
    name: 'Comparison Validity',
    category: 'sample_size',
    status: passed ? 'pass' : 'warn',
    reason: passed ? undefined : `Comparison period sample size (${comparisonSampleSize}) may be insufficient`,
    weight: 0.25,
  };
}

export function runConcentrationRule(topContribution: number = 0.4): GuardRule {
  const passed = topContribution <= CONCENTRATION_THRESHOLD;
  
  return {
    id: 'C1',
    name: 'Contributor Concentration',
    category: 'bias',
    status: passed ? 'pass' : 'warn',
    reason: passed ? undefined : `Top 5 contributors account for ${Math.round(topContribution * 100)}% of metric value`,
    weight: 0.25,
  };
}

export function runSegmentDriftRule(segmentChanges: number[] = [0.1, 0.15]): GuardRule {
  const maxChange = Math.max(...segmentChanges);
  const passed = maxChange <= SEGMENT_DRIFT_THRESHOLD;
  
  return {
    id: 'C2',
    name: 'Segment Drift',
    category: 'bias',
    status: passed ? 'pass' : 'warn',
    reason: passed ? undefined : `Segment composition changed by ${Math.round(maxChange * 100)}% vs baseline`,
    weight: 0.25,
  };
}

export function runVanityMetricRule(metricTrend: number = 1, outcomeTrend: number = 1): GuardRule {
  const isVanity = metricTrend > 0 && outcomeTrend < 0;
  
  return {
    id: 'D1',
    name: 'Vanity Metric Detection',
    category: 'metric_misuse',
    status: isVanity ? 'warn' : 'pass',
    reason: isVanity ? 'Metric improved while business outcome declined' : undefined,
    weight: 0.2,
  };
}

// HARD BLOCK: Metric-Decision Mismatch
export function runMetricMismatchRule(context: MetricContext): GuardRule {
  const metricId = context.metricName.toLowerCase().replace(/\s+/g, '');
  const isValid = isMetricValidForDecision(metricId, context.decisionType);
  const metric = getMetricById(metricId);
  
  // Unknown metric gets a warning, known invalid metric gets a FAIL (hard block)
  if (!metric) {
    return {
      id: 'D2',
      name: 'Metric-Decision Match',
      category: 'metric_misuse',
      status: 'warn',
      reason: `Unknown metric "${context.metricName}" - cannot verify suitability for ${context.decisionType} decisions`,
      weight: 0.2,
    };
  }
  
  if (!isValid) {
    return {
      id: 'D2',
      name: 'Metric-Decision Match',
      category: 'metric_misuse',
      status: 'fail', // HARD BLOCK
      reason: `${context.metricName} is NOT certified for ${context.decisionType} decisions. Allowed: ${metric.allowedDecisions.join(', ')}`,
      weight: 0.2,
    };
  }
  
  return {
    id: 'D2',
    name: 'Metric-Decision Match',
    category: 'metric_misuse',
    status: 'pass',
    weight: 0.2,
  };
}

export function calculateConfidence(rules: GuardRule[]): number {
  let totalWeight = 0;
  let weightedScore = 0;
  
  rules.forEach(rule => {
    const score = rule.status === 'pass' ? 1 : rule.status === 'warn' ? 0.5 : 0;
    weightedScore += rule.weight * score;
    totalWeight += rule.weight;
  });
  
  return totalWeight > 0 ? weightedScore / totalWeight : 0;
}

export function determineStatus(rules: GuardRule[], confidence: number): DecisionStatus {
  const hasFailure = rules.some(r => r.status === 'fail');
  if (hasFailure) return 'BLOCK';
  
  const hasWarning = rules.some(r => r.status === 'warn');
  if (hasWarning || confidence < 0.7) return 'WARN';
  
  return 'ALLOW';
}

export function generateExplanation(status: DecisionStatus, rules: GuardRule[]): string {
  const failedRules = rules.filter(r => r.status === 'fail');
  const warnRules = rules.filter(r => r.status === 'warn');
  
  if (status === 'BLOCK') {
    return `Decision blocked: ${failedRules.map(r => r.reason).join('; ')}`;
  }
  
  if (status === 'WARN') {
    return `Proceed with caution: ${warnRules.map(r => r.reason).join('; ')}`;
  }
  
  return 'All guard checks passed. Data quality and statistical validity confirmed.';
}

export function generateSuggestedAction(status: DecisionStatus, rules: GuardRule[]): string {
  if (status === 'BLOCK') {
    const failedRules = rules.filter(r => r.status === 'fail');
    if (failedRules.some(r => r.category === 'metric_misuse')) {
      return 'Select a metric certified for this decision type.';
    }
    if (failedRules.some(r => r.category === 'data_integrity')) {
      return 'Wait for fresh data ingestion.';
    }
    if (failedRules.some(r => r.category === 'sample_size')) {
      return 'Collect more data or extend the time range.';
    }
  }
  
  if (status === 'WARN') {
    return 'Override requires written justification.';
  }
  
  return 'Proceed with confidence.';
}

// Generate risk summary for "Why You Should Care" panel
export function generateRiskSummary(context: MetricContext, rules: GuardRule[], confidence: number): RiskSummary {
  const failedCount = rules.filter(r => r.status === 'fail').length;
  const warnCount = rules.filter(r => r.status === 'warn').length;
  
  let financialRiskLevel: RiskSummary['financialRiskLevel'] = 'low';
  if (failedCount > 0) financialRiskLevel = 'critical';
  else if (warnCount > 1) financialRiskLevel = 'high';
  else if (warnCount === 1) financialRiskLevel = 'medium';
  
  const consequences: string[] = [];
  
  if (context.sampleSize < 100) {
    consequences.push('Trend may reverse with more data');
  }
  if (confidence < 0.5) {
    consequences.push('High probability of incorrect decision');
  }
  if (rules.some(r => r.id === 'C1' && r.status !== 'pass')) {
    consequences.push('Result driven by few large contributors');
  }
  if (rules.some(r => r.id === 'D2' && r.status !== 'pass')) {
    consequences.push('Metric does not measure what this decision requires');
  }
  if (rules.some(r => r.id === 'A1' && r.status !== 'pass')) {
    consequences.push('Reality may have already changed');
  }
  
  if (consequences.length === 0 && confidence > 0.8) {
    consequences.push('Low risk - data quality verified');
  }
  
  return {
    financialRiskLevel,
    confidenceBand: {
      min: Math.max(0, confidence - 0.15),
      max: Math.min(1, confidence + 0.1),
    },
    potentialConsequences: consequences,
    historicalContext: context.sampleSize < 50 
      ? `Based on only ${context.sampleSize} records. Similar sparse-data decisions historically volatile.`
      : undefined,
  };
}

// Apply override penalty to confidence - cap at 0.45
export function applyOverridePenalty(originalConfidence: number): number {
  return Math.min(originalConfidence, 0.45);
}

export function runGuardEngine(context: MetricContext): GuardResult {
  const rules: GuardRule[] = [
    runDataFreshnessRule(context),
    runPartialDataRule(context),
    runMinSampleRule(context),
    runComparisonValidityRule(context),
    runConcentrationRule(),
    runSegmentDriftRule(),
    runVanityMetricRule(),
    runMetricMismatchRule(context),
  ];
  
  const confidence = calculateConfidence(rules);
  const status = determineStatus(rules, confidence);
  const explanation = generateExplanation(status, rules);
  const suggestedAction = generateSuggestedAction(status, rules);
  const riskSummary = generateRiskSummary(context, rules, confidence);
  const metricCertification = getMetricCertification(context.metricName.toLowerCase().replace(/\s+/g, ''));
  
  return {
    status,
    confidence,
    rules,
    explanation,
    suggestedAction,
    timestamp: new Date(),
    riskSummary,
    metricCertification,
  };
}
