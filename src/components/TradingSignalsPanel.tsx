// Real Trading Signals Panel with live data
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  RefreshCw,
  Target,
  Shield,
  Clock,
  Activity
} from 'lucide-react';
import { TradingSignal } from '@/types/financial';
import { profitPredictorService } from '@/services/profitPredictorService';
import { GPTCrisisService } from '@/services/gptCrisisService';

export const TradingSignalsPanel: React.FC = () => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadTradingSignals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current crisis data
      const gptService = GPTCrisisService.getInstance();
      const crisisData = await gptService.getAllCrisisData();

      if (!crisisData || crisisData.events.length === 0) {
        setError('No crisis data available for signal generation');
        return;
      }

      // Generate trading signals directly from crisis data
      const tradingSignals = await profitPredictorService.generateTradingSignals(crisisData.events);
      
      setSignals(tradingSignals);
      setLastUpdated(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate trading signals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTradingSignals();
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'STRONG_BUY': return 'bg-green-600 text-white';
      case 'BUY': return 'bg-green-500 text-white';
      case 'HOLD': return 'bg-yellow-500 text-white';
      case 'SELL': return 'bg-red-500 text-white';
      case 'STRONG_SELL': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('BUY')) return <TrendingUp className="h-4 w-4" />;
    if (action.includes('SELL')) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'extreme': return 'text-red-600';
      default: return 'text-gray-600';
    }
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

  const getTimeHorizonBadge = (timeHorizon: string) => {
    const colors = {
      short: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      long: 'bg-green-100 text-green-800'
    };
    return colors[timeHorizon as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const SignalCard: React.FC<{ signal: TradingSignal }> = ({ signal }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {signal.symbol}
              <Badge className={getActionColor(signal.action)}>
                {getActionIcon(signal.action)}
                {signal.action.replace('_', ' ')}
              </Badge>
            </CardTitle>
            <CardDescription>
              Crisis-driven trading opportunity
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(signal.expectedReturn)}
            </div>
            <div className="text-sm text-muted-foreground">Expected Return</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Target Price
            </div>
            <div className="text-lg font-semibold">
              {formatCurrency(signal.targetPrice)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Stop Loss
            </div>
            <div className="text-lg font-semibold">
              {formatCurrency(signal.stopLoss)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getTimeHorizonBadge(signal.timeHorizon)}>
              <Clock className="h-3 w-3 mr-1" />
              {signal.timeHorizon}-term
            </Badge>
            <Badge variant="outline" className={getRiskColor(signal.riskLevel)}>
              {signal.riskLevel} risk
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {signal.dataFreshness}min ago
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Crisis Trigger:</div>
          <div className="text-sm text-muted-foreground">
            {signal.crisisTrigger}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Analysis:</div>
          <div className="text-sm text-muted-foreground">
            {signal.reasoning}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-medium text-green-600">
              {formatPercentage(signal.optimisticReturn)}
            </div>
            <div className="text-muted-foreground">Optimistic</div>
          </div>
          <div>
            <div className="font-medium">
              {formatPercentage(signal.mostLikelyReturn)}
            </div>
            <div className="text-muted-foreground">Most Likely</div>
          </div>
          <div>
            <div className="font-medium text-red-600">
              {formatPercentage(signal.pessimisticReturn)}
            </div>
            <div className="text-muted-foreground">Pessimistic</div>
          </div>
        </div>

        <div className="pt-2">
          <Progress value={signal.confidence} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Signal Confidence</span>
            <span>{signal.confidence.toFixed(0)}%</span>
          </div>
        </div>

        {signal.validation.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warnings:</strong> {signal.validation.warnings.join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Trading Signals</h2>
          <p className="text-muted-foreground">
            Crisis-driven buy/sell recommendations powered by AI analysis
          </p>
        </div>
        
        <Button
          onClick={loadTradingSignals}
          disabled={isLoading}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Signals
        </Button>
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

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          <span>Generating trading signals...</span>
        </div>
      ) : signals.length === 0 ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No trading signals available. This could mean markets are stable or no high-confidence opportunities were found.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {signals.map((signal, index) => (
              <SignalCard key={`${signal.symbol}-${index}`} signal={signal} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {signals.filter(s => s.action.includes('BUY')).length}
                </div>
                <div className="text-sm text-muted-foreground">Buy Signals</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {signals.filter(s => s.action.includes('SELL')).length}
                </div>
                <div className="text-sm text-muted-foreground">Sell Signals</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(signals.reduce((sum, s) => sum + s.expectedReturn, 0) / signals.length)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Expected Return</div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> These are AI-generated signals based on crisis analysis. 
          Not financial advice. Always do your own research and consider your risk tolerance before trading.
          Past performance does not guarantee future results.
        </AlertDescription>
      </Alert>
    </div>
  );
};
