// Lazy-loaded legal disclaimer service
import { LegalDisclaimer, UserConsent } from '@/types/financial';

export const FINANCIAL_DISCLAIMERS: LegalDisclaimer[] = [
  {
    id: 'not-financial-advice',
    title: 'Not Financial Advice',
    content: `This platform provides information and analysis for educational purposes only. 
    Nothing on this platform constitutes financial, investment, trading, or other advice. 
    You should not treat any content as a recommendation to buy, sell, or hold any security or investment.`,
    severity: 'critical',
    userMustAcknowledge: true,
    category: 'general'
  },
  {
    id: 'high-risk-warning',
    title: 'High Risk Investment Warning',
    content: `Trading and investing in securities involves substantial risk of loss and is not suitable for all investors. 
    Past performance does not guarantee future results. You may lose some or all of your investment.`,
    severity: 'critical',
    userMustAcknowledge: true,
    category: 'trading'
  },
  {
    id: 'ai-predictions-warning',
    title: 'AI Predictions Disclaimer',
    content: `Our AI predictions are based on historical data and current events analysis. 
    AI predictions can be wrong and should not be relied upon as the sole basis for investment decisions. 
    Markets are unpredictable and AI models have limitations.`,
    severity: 'high',
    userMustAcknowledge: true,
    category: 'predictions'
  },
  {
    id: 'crisis-data-warning',
    title: 'Crisis Data Accuracy',
    content: `Crisis and conflict data is sourced from various sources and AI analysis. 
    Information may be incomplete, delayed, or inaccurate. Always verify information from multiple sources 
    before making investment decisions.`,
    severity: 'medium',
    userMustAcknowledge: false,
    category: 'general'
  },
  {
    id: 'volatility-warning',
    title: 'Market Volatility Warning',
    content: `Crisis-related investments can be extremely volatile. Prices can change rapidly and unpredictably. 
    Only invest what you can afford to lose completely.`,
    severity: 'high',
    userMustAcknowledge: true,
    category: 'risk'
  }
];

export class LegalService {
  private static instance: LegalService;
  private userConsents: Map<string, UserConsent> = new Map();
  private consentStorageKey = 'unethical-user-consents';

  static getInstance(): LegalService {
    if (!LegalService.instance) {
      LegalService.instance = new LegalService();
    }
    return LegalService.instance;
  }

  constructor() {
    this.loadStoredConsents();
  }

  private loadStoredConsents(): void {
    try {
      const stored = localStorage.getItem(this.consentStorageKey);
      if (stored) {
        const consents: UserConsent[] = JSON.parse(stored);
        consents.forEach(consent => {
          this.userConsents.set(consent.disclaimerId, {
            ...consent,
            timestamp: new Date(consent.timestamp)
          });
        });
      }
    } catch (error) {
      console.warn('Failed to load stored consents:', error);
    }
  }

  private saveConsents(): void {
    try {
      const consents = Array.from(this.userConsents.values());
      localStorage.setItem(this.consentStorageKey, JSON.stringify(consents));
    } catch (error) {
      console.warn('Failed to save consents:', error);
    }
  }

  getRequiredDisclaimers(category?: string): LegalDisclaimer[] {
    return FINANCIAL_DISCLAIMERS.filter(disclaimer => 
      disclaimer.userMustAcknowledge && 
      (!category || disclaimer.category === category)
    );
  }

  getAllDisclaimers(category?: string): LegalDisclaimer[] {
    return FINANCIAL_DISCLAIMERS.filter(disclaimer => 
      !category || disclaimer.category === category
    );
  }

  hasUserConsented(disclaimerId: string): boolean {
    const consent = this.userConsents.get(disclaimerId);
    if (!consent) return false;

    // Check if consent is still valid (not older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return consent.acknowledged && consent.timestamp > thirtyDaysAgo;
  }

  recordConsent(disclaimerId: string): void {
    const consent: UserConsent = {
      disclaimerId,
      acknowledged: true,
      timestamp: new Date()
    };
    
    this.userConsents.set(disclaimerId, consent);
    this.saveConsents();
  }

  async checkRequiredConsents(feature: 'trading' | 'predictions' | 'general'): Promise<{
    hasAllConsents: boolean;
    missingConsents: LegalDisclaimer[];
  }> {
    const requiredDisclaimers = this.getRequiredDisclaimers(feature);
    const missingConsents: LegalDisclaimer[] = [];

    for (const disclaimer of requiredDisclaimers) {
      if (!this.hasUserConsented(disclaimer.id)) {
        missingConsents.push(disclaimer);
      }
    }

    return {
      hasAllConsents: missingConsents.length === 0,
      missingConsents
    };
  }

  revokeConsent(disclaimerId: string): void {
    this.userConsents.delete(disclaimerId);
    this.saveConsents();
  }

  clearAllConsents(): void {
    this.userConsents.clear();
    localStorage.removeItem(this.consentStorageKey);
  }
}

export const legalService = LegalService.getInstance();
