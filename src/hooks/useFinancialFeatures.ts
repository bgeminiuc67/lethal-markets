// Lazy loading hook for financial features
import { useState, useCallback, useEffect } from 'react';
import { LazyFinancialHook, FinancialFeatureState } from '@/types/financial';
import { legalService } from '@/services/legalService';

export const useFinancialFeatures = (): LazyFinancialHook & FinancialFeatureState => {
  const [state, setState] = useState<FinancialFeatureState>({
    isLoaded: false,
    userConsents: [],
    lastConsentCheck: null,
    featuresEnabled: {
      tradingSignals: false,
      profitPredictions: false,
      portfolioAnalysis: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load feature with consent checking
  const loadFeature = useCallback(async (featureName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine required consent category
      let consentCategory: 'trading' | 'predictions' | 'general' = 'general';
      
      if (featureName.includes('trading') || featureName.includes('signal')) {
        consentCategory = 'trading';
      } else if (featureName.includes('profit') || featureName.includes('predict')) {
        consentCategory = 'predictions';
      }

      // Check if user has required consents
      const consentCheck = await legalService.checkRequiredConsents(consentCategory);
      
      if (!consentCheck.hasAllConsents) {
        // Will trigger consent modal in UI
        setError(`Consent required for ${featureName}`);
        return;
      }

      // Lazy load the actual feature modules
      switch (featureName) {
        case 'tradingSignals':
          await import('@/services/dataValidator');
          setState(prev => ({
            ...prev,
            featuresEnabled: { ...prev.featuresEnabled, tradingSignals: true }
          }));
          break;
          
        case 'profitPredictions':
          await import('@/services/dataValidator');
          setState(prev => ({
            ...prev,
            featuresEnabled: { ...prev.featuresEnabled, profitPredictions: true }
          }));
          break;
          
        case 'portfolioAnalysis':
          await import('@/services/dataValidator');
          setState(prev => ({
            ...prev,
            featuresEnabled: { ...prev.featuresEnabled, portfolioAnalysis: true }
          }));
          break;
          
        default:
          throw new Error(`Unknown feature: ${featureName}`);
      }

      setState(prev => ({
        ...prev,
        isLoaded: true,
        lastConsentCheck: new Date()
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Require consent for specific disclaimers
  const requireConsent = useCallback(async (disclaimerIds: string[]): Promise<boolean> => {
    try {
      // Check if all required consents are already given
      const allConsented = disclaimerIds.every(id => legalService.hasUserConsented(id));
      
      if (allConsented) {
        return true;
      }

      // Return false - UI should show consent modal
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Consent check failed');
      return false;
    }
  }, []);

  // Check consent status on mount
  useEffect(() => {
    const checkInitialConsents = async () => {
      try {
        const tradingConsent = await legalService.checkRequiredConsents('trading');
        const predictionsConsent = await legalService.checkRequiredConsents('predictions');
        
        setState(prev => ({
          ...prev,
          featuresEnabled: {
            tradingSignals: tradingConsent.hasAllConsents,
            profitPredictions: predictionsConsent.hasAllConsents,
            portfolioAnalysis: tradingConsent.hasAllConsents // Portfolio needs trading consent
          }
        }));
      } catch (err) {
        console.warn('Failed to check initial consents:', err);
      }
    };

    checkInitialConsents();
  }, []);

  return {
    // LazyFinancialHook interface
    isLoading,
    isLoaded: state.isLoaded,
    error,
    loadFeature,
    requireConsent,
    
    // FinancialFeatureState interface
    userConsents: state.userConsents,
    lastConsentCheck: state.lastConsentCheck,
    featuresEnabled: state.featuresEnabled
  };
};
