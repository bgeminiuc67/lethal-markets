import { Conflict, Company, StockData, ConflictAnalysis, TimelineEvent } from '@/types/conflict';

// Mock conflicts data
export const mockConflicts: Conflict[] = [
  {
    id: 'ukraine-russia-2022',
    name: 'Russia-Ukraine War',
    location: {
      country: 'Ukraine',
      region: 'Eastern Europe',
      coordinates: [31.1656, 48.3794]
    },
    startDate: new Date('2022-02-24'),
    status: 'active',
    severity: 'critical',
    description: 'Full-scale military invasion of Ukraine by Russia',
    casualties: 500000,
    affectedPopulation: 43000000,
    tags: ['war', 'invasion', 'energy crisis', 'grain exports']
  },
  {
    id: 'israel-palestine-2023',
    name: 'Israel-Palestine Conflict',
    location: {
      country: 'Palestine',
      region: 'Middle East',
      coordinates: [34.8516, 31.8468]
    },
    startDate: new Date('2023-10-07'),
    status: 'active',
    severity: 'critical',
    description: 'Escalated conflict in Gaza and West Bank',
    casualties: 50000,
    affectedPopulation: 5000000,
    tags: ['territorial dispute', 'humanitarian crisis']
  },
  {
    id: 'myanmar-civil-war',
    name: 'Myanmar Civil War',
    location: {
      country: 'Myanmar',
      region: 'Southeast Asia',
      coordinates: [95.9560, 21.9162]
    },
    startDate: new Date('2021-02-01'),
    status: 'active',
    severity: 'high',
    description: 'Military coup and subsequent civil unrest',
    casualties: 30000,
    affectedPopulation: 54000000,
    tags: ['military coup', 'democracy', 'civil unrest']
  }
];

// Generate mock stock data
const generateStockData = (startPrice: number, startDate: Date, volatility: number = 0.02): StockData[] => {
  const data: StockData[] = [];
  let currentPrice = startPrice;
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 365; i++) {
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    currentPrice += change;
    const changePercent = (change / (currentPrice - change)) * 100;
    
    data.push({
      date: new Date(currentDate),
      price: currentPrice,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      change,
      changePercent
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
};

// Mock companies data
export const mockCompanies: Company[] = [
  {
    id: 'lockheed-martin',
    name: 'Lockheed Martin Corporation',
    ticker: 'LMT',
    sector: 'Defense',
    involvement: 'solution',
    description: 'Major defense contractor providing military equipment to Ukraine',
    conflictIds: ['ukraine-russia-2022'],
    stockData: generateStockData(450, new Date('2022-02-24'), 0.025),
    involvementDetails: 'Supplying HIMARS, Javelin missiles, and F-16 parts to Ukraine defense forces',
    riskScore: 3.2
  },
  {
    id: 'gazprom',
    name: 'Gazprom',
    ticker: 'GAZP',
    sector: 'Energy',
    involvement: 'causation',
    description: 'Russian state energy company funding military operations through oil revenues',
    conflictIds: ['ukraine-russia-2022'],
    stockData: generateStockData(280, new Date('2022-02-24'), 0.04),
    involvementDetails: 'State-owned energy giant providing significant revenue to Russian government war effort',
    riskScore: 8.7
  },
  {
    id: 'raytheon',
    name: 'Raytheon Technologies',
    ticker: 'RTX',
    sector: 'Defense',
    involvement: 'solution',
    description: 'Defense technology company providing air defense systems',
    conflictIds: ['ukraine-russia-2022', 'israel-palestine-2023'],
    stockData: generateStockData(95, new Date('2022-02-24'), 0.022),
    involvementDetails: 'Manufacturing Patriot missile systems and Iron Dome components',
    riskScore: 2.8
  },
  {
    id: 'total-energies',
    name: 'TotalEnergies SE',
    ticker: 'TTE',
    sector: 'Energy',
    involvement: 'neutral',
    description: 'French multinational energy company with complex regional exposure',
    conflictIds: ['ukraine-russia-2022'],
    stockData: generateStockData(52, new Date('2022-02-24'), 0.035),
    involvementDetails: 'Withdrew from Russian operations but maintains energy trading relationships',
    riskScore: 5.4
  },
  {
    id: 'palantir',
    name: 'Palantir Technologies',
    ticker: 'PLTR',
    sector: 'Technology',
    involvement: 'solution',
    description: 'Data analytics company providing intelligence capabilities',
    conflictIds: ['ukraine-russia-2022'],
    stockData: generateStockData(12, new Date('2022-02-24'), 0.05),
    involvementDetails: 'Providing AI-powered intelligence and battlefield analytics to Ukrainian forces',
    riskScore: 4.1
  },
  {
    id: 'myanmar-economic-corp',
    name: 'Myanmar Economic Corporation',
    ticker: 'MEC',
    sector: 'Conglomerate',
    involvement: 'causation',
    description: 'Military-controlled conglomerate supporting the junta',
    conflictIds: ['myanmar-civil-war'],
    stockData: generateStockData(45, new Date('2021-02-01'), 0.06),
    involvementDetails: 'Military-owned business empire funding coup operations and suppression',
    riskScore: 9.2
  }
];

// Mock timeline events
export const mockTimelineEvents: TimelineEvent[] = [
  {
    date: new Date('2022-02-24'),
    type: 'conflict_start',
    title: 'Russia Invades Ukraine',
    description: 'Full-scale military invasion begins',
    conflictId: 'ukraine-russia-2022',
    impact: 'negative'
  },
  {
    date: new Date('2022-03-15'),
    type: 'company_action',
    title: 'Lockheed Martin Increases Production',
    description: 'Ramped up Javelin missile production for Ukraine aid',
    companyId: 'lockheed-martin',
    impact: 'positive'
  },
  {
    date: new Date('2022-04-10'),
    type: 'market_event',
    title: 'Energy Prices Surge',
    description: 'Oil and gas prices reach multi-year highs',
    impact: 'negative'
  },
  {
    date: new Date('2023-10-07'),
    type: 'conflict_start',
    title: 'Hamas Attacks Israel',
    description: 'Large-scale coordinated attack from Gaza',
    conflictId: 'israel-palestine-2023',
    impact: 'negative'
  }
];

export const mockConflictAnalysis: ConflictAnalysis[] = [
  {
    conflictId: 'ukraine-russia-2022',
    companiesInvolved: mockCompanies.filter(c => c.conflictIds.includes('ukraine-russia-2022')),
    marketImpact: {
      totalMarketCap: 2500000000000,
      totalVolume: 50000000,
      averageChange: -12.5
    },
    timelineEvents: mockTimelineEvents.filter(e => e.conflictId === 'ukraine-russia-2022')
  }
];