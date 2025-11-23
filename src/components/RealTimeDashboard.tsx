import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity,
  Globe,
  DollarSign,
  Clock,
  Zap
} from 'lucide-react';
import { realTimeDataManager, RealTimeUpdate, ConflictIntelligence } from '@/services/realTimeDataManager';
import { NewsArticle } from '@/services/newsService';
import { StockData } from '@/services/stockService';
import { Conflict, Company } from '@/types/conflict';

interface RealTimeDashboardProps {
  conflicts: Conflict[];
  companies: Company[];
  selectedConflict: Conflict | null;
}

export const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({
  conflicts,
  companies,
  selectedConflict
}) => {
  const [isActive, setIsActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [recentNews, setRecentNews] = useState<NewsArticle[]>([]);
  const [stockUpdates, setStockUpdates] = useState<Array<{ symbol: string; price: any }>>([]);
  const [conflictIntelligence, setConflictIntelligence] = useState<ConflictIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    const unsubscribe = realTimeDataManager.onUpdate((update: RealTimeUpdate) => {
      setLastUpdate(update.timestamp);
      setUpdateCount(prev => prev + 1);

      switch (update.type) {
        case 'news':
          setRecentNews(update.data.articles?.slice(0, 10) || []);
          break;
        case 'stock':
          setStockUpdates(update.data);
          break;
        case 'analysis':
          // Handle AI analysis updates
          break;
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedConflict && isActive) {
      loadConflictIntelligence();
    }
  }, [selectedConflict, isActive]);

  const handleToggleRealTime = async () => {
    if (isActive) {
      realTimeDataManager.stopRealTimeUpdates();
      setIsActive(false);
    } else {
      setIsLoading(true);
      try {
        await realTimeDataManager.startRealTimeUpdates();
        setIsActive(true);
      } catch (error) {
        console.error('Failed to start real-time updates:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadConflictIntelligence = async () => {
    if (!selectedConflict) return;

    setIsLoading(true);
    try {
      const relatedCompanies = companies.filter(company => 
        company.conflictIds.includes(selectedConflict.id)
      );
      
      const intelligence = await realTimeDataManager.getConflictIntelligence(
        selectedConflict, 
        relatedCompanies
      );
      
      setConflictIntelligence(intelligence);
    } catch (error) {
      console.error('Failed to load conflict intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshNews = async () => {
    setIsLoading(true);
    try {
      await realTimeDataManager.refreshNews();
    } catch (error) {
      console.error('Failed to refresh news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStocks = async () => {
    setIsLoading(true);
    try {
      const symbols = companies.map(c => c.ticker);
      await realTimeDataManager.refreshStockData(symbols);
    } catch (error) {
      console.error('Failed to refresh stocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Control Panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className={`h-6 w-6 ${isActive ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <div>
              <h2 className="text-xl font-semibold">Real-Time Intelligence</h2>
              <p className="text-sm text-muted-foreground">
                {isActive ? 'Live monitoring active' : 'Real-time monitoring disabled'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Last Update</p>
                <p className="font-mono">{formatTimeAgo(lastUpdate)}</p>
              </div>
            )}
            
            <Button
              onClick={handleToggleRealTime}
              disabled={isLoading}
              variant={isActive ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isActive ? 'Stop Live Feed' : 'Start Live Feed'}
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Globe className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">News Updates</p>
              <p className="text-xs text-muted-foreground">{recentNews.length} articles</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Stock Updates</p>
              <p className="text-xs text-muted-foreground">{stockUpdates.length} symbols</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Update Count</p>
              <p className="text-xs text-muted-foreground">{updateCount} total</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">Risk Level</p>
              <p className="text-xs text-muted-foreground">
                {conflictIntelligence ? `${Math.round(conflictIntelligence.riskScore)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Conflict Intelligence */}
      {selectedConflict && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Conflict Intelligence: {selectedConflict.name}</h3>
            <Button
              onClick={loadConflictIntelligence}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Analysis
            </Button>
          </div>

          {conflictIntelligence && (
            <div className="space-y-4">
              {/* Risk Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`p-4 ${getRiskColor(conflictIntelligence.riskScore)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Risk Score</h4>
                    <Badge variant="outline">{Math.round(conflictIntelligence.riskScore)}%</Badge>
                  </div>
                  <Progress value={conflictIntelligence.riskScore} className="mb-2" />
                  <p className="text-xs">
                    {conflictIntelligence.riskScore >= 80 ? 'Critical Risk' :
                     conflictIntelligence.riskScore >= 60 ? 'High Risk' :
                     conflictIntelligence.riskScore >= 40 ? 'Medium Risk' : 'Low Risk'}
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Market Impact</h4>
                    <Badge variant="outline">
                      {conflictIntelligence.marketImpact > 0 ? '+' : ''}
                      {conflictIntelligence.marketImpact.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {conflictIntelligence.marketImpact > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {Math.abs(conflictIntelligence.marketImpact) > 5 ? 'Significant' : 'Moderate'} impact
                    </p>
                  </div>
                </Card>
              </div>

              {/* Company Analysis */}
              <div>
                <h4 className="font-semibold mb-3">Company Analysis</h4>
                <div className="grid gap-3">
                  {conflictIntelligence.companies.map(({ company, stockData, analysis }) => (
                    <Card key={company.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h5 className="font-medium">{company.name}</h5>
                          <Badge 
                            variant={company.involvement === 'causation' ? 'destructive' : 'default'}
                          >
                            {company.involvement}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm">${stockData.currentPrice.price.toFixed(2)}</p>
                          <p className={`text-xs ${stockData.currentPrice.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stockData.currentPrice.changePercent >= 0 ? '+' : ''}
                            {stockData.currentPrice.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      
                      {analysis && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          <p><strong>AI Analysis:</strong> {analysis.summary}</p>
                          {analysis.riskFactors.length > 0 && (
                            <p className="mt-1"><strong>Risk Factors:</strong> {analysis.riskFactors.join(', ')}</p>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Real-Time Data Tabs */}
      <Tabs defaultValue="news" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Live News ({recentNews.length})
          </TabsTrigger>
          <TabsTrigger value="stocks" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Stock Updates ({stockUpdates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Latest Conflict News</h3>
              <Button onClick={handleRefreshNews} disabled={isLoading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentNews.length > 0 ? (
                recentNews.map((article) => (
                  <div key={article.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {article.source}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {article.conflictKeywords.slice(0, 3).map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(article.publishedAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No recent news available. {isActive ? 'Waiting for updates...' : 'Start real-time monitoring to see live news.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stocks" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stock Price Updates</h3>
              <Button onClick={handleRefreshStocks} disabled={isLoading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {stockUpdates.length > 0 ? (
                stockUpdates.map(({ symbol, price }) => (
                  <div key={symbol} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{symbol}</Badge>
                      <span className="font-mono">${price.price?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {price.changePercent >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${price.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {price.changePercent >= 0 ? '+' : ''}{price.changePercent?.toFixed(2) || '0.00'}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    No stock updates available. {isActive ? 'Waiting for market data...' : 'Start real-time monitoring to see live prices.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeDashboard;
