// Profit Predictor page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useFinancialFeatures } from '@/hooks/useFinancialFeatures';
import { legalService } from '@/services/legalService';
import { LegalDisclaimerModal } from '@/components/LegalDisclaimerModal';
import { ProfitPredictorPanel } from '@/components/ProfitPredictorPanel';

export const ProfitPredictor: React.FC = () => {
  const navigate = useNavigate();
  const { loadFeature, featuresEnabled, error } = useFinancialFeatures();
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [disclaimersToShow, setDisclaimersToShow] = useState<any[]>([]);
  const [isFeatureReady, setIsFeatureReady] = useState(false);

  useEffect(() => {
    const checkFeatureAccess = async () => {
      if (featuresEnabled.profitPredictions) {
        setIsFeatureReady(true);
        return;
      }

      try {
        await loadFeature('profitPredictions');
        setIsFeatureReady(true);
      } catch (err) {
        // Show disclaimers if needed
        const disclaimers = legalService.getRequiredDisclaimers('predictions');
        setDisclaimersToShow(disclaimers);
        setShowDisclaimerModal(true);
      }
    };

    checkFeatureAccess();
  }, []);

  const handleDisclaimerAccepted = async () => {
    try {
      await loadFeature('profitPredictions');
      setIsFeatureReady(true);
    } catch (err) {
      console.error('Failed to load feature after consent:', err);
    } finally {
      setShowDisclaimerModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Crisis Profit Predictor</h1>
            <p className="text-muted-foreground">AI identifies profit opportunities from global crises</p>
          </div>
        </div>
        
        {isFeatureReady ? (
          <ProfitPredictorPanel />
        ) : (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Loading Profit Predictor...</h3>
              <p className="text-muted-foreground">Please accept the required disclaimers to continue.</p>
            </div>
          </div>
        )}

        <LegalDisclaimerModal
          isOpen={showDisclaimerModal}
          onClose={() => setShowDisclaimerModal(false)}
          disclaimers={disclaimersToShow}
          onAllAccepted={handleDisclaimerAccepted}
          featureName="Profit Predictor"
        />
      </div>
    </div>
  );
};

export default ProfitPredictor;
