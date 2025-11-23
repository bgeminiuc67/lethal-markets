import { newsService, NewsArticle, ConflictNews } from './newsService';
import { stockService, StockData } from './stockService';
import { replicateService, ConflictAnalysis } from './replicateService';
import { Conflict, Company } from '@/types/conflict';

export interface RealTimeUpdate {
  type: 'news' | 'stock' | 'analysis' | 'conflict';
  timestamp: Date;
  data: any;
  conflictId?: string;
}

export interface ConflictIntelligence {
  conflict: Conflict;
  news: NewsArticle[];
  companies: Array<{
    company: Company;
    stockData: StockData;
    analysis?: ConflictAnalysis;
  }>;
  lastUpdated: Date;
  riskScore: number;
  marketImpact: number;
}

export class RealTimeDataManager {
  private static instance: RealTimeDataManager;
  private updateCallbacks: Array<(update: RealTimeUpdate) => void> = [];
  private updateIntervals: Map<string, number> = new Map();
  private isRunning = false;

  static getInstance(): RealTimeDataManager {
    if (!RealTimeDataManager.instance) {
      RealTimeDataManager.instance = new RealTimeDataManager();
    }
    return RealTimeDataManager.instance;
  }

  onUpdate(callback: (update: RealTimeUpdate) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  private notifyUpdate(update: RealTimeUpdate) {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Update callback error:', error);
      }
    });
  }

  async startRealTimeUpdates(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting real-time updates...');

    // News updates every 2 minutes
    const newsInterval = setInterval(async () => {
      try {
        const news = await newsService.getConflictNews();
        this.notifyUpdate({
          type: 'news',
          timestamp: new Date(),
          data: news
        });
      } catch (error) {
        console.error('News update error:', error);
      }
    }, 2 * 60 * 1000);

    // Stock updates every 30 seconds
    const stockInterval = setInterval(async () => {
      try {
        const symbols = this.getTrackedSymbols();
        const stockUpdates = await Promise.all(
          symbols.map(async (symbol) => {
            const price = await stockService.getCurrentPrice(symbol);
            return { symbol, price };
          })
        );

        this.notifyUpdate({
          type: 'stock',
          timestamp: new Date(),
          data: stockUpdates
        });
      } catch (error) {
        console.error('Stock update error:', error);
      }
    }, 30 * 1000);

    this.updateIntervals.set('news', newsInterval);
    this.updateIntervals.set('stock', stockInterval);

    // Initial data load
    await this.performInitialDataLoad();
  }

  stopRealTimeUpdates(): void {
    this.isRunning = false;
    this.updateIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.updateIntervals.clear();
    console.log('Stopped real-time updates');
  }

  async getConflictIntelligence(conflict: Conflict, companies: Company[]): Promise<ConflictIntelligence> {
    try {
      // Get relevant news
      const keywords = [
        conflict.name,
        conflict.location.country,
        conflict.location.region,
        ...conflict.tags
      ];
      
      const conflictNews = await newsService.getConflictNews(keywords);
      const relevantNews = conflictNews.articles.slice(0, 10); // Top 10 most relevant

      // Get company data and analysis
      const companyIntelligence = await Promise.all(
        companies.map(async (company) => {
          const [stockData, analysis] = await Promise.allSettled([
            stockService.getStockData(company.ticker, conflict.startDate),
            this.analyzeCompanyInvolvement(company, relevantNews, conflict)
          ]);

          return {
            company,
            stockData: stockData.status === 'fulfilled' ? stockData.value : this.getMockStockData(company.ticker),
            analysis: analysis.status === 'fulfilled' ? analysis.value : undefined
          };
        })
      );

      // Calculate risk score and market impact
      const riskScore = this.calculateRiskScore(conflict, relevantNews, companyIntelligence);
      const marketImpact = this.calculateMarketImpact(companyIntelligence);

      return {
        conflict,
        news: relevantNews,
        companies: companyIntelligence,
        lastUpdated: new Date(),
        riskScore,
        marketImpact
      };
    } catch (error) {
      console.error('Conflict intelligence error:', error);
      throw error;
    }
  }

  private async analyzeCompanyInvolvement(
    company: Company, 
    news: NewsArticle[], 
    conflict: Conflict
  ): Promise<ConflictAnalysis | undefined> {
    try {
      // Combine relevant news mentioning the company or conflict
      const relevantText = news
        .filter(article => 
          article.title.toLowerCase().includes(company.name.toLowerCase()) ||
          article.description.toLowerCase().includes(company.name.toLowerCase()) ||
          article.conflictKeywords.some(keyword => 
            conflict.tags.includes(keyword) || conflict.name.toLowerCase().includes(keyword)
          )
        )
        .map(article => `${article.title}: ${article.description}`)
        .join('\n\n');

      if (!relevantText) return undefined;

      return await replicateService.analyzeConflict(relevantText, [company.name]);
    } catch (error) {
      console.error('Company analysis error:', error);
      return undefined;
    }
  }

  private calculateRiskScore(
    conflict: Conflict, 
    news: NewsArticle[], 
    companies: Array<{ company: Company; stockData: StockData; analysis?: ConflictAnalysis }>
  ): number {
    let score = 0;

    // Base score from conflict severity
    switch (conflict.severity) {
      case 'critical': score += 40; break;
      case 'high': score += 30; break;
      case 'medium': score += 20; break;
      case 'low': score += 10; break;
    }

    // News sentiment and frequency
    const recentNews = news.filter(article => 
      Date.now() - article.publishedAt.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    score += Math.min(recentNews.length * 2, 20); // Up to 20 points for news frequency

    // Company involvement and stock volatility
    companies.forEach(({ company, stockData, analysis }) => {
      if (company.involvement === 'causation') {
        score += 10;
      }
      
      if (stockData.conflictImpact && stockData.conflictImpact.volatility > 0.3) {
        score += 5; // High volatility adds risk
      }

      if (analysis && analysis.severity === 'critical') {
        score += 10;
      }
    });

    return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
  }

  private calculateMarketImpact(
    companies: Array<{ company: Company; stockData: StockData }>
  ): number {
    const totalMarketCap = companies.reduce((sum, { stockData }) => 
      sum + (stockData.currentPrice.marketCap || 0), 0
    );

    const weightedImpact = companies.reduce((sum, { company, stockData }) => {
      const weight = (stockData.currentPrice.marketCap || 0) / totalMarketCap;
      const impact = stockData.conflictImpact?.impactPercent || 0;
      return sum + (weight * Math.abs(impact));
    }, 0);

    return weightedImpact;
  }

  private async performInitialDataLoad(): Promise<void> {
    try {
      // Load initial news
      const news = await newsService.getConflictNews();
      this.notifyUpdate({
        type: 'news',
        timestamp: new Date(),
        data: news
      });

      // Load initial stock data
      const symbols = this.getTrackedSymbols();
      const stockData = await stockService.getMultipleStocks(symbols);
      this.notifyUpdate({
        type: 'stock',
        timestamp: new Date(),
        data: stockData
      });

      console.log('Initial data load completed');
    } catch (error) {
      console.error('Initial data load error:', error);
    }
  }

  private getTrackedSymbols(): string[] {
    // Default symbols to track - could be made configurable
    return [
      'LMT', 'RTX', 'BA', 'NOC', 'GD', // Defense contractors
      'XOM', 'CVX', 'COP', 'EOG', // Energy companies
      'JPM', 'BAC', 'WFC', 'C', // Financial institutions
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', // Tech giants
      'JNJ', 'PFE', 'UNH', 'CVS' // Healthcare/pharma
    ];
  }

  private getMockStockData(symbol: string): StockData {
    return {
      symbol,
      name: `${symbol} Corporation`,
      prices: [],
      currentPrice: {
        symbol,
        price: 100,
        change: 0,
        changePercent: 0,
        volume: 0,
        timestamp: new Date()
      }
    };
  }

  // Public methods for manual updates
  async refreshNews(): Promise<ConflictNews> {
    const news = await newsService.getConflictNews();
    this.notifyUpdate({
      type: 'news',
      timestamp: new Date(),
      data: news
    });
    return news;
  }

  async refreshStockData(symbols: string[]): Promise<StockData[]> {
    const stockData = await stockService.getMultipleStocks(symbols);
    this.notifyUpdate({
      type: 'stock',
      timestamp: new Date(),
      data: stockData
    });
    return stockData;
  }

  async analyzeConflictWithAI(newsText: string, companies: string[]): Promise<ConflictAnalysis> {
    const analysis = await replicateService.analyzeConflict(newsText, companies);
    this.notifyUpdate({
      type: 'analysis',
      timestamp: new Date(),
      data: analysis
    });
    return analysis;
  }
}

export const realTimeDataManager = RealTimeDataManager.getInstance();
