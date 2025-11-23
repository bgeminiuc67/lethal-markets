import Replicate from 'replicate';

// Create a custom fetch function that uses the working CORS proxy
const corsProxyFetch = (url: string, options: any) => {
  const proxyUrl = 'https://corsproxy.io/?';
  return fetch(proxyUrl + encodeURIComponent(url), options);
};

const replicate = new Replicate({
  auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
  // Override fetch to use the working proxy
  fetch: corsProxyFetch as any
});

export interface CrisisEvent {
  id: number;
  title: string;
  date: string;
  type: 'War' | 'Natural Disaster' | 'Terrorist Attack' | 'Industrial Accident' | 'Political Crisis' | 'Economic Crisis';
  severity: 'High' | 'Medium' | 'Low' | 'Critical';
  location: string;
  status: 'Ongoing' | 'Developing' | 'Escalating' | 'De-escalating' | 'Resolved';
  description: string;
  companies: CrisisCompany[];
  riskScore: number;
  marketImpact: number;
}

export interface CrisisCompany {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  role: string;
  category: 'Arms Supplier' | 'Defense Contractor' | 'Cleanup Contractor' | 'Insurance' | 'Technology' | 'Energy' | 'Healthcare' | 'Logistics' | 'Construction' | 'Financial';
  involvement: string;
  impact: string;
  confidence: number;
}

export interface CrisisData {
  events: CrisisEvent[];
  lastUpdated: Date;
  totalEvents: number;
  highRiskEvents: number;
}

export class GPTCrisisService {
  private static instance: GPTCrisisService;
  private cache: CrisisData | null = null;
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static getInstance(): GPTCrisisService {
    if (!GPTCrisisService.instance) {
      GPTCrisisService.instance = new GPTCrisisService();
    }
    return GPTCrisisService.instance;
  }

  async getAllCrisisData(forceRefresh = false): Promise<CrisisData> {
    // Check cache first
    if (!forceRefresh && this.cache && this.lastFetch && 
        Date.now() - this.lastFetch.getTime() < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      console.log('Fetching crisis data from GPT-5...');
      
      const prompt = `Create a comprehensive crisis tracker dataset for current major global events (2024-2025).

For each current crisis (wars, natural disasters, terrorist attacks, industrial accidents, political crises):

1. Event details:
   - Title, type, location, severity, status, description
   - Risk score (0-100)
   - Market impact percentage

2. Involved companies with:
   - Company name and stock ticker symbol
   - Current approximate stock price
   - Recent price change and percentage
   - Role (Arms Supplier, Cleanup Contractor, Insurance, etc.)
   - How they're involved
   - Expected stock impact
   - Confidence level (0-1)

Include major current events like:
- Ukraine-Russia conflict
- Israel-Palestine tensions
- China-Taiwan tensions
- Recent natural disasters (wildfires, earthquakes, hurricanes)
- Major industrial accidents
- Political crises and elections
- Economic sanctions and trade wars

Return ONLY valid JSON with this exact format:
{
  "events": [
    {
      "id": 1,
      "title": "Event Name",
      "date": "2024-XX-XX",
      "type": "War",
      "severity": "High",
      "location": "Geographic location",
      "status": "Ongoing",
      "description": "Brief description",
      "riskScore": 85,
      "marketImpact": -2.5,
      "companies": [
        {
          "name": "Company Name",
          "symbol": "TICK",
          "price": 100.50,
          "change": 5.25,
          "changePercent": 5.5,
          "role": "Role description",
          "category": "Arms Supplier",
          "involvement": "How they're involved",
          "impact": "Expected stock impact",
          "confidence": 0.8
        }
      ]
    }
  ]
}`;

      const input = {
        prompt: prompt
      };

      // Use replicate.run() as shown in official docs
      const output = await replicate.run("openai/gpt-5", { input });
      
      // Handle the response (could be string or array)
      const responseText = Array.isArray(output) ? output.join('') : String(output);
      
      // Clean up the response to ensure it's valid JSON
      const cleanedResponse = this.cleanJsonResponse(responseText);
      
      let parsedData;
      try {
        parsedData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Raw response:', responseText);
        // Fallback to mock data if parsing fails
        parsedData = this.getFallbackData();
      }

      // Process and validate the data
      const crisisData: CrisisData = {
        events: this.processEvents(parsedData.events || []),
        lastUpdated: new Date(),
        totalEvents: parsedData.events?.length || 0,
        highRiskEvents: parsedData.events?.filter((e: any) => e.riskScore >= 70).length || 0
      };

      // Cache the result
      this.cache = crisisData;
      this.lastFetch = new Date();

      console.log(`Loaded ${crisisData.totalEvents} crisis events`);
      return crisisData;

    } catch (error) {
      console.error('GPT Crisis Service error:', error);
      
      // Return fallback data if GPT fails
      if (this.cache) {
        console.log('Returning cached data due to error');
        return this.cache;
      }
      
      return this.getFallbackData();
    }
  }

