// Real Financial Intelligence Dashboard
import React, { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Target, PieChart, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { useFinancialFeatures } from '@/hooks/useFinancialFeatures';
import { legalService } from '@/services/legalService';
import { LegalDisclaimerModal } from './LegalDisclaimerModal';

// Lazy load the actual financial components
const TradingSignalsPanel = lazy(() => import('./TradingSignalsPanel').then(module => ({ default: module.TradingSignalsPanel })));
const ProfitPredictorPanel = lazy(() => import('./ProfitPredictorPanel').then(module => ({ default: module.ProfitPredictorPanel })));
const PortfolioAnalysisPanel = lazy(() => import('./PortfolioAnalysisPanel').then(module => ({ default: module.PortfolioAnalysisPanel })));

export const FinancialIntelligence: React.FC = () => {
  const {
    isLoading,
    error,
    loadFeature,
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

  const features = [
    {
      id: 'profitPredictions',
      title: 'Crisis Profit Predictor',
      description: 'AI identifies companies likely to profit from global crises with real stock data',
      icon: <Target className="h-6 w-6" />,
      riskLevel: 'medium' as const,
      enabled: featuresEnabled.profitPredictions
    },
    {
      id: 'tradingSignals',
      title: 'AI Trading Signals',
      description: 'Real-time buy/sell recommendations based on crisis intelligence',
      icon: <TrendingUp className="h-6 w-6" />,
      riskLevel: 'high' as const,
      enabled: featuresEnabled.tradingSignals
    },
    {
      id: 'portfolioAnalysis',
      title: 'Portfolio Analysis',
      description: 'Analyze your portfolio\'s crisis exposure and get optimization suggestions',
      icon: <PieChart className="h-6 w-6" />,
      riskLevel: 'low' as const,
      enabled: featuresEnabled.portfolioAnalysis
    }
  ];

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const FeatureCard: React.FC<{ feature: typeof features[0] }> = ({ feature }) => {
    const isActive = activeFeature === feature.id;
    
    return (
      <Card className={`cursor-pointer transition-all hover:shadow-lg ${isActive ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {feature.icon}
            <div className="flex-1">
              {feature.title}
            </div>
            <div className="flex items-center gap-2">
              {feature.enabled ? (
                <Unlock className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
              <Badge variant={getRiskBadgeVariant(feature.riskLevel)}>
                {feature.riskLevel} risk
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>{feature.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleFeatureClick(feature.id)}
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
            ) : feature.enabled ? (
              'Open Dashboard'
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
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Financial Intelligence</h1>
        <p className="text-xl text-muted-foreground">
          Maximize returns through AI-powered crisis analysis
        </p>
        <p className="text-sm text-muted-foreground">
          Real data • Live analysis • Actual profit opportunities
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Feature Selection */}
      {!activeFeature && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      )}

      {/* Active Feature Dashboard */}
      {activeFeature && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {features.find(f => f.id === activeFeature)?.title}
            </h2>
            <Button
              variant="outline"
              onClick={() => setActiveFeature(null)}
            >
              Back to Features
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin mr-3" />
                    <span className="text-lg">Loading financial intelligence...</span>
                  </div>
                }
              >
                {activeFeature === 'tradingSignals' && <TradingSignalsPanel />}
                {activeFeature === 'profitPredictions' && <ProfitPredictorPanel />}
                {activeFeature === 'portfolioAnalysis' && <PortfolioAnalysisPanel />}
              </Suspense>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legal Disclaimer Modal */}
      <LegalDisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
        disclaimers={disclaimersToShow}
        onAllAccepted={handleDisclaimerAccepted}
        featureName={pendingFeature ? features.find(f => f.id === pendingFeature)?.title || 'Financial Features' : 'Financial Features'}
      />

      {/* Global Warning */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Investment Disclaimer:</strong> All features provide educational information only. 
          This is not financial advice. Markets are volatile and you can lose money. 
          Always do your own research and consult qualified financial advisors.
        </AlertDescription>
      </Alert>
    </div>
  );
};
