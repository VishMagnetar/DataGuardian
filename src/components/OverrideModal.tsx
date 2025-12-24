import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface OverrideModalProps {
  failedRules: { name: string; reason?: string }[];
  originalConfidence: number;
  adjustedConfidence: number;
  onConfirm: (justification: string) => void;
  onCancel: () => void;
}

export function OverrideModal({
  failedRules,
  originalConfidence,
  adjustedConfidence,
  onConfirm,
  onCancel,
}: OverrideModalProps) {
  const [justification, setJustification] = useState('');
  const minLength = 50;
  const isValid = justification.trim().length >= minLength;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-card border border-warning/30 rounded-xl p-6 shadow-xl animate-scale-in">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>
        
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
            <ShieldAlert size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Override Warning — Risk Acceptance Required</h3>
            <p className="text-sm text-muted-foreground">This action will be logged permanently and cannot be undone</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Warning Summary */}
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
            <div className="text-xs text-warning font-medium uppercase tracking-wide mb-2">Warning Summary</div>
            <p className="text-sm text-muted-foreground">
              The system has identified concerns that may affect decision quality. Proceeding will mark this decision as "OVERRIDDEN" with reduced confidence.
            </p>
          </div>

          {/* Failed Rules */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="text-xs text-muted-foreground mb-2">Failed Rule{failedRules.length > 1 ? 's' : ''}</div>
            <div className="space-y-2">
              {failedRules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <AlertTriangle size={12} className="text-warning mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm text-foreground font-medium">{rule.name}</div>
                    {rule.reason && <div className="text-xs text-muted-foreground">{rule.reason}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Confidence Penalty */}
          <div className="flex gap-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">Original Confidence</div>
              <div className="text-lg font-mono text-foreground">{Math.round(originalConfidence * 100)}%</div>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">After Override (capped)</div>
              <div className="text-lg font-mono text-destructive">{Math.round(adjustedConfidence * 100)}%</div>
            </div>
          </div>
          
          {/* Justification Input */}
          <div className="space-y-2">
            <Label htmlFor="justification" className="text-sm text-foreground">
              Explain why you are proceeding despite this warning
            </Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="This justification will be stored in the permanent audit log and cannot be edited or deleted..."
              className="min-h-[100px] bg-muted/30 border-border"
            />
            <div className="text-xs text-muted-foreground text-right">
              {justification.length} / {minLength} minimum characters
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => isValid && onConfirm(justification.trim())}
              disabled={!isValid}
              className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
            >
              Accept Risk & Override
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
