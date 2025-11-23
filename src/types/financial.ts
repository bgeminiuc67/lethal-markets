// Financial feature types with lazy loading support
export interface LegalDisclaimer {
  id: string;
  title: string;
  content: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  userMustAcknowledge: boolean;
  category: 'general' | 'trading' | 'predictions' | 'risk';
}

export interface UserConsent {
  disclaimerId: string;
  acknowledged: boolean;
  timestamp: Date;
  ipAddress?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number; // 0-100%
  dataQuality: 'high' | 'medium' | 'low';
  lastValidated: Date;
}

export interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
  confidence: number; // 0-100%
  targetPrice: number;
  stopLoss: number;
  timeHorizon: 'short' | 'medium' | 'long';
  reasoning: string;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  crisisTrigger: string;
  
  // Safeguards
  validation: ValidationResult;
  disclaimers: string[]; // IDs of required disclaimers
  dataFreshness: number; // minutes since last update
  
  // Uncertainty ranges
  optimisticReturn: number;
  pessimisticReturn: number;
  mostLikelyReturn: number;
}

export interface ProfitOpportunity {
  symbol: string;
  companyName: string;
  profitProbability: number; // 0-100%
  expectedReturn: number;
  timeToProfit: number; // days
  investmentThesis: string;
  riskFactors: string[];
  
  // Entry/Exit points
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  
  // Safeguards
  confidence: number;
  validation: ValidationResult;
  crisisContext: string;
  historicalAccuracy?: number; // if we have backtesting data
}

export interface FinancialFeatureState {
  isLoaded: boolean;
  userConsents: UserConsent[];
  lastConsentCheck: Date | null;
  featuresEnabled: {
    tradingSignals: boolean;
    profitPredictions: boolean;
    portfolioAnalysis: boolean;
  };
}

// Lazy loading hook interface
export interface LazyFinancialHook {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  loadFeature: (featureName: string) => Promise<void>;
  requireConsent: (disclaimerIds: string[]) => Promise<boolean>;
}
