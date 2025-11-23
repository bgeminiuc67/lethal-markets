export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: Date;
}

export interface StockData {
  symbol: string;
  name: string;
  prices: Array<{
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  currentPrice: StockPrice;
  conflictImpact?: {
    preConflictPrice: number;
    currentPrice: number;
    impactPercent: number;
    volatility: number;
  };
}

export class StockService {
  private static instance: StockService;
  private cache = new Map<string, { data: StockData; timestamp: number }>();
  private priceCache = new Map<string, { data: StockPrice; timestamp: number }>();
  private readonly CACHE_DURATION = 60 * 1000; // 1 minute for prices
  private readonly DATA_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for historical data

  static getInstance(): StockService {
    if (!StockService.instance) {
      StockService.instance = new StockService();
    }
    return StockService.instance;
  }

  async getCurrentPrice(symbol: string): Promise<StockPrice> {
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Try multiple sources for better reliability
      let price = await this.fetchFromAlphaVantage(symbol);
      if (!price) {
        price = await this.fetchFromYahooFinance(symbol);
      }
      if (!price) {
        price = await this.fetchFromFinnhub(symbol);
      }

      if (price) {
        this.priceCache.set(symbol, { data: price, timestamp: Date.now() });
        return price;
      }

      throw new Error('No price data available');
    } catch (error) {
      console.error(`Stock price error for ${symbol}:`, error);
      // Return mock data as fallback
      return this.getMockPrice(symbol);
    }
  }

  async getStockData(symbol: string, conflictStartDate?: Date): Promise<StockData> {
    const cacheKey = `${symbol}_${conflictStartDate?.getTime() || 'no_conflict'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.DATA_CACHE_DURATION) {
      return cached.data;
    }

    try {
      const [currentPrice, historicalData] = await Promise.all([
        this.getCurrentPrice(symbol),
        this.getHistoricalData(symbol, conflictStartDate)
      ]);

      const stockData: StockData = {
        symbol,
        name: await this.getCompanyName(symbol),
        prices: historicalData,
        currentPrice,
        conflictImpact: conflictStartDate ? this.calculateConflictImpact(historicalData, conflictStartDate) : undefined
      };

      this.cache.set(cacheKey, { data: stockData, timestamp: Date.now() });
      return stockData;
    } catch (error) {
      console.error(`Stock data error for ${symbol}:`, error);
      return this.getMockStockData(symbol);
    }
  }

  async getMultipleStocks(symbols: string[], conflictStartDate?: Date): Promise<StockData[]> {
    const promises = symbols.map(symbol => this.getStockData(symbol, conflictStartDate));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<StockData> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  private async fetchFromAlphaVantage(symbol: string): Promise<StockPrice | null> {
    const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return null;

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const quote = data['Global Quote'];
      if (!quote) return null;

      return {
        symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Alpha Vantage error:', error);
      return null;
    }
  }

  private async fetchFromYahooFinance(symbol: string): Promise<StockPrice | null> {
    try {
      // Using Yahoo Finance API through a proxy
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const result = data.chart?.result?.[0];
      if (!result) return null;

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      
      if (!meta || !quote) return null;

      const latestPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const change = latestPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol,
        price: latestPrice,
        change,
        changePercent,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Yahoo Finance error:', error);
      return null;
    }
  }

  private async fetchFromFinnhub(symbol: string): Promise<StockPrice | null> {
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    if (!apiKey) return null;

    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.c) return null;

      return {
        symbol,
        price: data.c, // current price
        change: data.d, // change
        changePercent: data.dp, // change percent
        volume: 0, // Finnhub doesn't provide volume in quote endpoint
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Finnhub error:', error);
      return null;
    }
  }

  private async getHistoricalData(symbol: string, fromDate?: Date): Promise<Array<{
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>> {
    const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return this.getMockHistoricalData();

    try {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) return this.getMockHistoricalData();

      const prices = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          date: new Date(date),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Filter from conflict start date if provided
      if (fromDate) {
        return prices.filter(price => price.date >= fromDate);
      }

      return prices.slice(-90); // Last 90 days
    } catch (error) {
      console.error('Historical data error:', error);
      return this.getMockHistoricalData();
    }
  }

  private async getCompanyName(symbol: string): Promise<string> {
    // Simple mapping for common symbols
    const nameMap: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation',
      'JPM': 'JPMorgan Chase & Co.',
      'JNJ': 'Johnson & Johnson',
      'V': 'Visa Inc.',
      'PG': 'Procter & Gamble Co.',
      'UNH': 'UnitedHealth Group Inc.',
      'HD': 'The Home Depot Inc.',
      'MA': 'Mastercard Inc.',
      'BAC': 'Bank of America Corp.',
      'XOM': 'Exxon Mobil Corporation',
      'CVX': 'Chevron Corporation',
      'LMT': 'Lockheed Martin Corporation',
      'RTX': 'Raytheon Technologies Corp.',
      'BA': 'The Boeing Company'
    };

    return nameMap[symbol] || `${symbol} Corporation`;
  }

  private calculateConflictImpact(prices: Array<{ date: Date; close: number }>, conflictStartDate: Date) {
    const preConflictPrices = prices.filter(p => p.date < conflictStartDate);
    const postConflictPrices = prices.filter(p => p.date >= conflictStartDate);

    if (preConflictPrices.length === 0 || postConflictPrices.length === 0) {
      return undefined;
    }

    const preConflictPrice = preConflictPrices[preConflictPrices.length - 1].close;
    const currentPrice = postConflictPrices[postConflictPrices.length - 1].close;
    const impactPercent = ((currentPrice - preConflictPrice) / preConflictPrice) * 100;

    // Calculate volatility (standard deviation of daily returns)
    const returns = postConflictPrices.slice(1).map((price, i) => 
      (price.close - postConflictPrices[i].close) / postConflictPrices[i].close
    );
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility

    return {
      preConflictPrice,
      currentPrice,
      impactPercent,
      volatility
    };
  }

  private getMockPrice(symbol: string): StockPrice {
    const basePrice = 100 + (symbol.charCodeAt(0) % 50);
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol,
      price: basePrice + change,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date()
    };
  }

  private getMockStockData(symbol: string): StockData {
    const currentPrice = this.getMockPrice(symbol);
    const prices = this.getMockHistoricalData();
    
    return {
      symbol,
      name: `${symbol} Corporation`,
      prices,
      currentPrice
    };
  }

  private getMockHistoricalData(): Array<{
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> {
    const data = [];
    const basePrice = 100;
    let currentPrice = basePrice;
    
    for (let i = 90; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const change = (Math.random() - 0.5) * 5;
      currentPrice += change;
      
      const open = currentPrice;
      const high = open + Math.random() * 3;
      const low = open - Math.random() * 3;
      const close = low + Math.random() * (high - low);
      
      data.push({
        date,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 1000000)
      });
      
      currentPrice = close;
    }
    
    return data;
  }
}

export const stockService = StockService.getInstance();
