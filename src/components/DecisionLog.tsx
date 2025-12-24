import { DecisionLog, OutcomeStatus } from '@/types/guard';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { ShieldOff, ChevronDown, ChevronUp, CheckCircle, XCircle, MinusCircle, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DecisionLogTableProps {
  logs: DecisionLog[];
  onOutcomeUpdate?: (logId: string, outcome: 'Positive' | 'Neutral' | 'Negative', notes?: string) => void;
}

function OutcomeIcon({ outcome }: { outcome: OutcomeStatus }) {
  const config = {
    Positive: { icon: CheckCircle, className: 'text-success' },
    Neutral: { icon: MinusCircle, className: 'text-muted-foreground' },
    Negative: { icon: XCircle, className: 'text-destructive' },
    Unknown: { icon: HelpCircle, className: 'text-muted-foreground/50' },
  };
  const { icon: Icon, className } = config[outcome];
  return <Icon size={14} className={className} />;
}

export function DecisionLogTable({ logs, onOutcomeUpdate }: DecisionLogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Metric</th>
            <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Decision</th>
            <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Status</th>
            <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Conf</th>
            <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Outcome</th>
            <th className="px-3 py-2 text-xs font-medium text-muted-foreground w-10"></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const audit = log.auditRecord;
            const isExpanded = expandedId === log.id;
            
            return (
              <>
                <tr 
                  key={log.id} 
                  className={cn(
                    'border-b border-border hover:bg-muted/20 cursor-pointer',
                    audit.override.overrideUsed && 'bg-warning/5'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {audit.override.overrideUsed && <ShieldOff size={12} className="text-warning" />}
                      <span className="font-mono text-foreground text-xs">{log.metric}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{log.decisionType}</td>
                  <td className="px-3 py-2"><StatusBadge status={audit.decisionState.finalStatus} size="sm" /></td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground text-xs">
                    {Math.round(audit.decisionState.finalConfidence * 100)}%
                  </td>
                  <td className="px-3 py-2 text-center">
                    <OutcomeIcon outcome={audit.outcomeTracking.outcome} />
                  </td>
                  <td className="px-3 py-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : log.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp size={12} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={12} className="text-muted-foreground" />
                      )}
                    </Button>
                  </td>
                </tr>
                
                {/* Full audit lineage expansion */}
                {isExpanded && (
                  <tr key={`${log.id}-details`} className="bg-muted/10 border-b border-border">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="space-y-4 text-xs">
                        {/* Decision ID & Timestamp */}
                        <div className="flex gap-6 pb-3 border-b border-border">
                          <div>
                            <span className="text-muted-foreground">Decision ID:</span>{' '}
                            <span className="font-mono text-foreground">{audit.decisionId.slice(0, 8)}...</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Timestamp:</span>{' '}
                            <span className="font-mono text-foreground">
                              {format(audit.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                            </span>
                          </div>
                        </div>

                        {/* Input Context */}
                        <div>
                          <div className="text-muted-foreground uppercase tracking-wide mb-2">Input Context</div>
                          <div className="grid grid-cols-2 gap-2 bg-muted/20 p-2 rounded border border-border">
                            <div>
                              <span className="text-muted-foreground">Time Range:</span>{' '}
                              <span className="font-mono text-foreground">
                                {format(audit.inputContext.timeRange.start, 'MMM d')} - {format(audit.inputContext.timeRange.end, 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Sample Size:</span>{' '}
                              <span className="font-mono text-foreground">{audit.inputContext.sampleSize}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Data Updated:</span>{' '}
                              <span className="font-mono text-foreground">
                                {format(audit.inputContext.dataLastUpdatedAt, 'MMM d, HH:mm')}
                              </span>
                            </div>
                            {audit.inputContext.segmentLevel && (
                              <div>
                                <span className="text-muted-foreground">Segment:</span>{' '}
                                <span className="font-mono text-foreground">{audit.inputContext.segmentLevel}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Guard Evaluation */}
                        <div>
                          <div className="text-muted-foreground uppercase tracking-wide mb-2">
                            Guard Evaluation ({audit.guardEvaluation.totalRulesEvaluated} rules)
                          </div>
                          <div className="space-y-1">
                            {audit.guardEvaluation.ruleResults.map((rule) => (
                              <div 
                                key={rule.ruleId} 
                                className={cn(
                                  'flex items-center justify-between p-2 rounded border',
                                  rule.status === 'pass' && 'bg-success/5 border-success/20',
                                  rule.status === 'warn' && 'bg-warning/5 border-warning/20',
                                  rule.status === 'fail' && 'bg-destructive/5 border-destructive/20'
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-muted-foreground">[{rule.ruleId}]</span>
                                  <span className="text-foreground">{rule.ruleName}</span>
                                  {rule.reason && (
                                    <span className="text-muted-foreground">— {rule.reason}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={cn(
                                    'font-mono uppercase text-xs',
                                    rule.status === 'pass' && 'text-success',
                                    rule.status === 'warn' && 'text-warning',
                                    rule.status === 'fail' && 'text-destructive'
                                  )}>
                                    {rule.status}
                                  </span>
                                  <span className="font-mono text-muted-foreground">
                                    w: {rule.weight} → {rule.weightContribution.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Decision State */}
                        <div className="flex gap-6 p-3 rounded border border-border bg-muted/20">
                          <div>
                            <div className="text-muted-foreground mb-1">Original</div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={audit.decisionState.originalStatus} size="sm" />
                              <span className="font-mono">{Math.round(audit.decisionState.originalConfidence * 100)}%</span>
                            </div>
                          </div>
                          <div className="w-px bg-border" />
                          <div>
                            <div className="text-muted-foreground mb-1">Final</div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={audit.decisionState.finalStatus} size="sm" />
                              <span className="font-mono">{Math.round(audit.decisionState.finalConfidence * 100)}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Override Section */}
                        {audit.override.overrideUsed && (
                          <div className="p-3 rounded border border-warning/30 bg-warning/5">
                            <div className="text-warning uppercase tracking-wide mb-2">Override Record</div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-muted-foreground">Override Used:</span>{' '}
                                <span className="font-mono text-warning">TRUE</span>
                              </div>
                              {audit.override.overrideTimestamp && (
                                <div>
                                  <span className="text-muted-foreground">Override Time:</span>{' '}
                                  <span className="font-mono text-foreground">
                                    {format(audit.override.overrideTimestamp, 'yyyy-MM-dd HH:mm:ss')}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Justification:</span>
                                <div className="mt-1 p-2 bg-muted/30 rounded border border-border text-foreground">
                                  {audit.override.overrideReason}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Outcome Tracking */}
                        <div className="p-3 rounded border border-border">
                          <div className="text-muted-foreground uppercase tracking-wide mb-2">Outcome Tracking</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <OutcomeIcon outcome={audit.outcomeTracking.outcome} />
                              <span className="text-foreground">{audit.outcomeTracking.outcome}</span>
                              {audit.outcomeTracking.outcomeUpdatedAt && (
                                <span className="text-muted-foreground text-xs">
                                  (updated {format(audit.outcomeTracking.outcomeUpdatedAt, 'MMM d, yyyy')})
                                </span>
                              )}
                            </div>
                            {onOutcomeUpdate && audit.outcomeTracking.outcome === 'Unknown' && (
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs text-success hover:bg-success/10"
                                  onClick={(e) => { e.stopPropagation(); onOutcomeUpdate(log.id, 'Positive'); }}
                                >
                                  Positive
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs text-muted-foreground hover:bg-muted/30"
                                  onClick={(e) => { e.stopPropagation(); onOutcomeUpdate(log.id, 'Neutral'); }}
                                >
                                  Neutral
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                                  onClick={(e) => { e.stopPropagation(); onOutcomeUpdate(log.id, 'Negative'); }}
                                >
                                  Negative
                                </Button>
                              </div>
                            )}
                          </div>
                          {audit.outcomeTracking.outcomeNotes && (
                            <div className="mt-2 text-muted-foreground">
                              Notes: {audit.outcomeTracking.outcomeNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
