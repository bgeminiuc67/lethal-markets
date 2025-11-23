// Example component showing how to use lazy-loaded financial features
import React, { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Target, PieChart, AlertTriangle } from 'lucide-react';
import { useFinancialFeatures } from '@/hooks/useFinancialFeatures';
import { legalService } from '@/services/legalService';
import { LegalDisclaimerModal } from './LegalDisclaimerModal';

// Lazy load financial components (only when needed)
const TradingSignalsPanel = lazy(() => import('./TradingSignalsPanel'));
const ProfitPredictorPanel = lazy(() => import('./ProfitPredictorPanel'));
const PortfolioAnalysisPanel = lazy(() => import('./PortfolioAnalysisPanel'));

export const FinancialFeaturesExample: React.FC = () => {
  const {
    isLoading,
    error,
    loadFeature,
    requireConsent,
    featuresEnabled
  } = useFinancialFeatures();

  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<string | null>(null);
  const [disclaimersToShow, setDisclaimersToShow] = useState<any[]>([]);

  const handleFeatureClick = async (featureName: string) => {
    try {
      // Check if feature is already enabled
      if (featuresEnabled[featureName as keyof typeof featuresEnabled]) {
        setActiveFeature(featureName);
        return;
      }

      // Try to load the feature (will check consents)
      await loadFeature(featureName);
      
      // If successful, activate the feature
      setActiveFeature(featureName);
      
    } catch (err) {
      // If consent is required, show disclaimer modal
      if (error?.includes('Consent required')) {
        setPendingFeature(featureName);
        
        // Get required disclaimers based on feature type
        let category: 'trading' | 'predictions' | 'general' = 'general';
        if (featureName.includes('trading')) category = 'trading';
        if (featureName.includes('profit')) category = 'predictions';
        
        const disclaimers = legalService.getRequiredDisclaimers(category);
        setDisclaimersToShow(disclaimers);
        setShowDisclaimerModal(true);
      }
    }
  };

  const handleDisclaimerAccepted = async () => {
    if (!pendingFeature) return;
    
    try {
      // Try loading the feature again after consent
      await loadFeature(pendingFeature);
      setActiveFeature(pendingFeature);
    } catch (err) {
      console.error('Failed to load feature after consent:', err);
    } finally {
      setPendingFeature(null);
      setShowDisclaimerModal(false);
    }
  };

  const renderFeatureCard = (
    featureName: string,
    title: string,
    description: string,
    icon: React.ReactNode,
    riskLevel: 'low' | 'medium' | 'high'
  ) => {
    const isEnabled = featuresEnabled[featureName as keyof typeof featuresEnabled];
    const isActive = activeFeature === featureName;

    return (
      <Card className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
            {isEnabled && <Badge variant="outline">Ready</Badge>}
            <Badge 
              variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'secondary' : 'default'}
            >
              {riskLevel} risk
            </Badge>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleFeatureClick(featureName)}
            disabled={isLoading}
            className="w-full"
            variant={isActive ? 'default' : 'outline'}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : isActive ? (
              'Active'
            ) : isEnabled ? (
              'Open'
            ) : (
              'Enable Feature'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Financial Intelligence Features</h2>
        <p className="text-muted-foreground mt-2">
          Advanced AI-powered tools for crisis-driven investment opportunities
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Feature Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderFeatureCard(
          'tradingSignals',
          'Trading Signals',
          'AI-powered buy/sell recommendations based on crisis intelligence',
          <TrendingUp className="h-5 w-5" />,
          'high'
        )}

        {renderFeatureCard(
          'profitPredictions',
          'Profit Predictor',
          'Identify companies likely to profit from global crises',
          <Target className="h-5 w-5" />,
          'medium'
        )}

        {renderFeatureCard(
          'portfolioAnalysis',
          'Portfolio Analysis',
          'Analyze your portfolio\'s exposure to crisis-driven opportunities',
          <PieChart className="h-5 w-5" />,
          'low'
        )}
      </div>

      {/* Active Feature Panel */}
      {activeFeature && (
        <Card>
          <CardHeader>
            <CardTitle>
              {activeFeature === 'tradingSignals' && 'Trading Signals Dashboard'}
              {activeFeature === 'profitPredictions' && 'Profit Opportunities'}
              {activeFeature === 'portfolioAnalysis' && 'Portfolio Analysis'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense 
              fallback={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading financial tools...</span>
                </div>
              }
            >
              {activeFeature === 'tradingSignals' && <TradingSignalsPanel />}
              {activeFeature === 'profitPredictions' && <ProfitPredictorPanel />}
              {activeFeature === 'portfolioAnalysis' && <PortfolioAnalysisPanel />}
            </Suspense>
          </CardContent>
        </Card>
      )}

      {/* Legal Disclaimer Modal */}
      <LegalDisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
        disclaimers={disclaimersToShow}
        onAllAccepted={handleDisclaimerAccepted}
        featureName={pendingFeature || 'Financial Features'}
      />

      {/* Footer Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> All financial features require legal acknowledgment. 
          Data is for informational purposes only and should not be considered financial advice.
          Always consult with a qualified financial advisor before making investment decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
};