  async updateSpecificEvent(eventId: number): Promise<CrisisEvent | null> {
    if (!this.cache) return null;

    const event = this.cache.events.find(e => e.id === eventId);
    if (!event) return null;

    try {
      const prompt = `Update the crisis event "${event.title}" with the latest information:

Current event: ${JSON.stringify(event)}

Provide updated information including:
- Current status and severity
- Latest company stock prices and changes
- New companies that might be involved
- Updated risk assessment
- Recent developments

Return ONLY valid JSON in the same format as the original event.`;

      const input = {
        prompt: prompt
      };

      // Use replicate.run() as shown in official docs
      const output = await replicate.run("openai/gpt-5", { input });
      
      // Handle the response (could be string or array)
      const responseText = Array.isArray(output) ? output.join('') : String(output);
      const cleanedResponse = this.cleanJsonResponse(responseText);
      const updatedEvent = JSON.parse(cleanedResponse);

      // Update the cache
      const eventIndex = this.cache.events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        this.cache.events[eventIndex] = this.processEvent(updatedEvent);
      }

      return this.cache.events[eventIndex];
    } catch (error) {
      console.error('Event update error:', error);
      return event;
    }
  }

  async analyzeCompanyImpact(companySymbol: string, eventContext: string): Promise<any> {
    try {
      const prompt = `Analyze how the crisis "${eventContext}" affects ${companySymbol} stock:

Provide detailed analysis including:
- Expected stock price impact (positive/negative/neutral)
- Percentage impact estimate
- Reasoning for the impact
- Historical similar events and their effects
- Risk assessment (0-100)
- Investment outlook (bullish/bearish/neutral)
- Key factors driving the impact

Return as valid JSON with this format:
{
  "symbol": "${companySymbol}",
  "impact": "positive/negative/neutral",
  "impactPercent": 5.2,
  "reasoning": "Detailed explanation",
  "riskScore": 75,
  "outlook": "bullish/bearish/neutral",
  "keyFactors": ["factor1", "factor2"],
  "confidence": 0.8
}`;

      const input = {
        prompt: prompt
      };

      // Use replicate.run() as shown in official docs
      const output = await replicate.run("openai/gpt-5", { input });
      
      // Handle the response (could be string or array)
      const responseText = Array.isArray(output) ? output.join('') : String(output);
      return JSON.parse(this.cleanJsonResponse(responseText));
    } catch (error) {
      console.error('Company analysis error:', error);
      return {
        symbol: companySymbol,
        impact: 'neutral',
        impactPercent: 0,
        reasoning: 'Analysis unavailable',
        riskScore: 50,
        outlook: 'neutral',
        keyFactors: [],
        confidence: 0.5
      };
    }
  }

  private cleanJsonResponse(response: string): string {
    // Remove any markdown code blocks
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove any text before the first {
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }
    
    return cleaned.trim();
  }

  private processEvents(events: any[]): CrisisEvent[] {
    return events.map((event, index) => this.processEvent(event, index));
  }

  private processEvent(event: any, index?: number): CrisisEvent {
    return {
      id: event.id || (index !== undefined ? index + 1 : 1),
      title: event.title || 'Unknown Crisis',
      date: event.date || new Date().toISOString().split('T')[0],
      type: event.type || 'Political Crisis',
      severity: event.severity || 'Medium',
      location: event.location || 'Unknown',
      status: event.status || 'Ongoing',
      description: event.description || 'No description available',
      riskScore: event.riskScore || 50,
      marketImpact: event.marketImpact || 0,
      companies: (event.companies || []).map((company: any) => ({
        name: company.name || 'Unknown Company',
        symbol: company.symbol || 'N/A',
        price: company.price || 100,
        change: company.change || 0,
        changePercent: company.changePercent || 0,
        role: company.role || 'Unknown role',
        category: company.category || 'Technology',
        involvement: company.involvement || 'Unknown involvement',
        impact: company.impact || 'Neutral impact',
        confidence: company.confidence || 0.5
      }))
    };
  }

  private getFallbackData(): CrisisData {
    return {
      events: [
        {
          id: 1,
          title: "Ukraine-Russia Conflict",
          date: "2022-02-24",
          type: "War",
          severity: "Critical",
          location: "Ukraine, Eastern Europe",
          status: "Ongoing",
          description: "Ongoing military conflict between Russia and Ukraine affecting global markets and supply chains",
          riskScore: 95,
          marketImpact: -3.2,
          companies: [
            {
              name: "Lockheed Martin",
              symbol: "LMT",
              price: 425.50,
              change: 12.30,
              changePercent: 2.98,
              role: "Defense contractor supplying weapons systems",
              category: "Arms Supplier",
              involvement: "Providing missile systems and military equipment to Ukraine",
              impact: "Positive due to increased defense spending",
              confidence: 0.9
            },
            {
              name: "Raytheon Technologies",
              symbol: "RTX",
              price: 115.75,
              change: 8.45,
              changePercent: 7.87,
              role: "Defense contractor",
              category: "Arms Supplier",
              involvement: "Supplying air defense systems",
              impact: "Significant positive impact from defense contracts",
              confidence: 0.85
            }
          ]
        },
        {
          id: 2,
          title: "Middle East Tensions",
          date: "2023-10-07",
          type: "War",
          severity: "High",
          location: "Israel, Palestine, Middle East",
          status: "Ongoing",
          description: "Escalating conflict affecting regional stability and global oil markets",
          riskScore: 85,
          marketImpact: 1.8,
          companies: [
            {
              name: "Exxon Mobil",
              symbol: "XOM",
              price: 118.90,
              change: 5.20,
              changePercent: 4.57,
              role: "Energy company",
              category: "Energy",
              involvement: "Oil price volatility affecting operations",
              impact: "Positive from higher oil prices",
              confidence: 0.75
            }
          ]
        }
      ],
      lastUpdated: new Date(),
      totalEvents: 2,
      highRiskEvents: 2
    };
  }

  // Public method to clear cache and force refresh
  clearCache(): void {
    this.cache = null;
    this.lastFetch = null;
  }
}

export const gptCrisisService = GPTCrisisService.getInstance();
