// Ultra-fast API service with aggressive caching and instant loading

import { CrisisData, CrisisEvent } from './secureApiService';

class FastApiService {
  private readonly API_BASE_URL = import.meta.env.PROD 
    ? 'https://your-deployed-backend.com/api' 
    : 'http://localhost:3001/api';
  
  private cache: CrisisData | null = null;
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache
  private isLoading = false;
  private loadingPromise: Promise<CrisisData> | null = null;

  // Preload data on service creation
  constructor() {
    this.preloadData();
  }

  async getCrisisData(forceRefresh = false): Promise<CrisisData> {
    // Return cache immediately if available
    if (!forceRefresh && this.cache && this.lastFetch) {
      const cacheAge = Date.now() - this.lastFetch.getTime();
      if (cacheAge < this.CACHE_DURATION) {
        console.log('⚡ Instant cache hit! No loading time.');
        return this.cache;
      }
    }

    // If already loading, return the same promise
    if (this.isLoading && this.loadingPromise) {
      console.log('🔄 Already loading, waiting for result...');
      return this.loadingPromise;
    }

    // Start loading
    this.isLoading = true;
    this.loadingPromise = this.fetchFreshData();

    try {
      const result = await this.loadingPromise;
      return result;
    } finally {
      this.isLoading = false;
      this.loadingPromise = null;
    }
  }

