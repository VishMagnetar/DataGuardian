import { DecisionType, MetricDefinition } from '@/types/guard';

// Core metric registry - defines what metrics are allowed for what decisions
export const METRIC_REGISTRY: MetricDefinition[] = [
  // Revenue/Pricing metrics
  {
    id: 'revenue',
    name: 'Revenue',
    allowedDecisions: ['pricing', 'growth'],
    minSampleSize: 100,
    refreshRateHours: 24,
    counterMetrics: ['churn', 'cac'],
    category: 'revenue',
  },
  {
    id: 'margin',
    name: 'Margin',
    allowedDecisions: ['pricing', 'operations'],
    minSampleSize: 100,
    refreshRateHours: 24,
    counterMetrics: ['revenue', 'volume'],
    category: 'revenue',
  },
  {
    id: 'arpu',
    name: 'ARPU',
    allowedDecisions: ['pricing', 'growth'],
    minSampleSize: 50,
    refreshRateHours: 24,
    counterMetrics: ['retention', 'churn'],
    category: 'revenue',
  },
  {
    id: 'elasticity',
    name: 'Price Elasticity',
    allowedDecisions: ['pricing'],
    minSampleSize: 200,
    refreshRateHours: 48,
    counterMetrics: ['margin', 'volume'],
    category: 'revenue',
  },
  
  // Growth metrics
  {
    id: 'acquisition',
    name: 'User Acquisition',
    allowedDecisions: ['growth', 'marketing'],
    minSampleSize: 100,
    refreshRateHours: 24,
    counterMetrics: ['cac', 'retention'],
    category: 'engagement',
  },
  {
    id: 'retention',
    name: 'Retention Rate',
    allowedDecisions: ['growth', 'product'],
    minSampleSize: 200,
    refreshRateHours: 168, // weekly
    counterMetrics: ['churn', 'ltv'],
    category: 'retention',
  },
  {
    id: 'ltv',
    name: 'Lifetime Value',
    allowedDecisions: ['growth', 'pricing'],
    minSampleSize: 100,
    refreshRateHours: 168,
    counterMetrics: ['cac', 'churn'],
    category: 'revenue',
  },
  {
    id: 'churn',
    name: 'Churn Rate',
    allowedDecisions: ['growth', 'product'],
    minSampleSize: 100,
    refreshRateHours: 168,
    counterMetrics: ['retention', 'nps'],
    category: 'retention',
  },
  
  // Marketing metrics
  {
    id: 'cac',
    name: 'Customer Acquisition Cost',
    allowedDecisions: ['marketing', 'growth'],
    minSampleSize: 50,
    refreshRateHours: 24,
    counterMetrics: ['ltv', 'conversion'],
    category: 'cost',
  },
  {
    id: 'roas',
    name: 'Return on Ad Spend',
    allowedDecisions: ['marketing'],
    minSampleSize: 100,
    refreshRateHours: 24,
    counterMetrics: ['cac', 'conversion'],
    category: 'efficiency',
  },
  {
    id: 'conversion',
    name: 'Conversion Rate',
    allowedDecisions: ['marketing', 'product'],
    minSampleSize: 200,
    refreshRateHours: 24,
    counterMetrics: ['revenue', 'engagement'],
    category: 'conversion',
  },
  
  // Product metrics
  {
    id: 'engagement',
    name: 'Engagement',
    allowedDecisions: ['product', 'marketing'],
    minSampleSize: 500,
    refreshRateHours: 24,
    counterMetrics: ['retention', 'conversion'],
    category: 'engagement',
  },
  {
    id: 'nps',
    name: 'Net Promoter Score',
    allowedDecisions: ['product'],
    minSampleSize: 100,
    refreshRateHours: 168,
    counterMetrics: ['churn', 'retention'],
    category: 'engagement',
  },
  {
    id: 'adoption',
    name: 'Feature Adoption',
    allowedDecisions: ['product'],
    minSampleSize: 100,
    refreshRateHours: 24,
    counterMetrics: ['engagement', 'retention'],
    category: 'engagement',
  },
  
  // Operations metrics
  {
    id: 'efficiency',
    name: 'Operational Efficiency',
    allowedDecisions: ['operations'],
    minSampleSize: 50,
    refreshRateHours: 24,
    counterMetrics: ['cost', 'quality'],
    category: 'efficiency',
  },
  {
    id: 'cost',
    name: 'Cost per Unit',
    allowedDecisions: ['operations', 'pricing'],
    minSampleSize: 100,
    refreshRateHours: 24,
    counterMetrics: ['margin', 'efficiency'],
    category: 'cost',
  },
  {
    id: 'throughput',
    name: 'Throughput',
    allowedDecisions: ['operations'],
    minSampleSize: 100,
    refreshRateHours: 12,
    counterMetrics: ['quality', 'cost'],
    category: 'efficiency',
  },
  {
    id: 'quality',
    name: 'Quality Score',
    allowedDecisions: ['operations', 'product'],
    minSampleSize: 50,
    refreshRateHours: 24,
    counterMetrics: ['throughput', 'cost'],
    category: 'efficiency',
  },
];

// Get metrics allowed for a specific decision type
export function getMetricsForDecision(decisionType: DecisionType): MetricDefinition[] {
  return METRIC_REGISTRY.filter(m => m.allowedDecisions.includes(decisionType));
}

// Check if a metric is valid for a decision type
export function isMetricValidForDecision(metricId: string, decisionType: DecisionType): boolean {
  const metric = METRIC_REGISTRY.find(m => m.id === metricId);
  if (!metric) return false;
  return metric.allowedDecisions.includes(decisionType);
}

// Get metric by ID
export function getMetricById(metricId: string): MetricDefinition | undefined {
  return METRIC_REGISTRY.find(m => m.id === metricId);
}

// Get certification for a metric
export function getMetricCertification(metricId: string) {
  const metric = METRIC_REGISTRY.find(m => m.id === metricId);
  if (!metric) {
    return {
      certifiedFor: [],
      unsafeFor: ['growth', 'pricing', 'marketing', 'operations', 'product'] as DecisionType[],
      certificationScore: 0,
      warnings: ['Unknown metric - cannot certify'],
    };
  }
  
  const allDecisions: DecisionType[] = ['growth', 'pricing', 'marketing', 'operations', 'product'];
  const certifiedFor = metric.allowedDecisions;
  const unsafeFor = allDecisions.filter(d => !certifiedFor.includes(d));
  
  const warnings: string[] = [];
  if (metric.minSampleSize > 100) {
    warnings.push(`Requires ${metric.minSampleSize}+ samples for validity`);
  }
  if (metric.refreshRateHours > 24) {
    warnings.push(`Slow refresh rate (${metric.refreshRateHours}h) - may lag reality`);
  }
  
  return {
    certifiedFor,
    unsafeFor,
    certificationScore: certifiedFor.length / allDecisions.length,
    warnings,
  };
}

// Decision type labels for UI
export const DECISION_TYPE_LABELS: Record<DecisionType, string> = {
  growth: 'Growth Decision',
  pricing: 'Pricing Decision',
  marketing: 'Marketing Decision',
  operations: 'Operations Decision',
  product: 'Product Decision',
};

export const DECISION_TYPE_DESCRIPTIONS: Record<DecisionType, string> = {
  growth: 'User acquisition, retention, expansion strategies',
  pricing: 'Price changes, packaging, monetization',
  marketing: 'Campaign spend, channel allocation, targeting',
  operations: 'Process efficiency, cost optimization, scaling',
  product: 'Feature launches, UX changes, roadmap priorities',
};
