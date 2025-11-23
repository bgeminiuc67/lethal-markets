import Replicate from 'replicate';

const replicate = new Replicate({
  auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
});

export interface ConflictAnalysis {
  severity: 'low' | 'medium' | 'high' | 'critical';
  companies: {
    name: string;
    involvement: 'causation' | 'solution' | 'neutral';
    confidence: number;
    reasoning: string;
  }[];
  riskFactors: string[];
  marketImpact: string;
  summary: string;
}

export class ReplicateService {
  private static instance: ReplicateService;

  static getInstance(): ReplicateService {
    if (!ReplicateService.instance) {
      ReplicateService.instance = new ReplicateService();
    }
    return ReplicateService.instance;
  }

  async analyzeConflict(newsText: string, companies: string[]): Promise<ConflictAnalysis> {
    try {
      const prompt = `
Analyze this conflict/news report and identify corporate involvement:

NEWS: ${newsText}

COMPANIES TO ANALYZE: ${companies.join(', ')}

Please provide a JSON response with:
1. Conflict severity (low/medium/high/critical)
2. For each company, determine:
   - involvement type (causation/solution/neutral)
   - confidence level (0-1)
   - reasoning for the assessment
3. Key risk factors
4. Potential market impact
5. Brief summary

Format as valid JSON only.
`;

      const output = await replicate.run(
        "openai/gpt-5",
        {
          input: {
            prompt: prompt,
            max_tokens: 1000,
            temperature: 0.3
          }
        }
      );

      // Parse the response
      const responseText = Array.isArray(output) ? output.join('') : output as string;
      
      try {
        return JSON.parse(responseText);
      } catch {
        // Fallback parsing if JSON is malformed
        return this.parseAnalysisFromText(responseText, companies);
      }
    } catch (error) {
      console.error('Replicate analysis error:', error);
      throw new Error('Failed to analyze conflict with AI');
    }
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; confidence: number; keywords: string[] }> {
    try {
      const prompt = `
Analyze the sentiment of this text and extract key conflict-related keywords:

TEXT: ${text}

Provide JSON response with:
- sentiment: positive/negative/neutral
- confidence: 0-1
- keywords: array of relevant conflict/business terms

Format as valid JSON only.
`;

      const output = await replicate.run(
        "openai/gpt-5",
        {
          input: {
            prompt: prompt,
            max_tokens: 200,
            temperature: 0.2
          }
        }
      );

      const responseText = Array.isArray(output) ? output.join('') : output as string;
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { sentiment: 'neutral', confidence: 0.5, keywords: [] };
    }
  }

  private parseAnalysisFromText(text: string, companies: string[]): ConflictAnalysis {
    // Fallback parser for non-JSON responses
    const severity = text.toLowerCase().includes('critical') ? 'critical' :
                    text.toLowerCase().includes('high') ? 'high' :
                    text.toLowerCase().includes('medium') ? 'medium' : 'low';

    const companyAnalysis = companies.map(company => ({
      name: company,
      involvement: 'neutral' as const,
      confidence: 0.5,
      reasoning: 'Analysis unavailable'
    }));

    return {
      severity,
      companies: companyAnalysis,
      riskFactors: ['Analysis parsing failed'],
      marketImpact: 'Unable to determine market impact',
      summary: 'AI analysis was incomplete'
    };
  }
}

export const replicateService = ReplicateService.getInstance();