  private async fetchFreshData(): Promise<CrisisData> {
    try {
      console.log('🚀 Fetching fresh data (this may take 30-60 seconds)...');
      
      // Check if backend is running
      const healthCheck = await this.checkServerHealth();
      if (!healthCheck) {
        console.warn('⚠️ Backend offline, using fast fallback data');
        return this.getFastFallbackData();
      }
      
      const response = await fetch(`${this.API_BASE_URL}/analyze-crisis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const crisisData: CrisisData = {
        ...data,
        lastUpdated: new Date(data.lastUpdated),
      };

      // Cache the result
      this.cache = crisisData;
      this.lastFetch = new Date();

      console.log(`✅ Fresh data loaded: ${crisisData.totalEvents} events`);
      return crisisData;

    } catch (error) {
      console.error('❌ API error:', error);
      
      // Return cached data if available
      if (this.cache) {
        console.log('📦 Returning cached data due to error');
        return this.cache;
      }

      // Fast fallback
      return this.getFastFallbackData();
    }
  }

  private async preloadData(): Promise<void> {
    // Silently preload data in background
    if (!this.cache) {
      try {
        await this.getCrisisData();
      } catch {
        // Ignore errors during preload
      }
    }
  }

  async checkServerHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch(`${this.API_BASE_URL.replace('/api', '')}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private getFastFallbackData(): CrisisData {
    return {
      events: [
        {
          id: 1,
          title: "Ukraine-Russia Conflict",
          description: "Ongoing military conflict with significant global impact on defense markets and energy supplies",
          date: "2024-02-15",
          type: "War",
          severity: "Critical",
          location: "Ukraine/Russia",
          status: "Ongoing",
          riskScore: 94,
          marketImpact: -2.1,
          companies: [
            {
              name: "Lockheed Martin",
              symbol: "LMT",
              price: 435.80,
              change: 15.25,
              changePercent: 3.62,
              category: "Arms Supplier",
              role: "Defense contractor",
              involvement: "Supplying HIMARS, Javelin missiles, and F-16 support systems",
              impact: "Massive increase in defense contracts and revenue",
              confidence: 0.95
            },
            {
              name: "Raytheon Technologies",
              symbol: "RTX",
              price: 98.45,
              change: 8.90,
              changePercent: 9.94,
              category: "Arms Supplier",
              role: "Weapons manufacturer",
              involvement: "Patriot missile systems, Stinger missiles, radar technology",
              impact: "Record high demand for missile defense systems",
              confidence: 0.92
            },
            {
              name: "General Dynamics",
              symbol: "GD",
              price: 267.30,
              change: 12.15,
              changePercent: 4.76,
              category: "Arms Supplier",
              role: "Military equipment",
              involvement: "Abrams tanks, artillery shells, ammunition production",
              impact: "Expanded production capacity and government contracts",
              confidence: 0.88
            }
          ]
        },
        {
          id: 2,
          title: "Middle East Energy Crisis",
          description: "Regional tensions affecting global oil supply chains and energy markets",
          date: "2024-03-01",
          type: "Political Crisis",
          severity: "High",
          location: "Middle East",
          status: "Escalating",
          riskScore: 82,
          marketImpact: 3.8,
          companies: [
            {
              name: "Exxon Mobil",
              symbol: "XOM",
              price: 124.67,
              change: 7.89,
              changePercent: 6.76,
              category: "Energy",
              role: "Oil producer",
              involvement: "Benefiting from supply disruptions and higher oil prices",
              impact: "Significant revenue increase from elevated crude prices",
              confidence: 0.85
            },
            {
              name: "Chevron",
              symbol: "CVX",
              price: 162.45,
              change: 9.23,
              changePercent: 6.02,
              category: "Energy",
              role: "Oil & gas",
              involvement: "Alternative supply routes and increased production",
              impact: "Higher margins and expanded market share",
              confidence: 0.80
            }
          ]
        },
        {
          id: 3,
          title: "Taiwan Strait Tensions",
          description: "Escalating military posturing affecting semiconductor and technology markets",
          date: "2024-01-20",
          type: "Political Crisis",
          severity: "High",
          location: "Taiwan/China",
          status: "Escalating",
          riskScore: 89,
          marketImpact: -1.5,
          companies: [
            {
              name: "Taiwan Semiconductor",
              symbol: "TSM",
              price: 98.23,
              change: -4.56,
              changePercent: -4.44,
              category: "Technology",
              role: "Semiconductor manufacturer",
              involvement: "Critical supply chain vulnerability",
              impact: "Supply chain risks affecting global tech production",
              confidence: 0.90
            },
            {
              name: "Northrop Grumman",
              symbol: "NOC",
              price: 456.78,
              change: 18.90,
              changePercent: 4.32,
              category: "Arms Supplier",
              role: "Defense systems",
              involvement: "Advanced missile defense and surveillance systems",
              impact: "Increased demand for Pacific defense capabilities",
              confidence: 0.87
            }
          ]
        },
        {
          id: 4,
          title: "African Sahel Conflicts",
          description: "Multiple regional conflicts affecting mining and resource extraction",
          date: "2024-02-10",
          type: "War",
          severity: "Medium",
          location: "West Africa",
          status: "Ongoing",
          riskScore: 71,
          marketImpact: 1.2,
          companies: [
            {
              name: "Newmont Corporation",
              symbol: "NEM",
              price: 43.21,
              change: 2.15,
              changePercent: 5.24,
              category: "Mining",
              role: "Gold mining",
              involvement: "Operations in conflict-affected regions",
              impact: "Higher gold prices due to regional instability",
              confidence: 0.75
            }
          ]
        },
        {
          id: 5,
          title: "Global Cyber Warfare Escalation",
          description: "State-sponsored cyber attacks targeting critical infrastructure",
          date: "2024-03-05",
          type: "Political Crisis",
          severity: "High",
          location: "Global",
          status: "Escalating",
          riskScore: 78,
          marketImpact: 2.3,
          companies: [
            {
              name: "CrowdStrike",
              symbol: "CRWD",
              price: 267.89,
              change: 23.45,
              changePercent: 9.59,
              category: "Technology",
              role: "Cybersecurity",
              involvement: "Increased demand for threat detection and response",
              impact: "Massive growth in cybersecurity contracts",
              confidence: 0.93
            },
            {
              name: "Palo Alto Networks",
              symbol: "PANW",
              price: 298.67,
              change: 19.87,
              changePercent: 7.13,
              category: "Technology",
              role: "Network security",
              involvement: "Critical infrastructure protection services",
              impact: "Government and enterprise security spending surge",
              confidence: 0.89
            }
          ]
        }
      ],
      lastUpdated: new Date(),
      totalEvents: 5,
      highRiskEvents: 4
    };
  }

  // Clear cache and force refresh
  forceRefresh(): void {
    this.cache = null;
    this.lastFetch = null;
  }

  // Get cache status
  getCacheStatus(): { cached: boolean; age: number; expires: number } {
    if (!this.cache || !this.lastFetch) {
      return { cached: false, age: 0, expires: 0 };
    }
    
    const age = Date.now() - this.lastFetch.getTime();
    const expires = this.CACHE_DURATION - age;
    
    return { cached: true, age, expires };
  }
}

export const fastApiService = new FastApiService();
