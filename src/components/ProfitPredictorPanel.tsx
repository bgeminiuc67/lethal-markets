// Real Profit Predictor Panel with live data
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  DollarSign, 
  Clock,
  BarChart3,
  RefreshCw,
  Zap
} from 'lucide-react';
import { profitPredictorService, RealTimeOpportunity, MarketSector } from '@/services/profitPredictorService';
import { GPTCrisisService } from '@/services/gptCrisisService';

export const ProfitPredictorPanel: React.FC = () => {
  const [opportunities, setOpportunities] = useState<RealTimeOpportunity[]>([]);
  const [sectors, setSectors] = useState<MarketSector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadProfitOpportunities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current crisis data
      const gptService = GPTCrisisService.getInstance();
      const crisisData = await gptService.getAllCrisisData();

      if (!crisisData || crisisData.events.length === 0) {
        setError('No crisis data available for analysis');
        return;
      }

      // Analyze profit opportunities
      const profitOpportunities = await profitPredictorService.analyzeProfitOpportunities(crisisData.events);
      const sectorAnalysis = await profitPredictorService.getSectorAnalysis();

      setOpportunities(profitOpportunities);
      setSectors(sectorAnalysis);
      setLastUpdated(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profit opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfitOpportunities();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadProfitOpportunities();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const OpportunityCard: React.FC<{ opportunity: RealTimeOpportunity }> = ({ opportunity }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{opportunity.companyName}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant="outline">{opportunity.symbol}</Badge>
              <span>{formatCurrency(opportunity.currentPrice)}</span>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getProbabilityColor(opportunity.profitProbability)}`}>
              {opportunity.profitProbability.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Profit Probability</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Expected Return
            </div>
            <div className="text-lg font-semibold text-green-600">
              {formatPercentage(opportunity.expectedReturn)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Time to Profit
            </div>
            <div className="text-lg font-semibold">
              {opportunity.timeToProfit} days
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Entry: {formatCurrency(opportunity.entryPrice)}</span>
            <span>Target: {formatCurrency(opportunity.targetPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Stop Loss: {formatCurrency(opportunity.stopLoss)}</span>
            <span className="text-muted-foreground">
              Confidence: {opportunity.confidence.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Crisis Context:</div>
          <div className="text-sm text-muted-foreground">
            {opportunity.crisisContext}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Investment Thesis:</div>
          <div className="text-sm text-muted-foreground">
            {opportunity.investmentThesis}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Key Risks:</div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {opportunity.riskFactors.slice(0, 3).map((risk, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500" />
                {risk}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2">
          <Progress value={opportunity.confidence} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Confidence Score</span>
            <span>{opportunity.confidence.toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SectorCard: React.FC<{ sector: MarketSector }> = ({ sector }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{sector.name}</CardTitle>
        <CardDescription>Crisis exposure and performance metrics</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-500">
              {sector.crisisExposure}%
            </div>
            <div className="text-xs text-muted-foreground">Crisis Exposure</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(sector.averageReturn)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Return</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {sector.volatility.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Volatility</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Crisis Exposure</div>
          <Progress value={sector.crisisExposure} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Crisis Profit Predictor</h2>
          <p className="text-muted-foreground">
            AI-powered analysis of profit opportunities from global crises
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-500' : ''}`} />
            Auto Refresh
          </Button>
          
          <Button
            onClick={loadProfitOpportunities}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastUpdated && (
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">
            <Target className="h-4 w-4 mr-2" />
            Opportunities ({opportunities.length})
          </TabsTrigger>
          <TabsTrigger value="sectors">
            <BarChart3 className="h-4 w-4 mr-2" />
            Sector Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin mr-2" />
              <span>Analyzing profit opportunities...</span>
            </div>
          ) : opportunities.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No profit opportunities found. This could mean markets are stable or crisis data is unavailable.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.map((opportunity, index) => (
                <OpportunityCard key={`${opportunity.symbol}-${index}`} opportunity={opportunity} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectors.map((sector, index) => (
              <SectorCard key={index} sector={sector} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Risk Warning:</strong> These predictions are based on AI analysis and historical patterns. 
          Past performance does not guarantee future results. Always conduct your own research and consider 
          consulting a financial advisor before making investment decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
};
