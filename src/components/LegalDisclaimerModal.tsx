// Lazy-loaded legal disclaimer modal
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Info } from 'lucide-react';
import { LegalDisclaimer } from '@/types/financial';
import { legalService } from '@/services/legalService';

interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  disclaimers: LegalDisclaimer[];
  onAllAccepted: () => void;
  featureName: string;
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({
  isOpen,
  onClose,
  disclaimers,
  onAllAccepted,
  featureName
}) => {
  const [acceptedDisclaimers, setAcceptedDisclaimers] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Shield className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handleDisclaimerToggle = (disclaimerId: string, accepted: boolean) => {
    const newAccepted = new Set(acceptedDisclaimers);
    if (accepted) {
      newAccepted.add(disclaimerId);
    } else {
      newAccepted.delete(disclaimerId);
    }
    setAcceptedDisclaimers(newAccepted);
  };

  const requiredDisclaimers = disclaimers.filter(d => d.userMustAcknowledge);
  const allRequiredAccepted = requiredDisclaimers.every(d => acceptedDisclaimers.has(d.id));

  const handleAcceptAll = async () => {
    if (!allRequiredAccepted) return;

    setIsProcessing(true);
    try {
      // Record all accepted disclaimers
      for (const disclaimerId of acceptedDisclaimers) {
        legalService.recordConsent(disclaimerId);
      }

      onAllAccepted();
      onClose();
    } catch (error) {
      console.error('Failed to record consents:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Legal Disclaimers Required
          </DialogTitle>
          <DialogDescription>
            To access <strong>{featureName}</strong>, you must acknowledge these important disclaimers.
            Please read carefully before proceeding.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {disclaimers.map((disclaimer) => (
              <div key={disclaimer.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  {getSeverityIcon(disclaimer.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{disclaimer.title}</h4>
                      <Badge variant={getSeverityColor(disclaimer.severity) as any}>
                        {disclaimer.severity}
                      </Badge>
                      {disclaimer.userMustAcknowledge && (
                        <Badge variant="outline">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {disclaimer.content}
                    </p>
                  </div>
                </div>

                {disclaimer.userMustAcknowledge && (
                  <div className="flex items-center space-x-2 mt-3 p-3 bg-muted/50 rounded">
                    <Checkbox
                      id={disclaimer.id}
                      checked={acceptedDisclaimers.has(disclaimer.id)}
                      onCheckedChange={(checked) => 
                        handleDisclaimerToggle(disclaimer.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={disclaimer.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I acknowledge and understand this disclaimer
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {requiredDisclaimers.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You must acknowledge all required disclaimers ({acceptedDisclaimers.size}/{requiredDisclaimers.length}) 
              to proceed with {featureName}.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAcceptAll}
            disabled={!allRequiredAccepted || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? 'Processing...' : `Accept & Continue`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
