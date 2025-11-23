// Secure API service - no API keys exposed to frontend!

export interface CrisisData {
  events: CrisisEvent[];
  lastUpdated: Date;
  totalEvents: number;
  highRiskEvents: number;
}

export interface CrisisEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  type: string;
  severity: string;
  location: string;
  status: string;
  riskScore: number;
  marketImpact: number;
  companies: Company[];
}

export interface Company {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  category: string;
  role: string;
  involvement: string;
  impact: string;
  confidence: number;
}

class SecureApiService {
  private readonly API_BASE_URL = import.meta.env.PROD 
    ? 'https://your-deployed-backend.com/api' 
    : 'http://localhost:3001/api';
  
  private cache: CrisisData | null = null;
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (longer cache)

  async getCrisisData(forceRefresh = false): Promise<CrisisData> {
    // Check cache first
    if (!forceRefresh && this.cache && this.lastFetch) {
      const cacheAge = Date.now() - this.lastFetch.getTime();
      if (cacheAge < this.CACHE_DURATION) {
        console.log('✅ Returning cached crisis data');
        return this.cache;
      }
    }

    try {
      console.log('🔄 Fetching fresh crisis data from secure backend...');
      console.log('🌐 Backend URL:', this.API_BASE_URL);
      
      // Check if backend is running first
      const healthCheck = await this.checkServerHealth();
      if (!healthCheck) {
        console.warn('⚠️ Backend server not running! Using fallback data.');
        console.log('💡 Start backend with: cd server && npm run dev');
        return this.getFallbackData();
      }
      
      const response = await fetch(`${this.API_BASE_URL}/analyze-crisis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Successfully received data from secure backend');
      const data = await response.json();
      
      // Process the response
      const crisisData: CrisisData = {
        ...data,
        lastUpdated: new Date(data.lastUpdated),
      };

      // Update cache
      this.cache = crisisData;
      this.lastFetch = new Date();

      console.log(`✅ Loaded ${crisisData.totalEvents} crisis events securely`);
      return crisisData;

    } catch (error) {
      console.error('Secure API error:', error);
      
      // Return cached data if available
      if (this.cache) {
        console.log('Returning cached data due to API error');
        return this.cache;
      }

      // Fallback to mock data if no cache
      console.log('Using fallback data due to API error');
      return this.getFallbackData();
    }
  }

  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private getFallbackData(): CrisisData {
    return {
      events: [
        {
          id: 1,
          title: "Ukraine-Russia Conflict",
          description: "Ongoing military conflict affecting global defense markets",
          date: "2024-01-15",
          type: "War",
          severity: "Critical",
          location: "Ukraine/Russia",
          status: "Ongoing",
          riskScore: 92,
          marketImpact: -1.8,
          companies: [
            {
              name: "Lockheed Martin",
              symbol: "LMT",
              price: 428.50,
              change: 12.75,
              changePercent: 3.07,
              category: "Arms Supplier",
              role: "Defense contractor",
              involvement: "Supplying military equipment and weapons systems",
              impact: "Increased defense contracts boosting revenue",
              confidence: 0.9
            },
            {
              name: "Raytheon Technologies", 
              symbol: "RTX",
              price: 95.80,
              change: 7.20,
              changePercent: 8.12,
              category: "Arms Supplier",
              role: "Weapons manufacturer", 
              involvement: "Missile systems and defense technology",
              impact: "Higher demand for defense systems",
              confidence: 0.85
            }
          ]
        },
        {
          id: 2,
          title: "Middle East Tensions",
          description: "Regional conflicts affecting oil markets and energy companies",
          date: "2024-02-01", 
          type: "Political Crisis",
          severity: "High",
          location: "Middle East",
          status: "Escalating",
          riskScore: 78,
          marketImpact: 2.3,
          companies: [
            {
              name: "Exxon Mobil",
              symbol: "XOM",
              price: 118.45,
              change: 5.20,
              changePercent: 4.59,
              category: "Energy",
              role: "Oil producer",
              involvement: "Benefiting from higher oil prices due to supply concerns",
              impact: "Increased revenue from elevated oil prices",
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

  clearCache(): void {
    this.cache = null;
    this.lastFetch = null;
  }
}

export const secureApiService = new SecureApiService();
