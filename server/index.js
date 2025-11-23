const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
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
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Import Replicate (dynamic import for security)
    const Replicate = (await import('replicate')).default;
    
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN, // Server-side only!
    });

    const prompt = `Analyze current global crises and conflicts as of ${new Date().toISOString().split('T')[0]}. 

Provide a comprehensive analysis in JSON format with the following structure:

{
  "events": [
    {
      "id": 1,
      "title": "Crisis Title",
      "description": "Detailed description",
      "date": "2024-XX-XX",
      "type": "War|Natural Disaster|Political Crisis|Economic Crisis",
      "severity": "Critical|High|Medium|Low",
      "location": "Country/Region",
      "status": "Ongoing|Escalating|De-escalating|Resolved",
      "riskScore": 85,
      "marketImpact": -2.5,
      "companies": [
        {
          "name": "Company Name",
          "symbol": "TICKER",
          "price": 150.25,
          "change": 5.75,
          "changePercent": 3.98,
          "category": "Arms Supplier|Energy|Cleanup|Insurance|Technology",
          "role": "How they're involved",
          "involvement": "Detailed involvement",
          "impact": "Expected impact on company",
          "confidence": 0.8
        }
      ]
    }
  ]
}

Focus on:
1. Current major conflicts (Ukraine, Middle East, etc.)
2. Companies that profit from these crises
3. Realistic stock prices and recent changes
4. Risk assessment and market impact
5. Corporate involvement and profiteering

Return ONLY valid JSON.`;

    console.log('Making secure API call to GPT-5...');
    
    const input = { prompt };
    const output = await replicate.run("openai/gpt-5", { input });
    
    const responseText = Array.isArray(output) ? output.join('') : String(output);
    
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
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    let prompt = '';
    
    if (analysisType === 'profit-opportunities') {
      prompt = `Based on these crisis events: ${JSON.stringify(crisisData.events.slice(0, 3))}, 
      analyze profit opportunities for investors. Focus on companies that will benefit from these crises.
      
      For each opportunity, provide realistic current stock prices and detailed analysis.
      
      Return JSON with:
      {
        "opportunities": [
          {
            "symbol": "TICKER",
            "companyName": "Company Name",
            "currentPrice": 125.50,
            "profitProbability": 75,
            "expectedReturn": 15.5,
            "timeToProfit": 30,
            "crisisContext": "Which crisis creates this opportunity",
            "investmentThesis": "Detailed explanation of why this company will profit from the crisis",
            "riskFactors": ["Specific risk 1", "Specific risk 2", "Specific risk 3"],
            "targetPrice": 150.00,
            "stopLoss": 110.00,
            "confidence": 80
          }
        ]
      }
      
      Focus on:
      1. Defense contractors during conflicts
      2. Energy companies during supply disruptions
      3. Construction companies for post-crisis rebuilding
      4. Healthcare companies during health crises
      5. Technology companies providing crisis solutions
      
      Provide 10-15 high-quality opportunities with realistic data.`;
    } else if (analysisType === 'trading-signals') {
      prompt = `Generate trading signals based on crisis data: ${JSON.stringify(crisisData.events.slice(0, 2))}.
      
      Provide actionable buy/sell recommendations with realistic prices and detailed reasoning.
      
      Return JSON with:
      {
        "signals": [
          {
            "symbol": "TICKER",
            "action": "BUY|SELL|HOLD|STRONG_BUY|STRONG_SELL",
            "confidence": 85,
            "targetPrice": 150.00,
            "stopLoss": 130.00,
            "timeHorizon": "short|medium|long",
            "reasoning": "Detailed explanation of why this trade makes sense based on crisis analysis",
            "expectedReturn": 12.5,
            "riskLevel": "low|medium|high|extreme",
            "crisisTrigger": "Which crisis event triggered this signal",
            "optimisticReturn": 18.0,
            "pessimisticReturn": 8.0,
            "mostLikelyReturn": 12.5
          }
        ]
      }
      
      Focus on companies that will be immediately impacted by the crises.
      Provide 8-12 high-confidence signals with clear entry/exit strategies.`;
    }

    const input = { prompt };
    const output = await replicate.run("openai/gpt-5", { input });
    const responseText = Array.isArray(output) ? output.join('') : String(output);
    
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
  console.log(`🔒 Secure Unethical server running on port ${PORT}`);
  console.log(`🛡️ API key properly hidden on server-side`);
  console.log(`💰 Financial intelligence endpoints active`);
});
