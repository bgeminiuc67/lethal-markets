export interface Conflict {
  id: string;
  name: string;
  location: {
    country: string;
    region: string;
    coordinates: [number, number];
  };
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'resolved' | 'escalating' | 'de-escalating';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  casualties?: number;
  affectedPopulation?: number;
  tags: string[];
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  involvement: 'causation' | 'solution' | 'neutral';
  description: string;
  conflictIds: string[];
  stockData: StockData[];
  involvementDetails: string;
  riskScore: number;
}

export interface StockData {
  date: Date;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
}

export interface ConflictAnalysis {
  conflictId: string;
  companiesInvolved: Company[];
  marketImpact: {
    totalMarketCap: number;
    totalVolume: number;
    averageChange: number;
  };
  timelineEvents: TimelineEvent[];
}

export interface TimelineEvent {
  date: Date;
  type: 'conflict_start' | 'escalation' | 'resolution' | 'company_action' | 'market_event';
  title: string;
  description: string;
  conflictId?: string;
  companyId?: string;
  impact: 'positive' | 'negative' | 'neutral';
}