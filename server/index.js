const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Anthropic = require('@anthropic-ai/sdk').default;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting - prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Secure crisis analysis endpoint
app.post('/api/analyze-crisis', async (req, res) => {
  try {
    // Validate request
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY, // Server-side only!
    });

    const prompt = `Current global crises (${new Date().toISOString().split('T')[0]}) with profiteering companies.

Return JSON (5-7 events):
{
  "events": [{
    "id": 1,
    "title": "Crisis name",
    "description": "Brief desc",
    "date": "2024-XX-XX",
    "type": "War|Natural Disaster|Political Crisis|Economic Crisis",
    "severity": "Critical|High|Medium|Low",
    "location": "Region",
    "status": "Ongoing|Escalating|De-escalating",
    "riskScore": 85,
    "marketImpact": -2.5,
    "companies": [{
      "name": "Company",
      "symbol": "TICK",
      "price": 150.25,
      "change": 5.75,
      "changePercent": 3.98,
      "category": "Arms Supplier|Energy|Cleanup|Insurance|Technology",
      "role": "Role",
      "involvement": "How involved",
      "impact": "Impact",
      "confidence": 0.8
    }]
  }]
}

Major conflicts: Ukraine, Middle East, China-Taiwan. Include 3-5 companies per crisis with realistic stock data. JSON only.`;

    console.log('Making secure API call to Claude...');
    
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const responseText = message.content[0].text;
    
    // Clean and validate JSON response
    const cleanedResponse = cleanJsonResponse(responseText);
    let parsedData;
    
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return fallback data if parsing fails
      parsedData = getFallbackData();
    }

    // Process and return secure response
    const crisisData = {
      events: processEvents(parsedData.events || []),
      lastUpdated: new Date(),
      totalEvents: parsedData.events?.length || 0,
      highRiskEvents: parsedData.events?.filter(e => e.riskScore >= 70).length || 0
    };

    res.json(crisisData);

  } catch (error) {
    console.error('Crisis analysis error:', error);
    
    // Don't expose internal errors to client
    res.status(500).json({ 
      error: 'Analysis temporarily unavailable',
      fallback: getFallbackData()
    });
  }
});

// Utility functions
function cleanJsonResponse(response) {
  let cleaned = response.trim();
  
  // Remove any markdown code blocks
  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Find JSON object boundaries
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}') + 1;
  
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd);
  }
  
  return cleaned;
}

function processEvents(events) {
  return events.map(event => ({
    ...event,
    id: event.id || Math.floor(Math.random() * 10000),
    companies: event.companies?.map(company => ({
      ...company,
      price: parseFloat(company.price) || 100,
      change: parseFloat(company.change) || 0,
      changePercent: parseFloat(company.changePercent) || 0,
      confidence: parseFloat(company.confidence) || 0.5
    })) || []
  }));
}

function getFallbackData() {
  return {
    events: [
      {
        id: 1,
        title: "Ukraine-Russia Conflict",
        description: "Ongoing military conflict affecting global markets and defense spending",
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
      }
    ]
  };
}

// Removed stock endpoint - using simulated prices in frontend

// Financial analysis endpoint
app.post('/api/analyze-financial', async (req, res) => {
  try {
    const { crisisData, analysisType } = req.body;
    
    if (!crisisData || !analysisType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate request
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    let prompt = '';
    
    if (analysisType === 'profit-opportunities') {
      prompt = `Analyze profit opportunities from these crises: ${JSON.stringify(crisisData.events.slice(0, 3))}.

Return JSON (10-12 opportunities):
{
  "opportunities": [{
    "symbol": "TICKER",
    "companyName": "Name",
    "currentPrice": 125.50,
    "profitProbability": 75,
    "expectedReturn": 15.5,
    "timeToProfit": 30,
    "crisisContext": "Crisis link",
    "investmentThesis": "Why profitable",
    "riskFactors": ["risk1", "risk2", "risk3"],
    "targetPrice": 150.00,
    "stopLoss": 110.00,
    "confidence": 80
  }]
}

Focus: Defense, Energy, Construction, Healthcare, Tech. Realistic prices only.`;
    } else if (analysisType === 'trading-signals') {
      prompt = `Trading signals from: ${JSON.stringify(crisisData.events.slice(0, 2))}.

Return JSON (8-10 signals):
{
  "signals": [{
    "symbol": "TICKER",
    "action": "BUY|SELL|STRONG_BUY|STRONG_SELL|HOLD",
    "confidence": 85,
    "targetPrice": 150.00,
    "stopLoss": 130.00,
    "timeHorizon": "short|medium|long",
    "reasoning": "Why this trade",
    "expectedReturn": 12.5,
    "riskLevel": "low|medium|high|extreme",
    "crisisTrigger": "Crisis cause",
    "optimisticReturn": 18.0,
    "pessimisticReturn": 8.0,
    "mostLikelyReturn": 12.5
  }]
}

High-confidence signals only.`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const responseText = message.content[0].text;
    
    // Clean and parse JSON
    const cleanedResponse = cleanJsonResponse(responseText);
    let parsedData;
    
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Financial analysis JSON parse error:', parseError);
      parsedData = { opportunities: [], signals: [] };
    }

    res.json({
      ...parsedData,
      lastUpdated: new Date(),
      analysisType
    });

  } catch (error) {
    console.error('Financial analysis error:', error);
    res.status(500).json({ 
      error: 'Financial analysis temporarily unavailable',
      opportunities: [],
      signals: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔒 Secure Lethal Markets server running on port ${PORT}`);
  console.log(`🛡️ API key properly hidden on server-side`);
  console.log(`💰 Financial intelligence endpoints active`);
  console.log(`🤖 Claude AI integration active`);
});
