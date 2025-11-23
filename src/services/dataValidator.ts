// Lazy-loaded data validation service
import { ValidationResult, TradingSignal, ProfitOpportunity } from '@/types/financial';
import { StockPrice } from './stockService';

export class DataValidator {
  private static instance: DataValidator;

  static getInstance(): DataValidator {
    if (!DataValidator.instance) {
      DataValidator.instance = new DataValidator();
    }
    return DataValidator.instance;
  }

  validateStockPrice(price: StockPrice): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic sanity checks
    if (price.price <= 0) {
      errors.push('Stock price must be positive');
    }

    if (price.price > 10000) {
      warnings.push('Unusually high stock price - please verify');
    }

    // Change validation
    if (Math.abs(price.changePercent) > 50) {
      warnings.push('Extreme price change detected - verify data accuracy');
    }

    if (Math.abs(price.changePercent) > 100) {
      errors.push('Price change exceeds 100% - likely data error');
    }

    // Volume validation
    if (price.volume < 0) {
      errors.push('Trading volume cannot be negative');
    }

    // Timestamp validation
    const dataAge = Date.now() - price.timestamp.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (dataAge > maxAge) {
      warnings.push('Stock data is more than 24 hours old');
    }

    if (dataAge > 7 * maxAge) {
      errors.push('Stock data is too stale (over 7 days old)');
    }

    // Calculate confidence score
    const confidence = this.calculateStockPriceConfidence(price, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence,
      dataQuality: this.getDataQuality(confidence),
      lastValidated: new Date()
    };
  }

  validateTradingSignal(signal: TradingSignal): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Signal validation
    if (!['BUY', 'SELL', 'HOLD', 'STRONG_BUY', 'STRONG_SELL'].includes(signal.action)) {
      errors.push('Invalid trading action');
    }

    // Confidence validation
    if (signal.confidence < 0 || signal.confidence > 100) {
      errors.push('Confidence must be between 0 and 100');
    }

    if (signal.confidence < 30) {
      warnings.push('Low confidence signal - use with extreme caution');
    }

    // Price validation
    if (signal.targetPrice <= 0 || signal.stopLoss <= 0) {
      errors.push('Target price and stop loss must be positive');
    }

    // Risk validation for BUY signals
    if (signal.action.includes('BUY')) {
      if (signal.stopLoss >= signal.targetPrice) {
        errors.push('Stop loss should be below target price for BUY signals');
      }

      const riskRewardRatio = (signal.targetPrice - signal.stopLoss) / signal.stopLoss;
      if (riskRewardRatio < 0.1) {
        warnings.push('Poor risk/reward ratio detected');
      }
    }

    // Risk validation for SELL signals
    if (signal.action.includes('SELL')) {
      if (signal.stopLoss <= signal.targetPrice) {
        errors.push('Stop loss should be above target price for SELL signals');
      }
    }

    // Expected return validation
    if (Math.abs(signal.expectedReturn) > 200) {
      warnings.push('Extremely high expected return - verify calculations');
    }

    // Data freshness validation
    if (signal.dataFreshness > 60) {
      warnings.push('Signal based on data older than 1 hour');
    }

    if (signal.dataFreshness > 240) {
      errors.push('Signal based on stale data (over 4 hours old)');
    }

    // Crisis context validation
    if (!signal.crisisTrigger || signal.crisisTrigger.length < 10) {
      warnings.push('Insufficient crisis context provided');
    }

    const confidence = this.calculateSignalConfidence(signal, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence,
      dataQuality: this.getDataQuality(confidence),
      lastValidated: new Date()
    };
  }

  validateProfitOpportunity(opportunity: ProfitOpportunity): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Probability validation
    if (opportunity.profitProbability < 0 || opportunity.profitProbability > 100) {
      errors.push('Profit probability must be between 0 and 100');
    }

    if (opportunity.profitProbability < 20) {
      warnings.push('Very low profit probability - high risk investment');
    }

    // Return validation
    if (opportunity.expectedReturn < -100) {
      errors.push('Expected return cannot be less than -100%');
    }

    if (opportunity.expectedReturn > 1000) {
      warnings.push('Extremely high expected return - verify calculations');
    }

    // Time validation
    if (opportunity.timeToProfit <= 0) {
      errors.push('Time to profit must be positive');
    }

    if (opportunity.timeToProfit > 365) {
      warnings.push('Very long time horizon - consider market changes');
    }

    // Price validation
    if (opportunity.entryPrice <= 0 || opportunity.targetPrice <= 0 || opportunity.stopLoss <= 0) {
      errors.push('All prices must be positive');
    }

    // Risk/reward validation
    const potentialLoss = Math.abs(opportunity.entryPrice - opportunity.stopLoss);
    const potentialGain = Math.abs(opportunity.targetPrice - opportunity.entryPrice);
    const riskRewardRatio = potentialGain / potentialLoss;

    if (riskRewardRatio < 1) {
      warnings.push('Risk exceeds potential reward');
    }

    // Investment thesis validation
    if (!opportunity.investmentThesis || opportunity.investmentThesis.length < 50) {
      warnings.push('Investment thesis should be more detailed');
    }

    // Risk factors validation
    if (!opportunity.riskFactors || opportunity.riskFactors.length === 0) {
      warnings.push('No risk factors identified - analysis may be incomplete');
    }

    const confidence = this.calculateOpportunityConfidence(opportunity, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence,
      dataQuality: this.getDataQuality(confidence),
      lastValidated: new Date()
    };
  }

  private calculateStockPriceConfidence(price: StockPrice, errors: string[], warnings: string[]): number {
    let confidence = 100;

    // Reduce confidence for each error/warning
    confidence -= errors.length * 30;
    confidence -= warnings.length * 10;

    // Data age penalty
    const dataAge = Date.now() - price.timestamp.getTime();
    const hoursSinceUpdate = dataAge / (1000 * 60 * 60);
    confidence -= Math.min(hoursSinceUpdate * 2, 30);

    // Volume confidence (higher volume = more reliable)
    if (price.volume < 1000) {
      confidence -= 15;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  private calculateSignalConfidence(signal: TradingSignal, errors: string[], warnings: string[]): number {
    let confidence = signal.confidence;

    // Reduce for validation issues
    confidence -= errors.length * 25;
    confidence -= warnings.length * 10;

    // Data freshness penalty
    if (signal.dataFreshness > 30) {
      confidence -= (signal.dataFreshness - 30) * 0.5;
    }

    // Risk level adjustment
    switch (signal.riskLevel) {
      case 'extreme':
        confidence -= 20;
        break;
      case 'high':
        confidence -= 10;
        break;
      case 'medium':
        confidence -= 5;
        break;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  private calculateOpportunityConfidence(opportunity: ProfitOpportunity, errors: string[], warnings: string[]): number {
    let confidence = opportunity.confidence;

    // Reduce for validation issues
    confidence -= errors.length * 25;
    confidence -= warnings.length * 8;

    // Probability adjustment
    if (opportunity.profitProbability < 50) {
      confidence -= (50 - opportunity.profitProbability) * 0.5;
    }

    // Historical accuracy bonus
    if (opportunity.historicalAccuracy) {
      confidence += (opportunity.historicalAccuracy - 50) * 0.3;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  private getDataQuality(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
  }
}

export const dataValidator = DataValidator.getInstance();
