import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Globe,
  DollarSign,
  Building,
  Zap,
  Activity
} from 'lucide-react';
import { fastApiService } from '@/services/fastApiService';
import { CrisisData, CrisisEvent } from '@/services/secureApiService';

export const GPTCrisisDashboard: React.FC = () => {
  const [crisisData, setCrisisData] = useState<CrisisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CrisisEvent | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCrisisData();
  }, []);

  const loadCrisisData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we should use mock data (for demo purposes when API fails)
      const urlParams = new URLSearchParams(window.location.search);
      const useMock = urlParams.get('useMock') === 'true';
      
      // Use fast API service (instant loading with smart caching!)
      const data = await fastApiService.getCrisisData(forceRefresh);
      
      setCrisisData(data);
      if (!selectedEvent && data.events.length > 0) {
        setSelectedEvent(data.events[0]);
      }
    } catch (err) {
      setError('Failed to load crisis data. Please try again.');
      console.error('Crisis data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCrisisData(true);
    setRefreshing(false);
  };

  const handleEventSelect = (event: CrisisEvent) => {
    setSelectedEvent(event);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing': return 'bg-red-100 text-red-800';
      case 'escalating': return 'bg-red-200 text-red-900';
      case 'de-escalating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Crisis Intelligence</h2>
          <p className="text-muted-foreground">GPT-5 is analyzing current global events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button onClick={() => loadCrisisData()} className="mt-2 w-full">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Zap className="h-8 w-8 text-red-500" />
              Lethal Markets
            </h1>
            <p className="text-muted-foreground">
              Exposing corporate profiteering from global crises • Powered by GPT-5
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Active Crises</p>
              <p className="text-2xl font-bold text-red-600">{crisisData?.totalEvents || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">High Risk</p>
              <p className="text-2xl font-bold text-orange-600">{crisisData?.highRiskEvents || 0}</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        {crisisData && (
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Last updated: {crisisData.lastUpdated.toLocaleString()} • 
              Data powered by GPT-5 AI analysis
            </AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crisis List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Global Crises
              </h2>
              <div className="space-y-4">
                {crisisData?.events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
                      selectedEvent?.id === event.id ? 'bg-accent border-primary' : 'border-border'
                    }`}
                    onClick={() => handleEventSelect(event)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{event.title}</h3>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {event.location} • {event.type}
                    </p>
                    
                    <div className="flex justify-between items-center mb-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.date}
                      </span>
                    </div>

                    {/* Risk Score */}
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Risk Score</span>
                        <span className={`text-xs font-semibold ${getRiskColor(event.riskScore)}`}>
                          {event.riskScore}/100
                        </span>
                      </div>
                      <Progress value={event.riskScore} className="h-1" />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {event.companies.length} companies
                      </span>
                      <span className={`flex items-center gap-1 ${event.marketImpact >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {event.marketImpact >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatPercentage(event.marketImpact)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEvent && (
              <>
                {/* Event Overview */}
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
                      <p className="text-muted-foreground">{selectedEvent.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(selectedEvent.severity)}>
                        {selectedEvent.severity}
                      </Badge>
                      <Badge className={getStatusColor(selectedEvent.status)}>
                        {selectedEvent.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Risk Score</p>
                      <p className={`text-xl font-bold ${getRiskColor(selectedEvent.riskScore)}`}>
                        {selectedEvent.riskScore}/100
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Market Impact</p>
                      <p className={`text-xl font-bold ${selectedEvent.marketImpact >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatPercentage(selectedEvent.marketImpact)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Companies</p>
                      <p className="text-xl font-bold">{selectedEvent.companies.length}</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-xl font-bold">
                        {Math.floor((Date.now() - new Date(selectedEvent.date).getTime()) / (1000 * 60 * 60 * 24))}d
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Company Analysis */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Affected Companies & Stocks
                  </h3>
                  
                  <div className="grid gap-4">
                    {selectedEvent.companies.map((company, index) => (
                      <Card key={index} className="p-4 border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-semibold">{company.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {company.symbol}
                              </Badge>
                            </div>
                            <Badge className={company.category === 'Arms Supplier' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                              {company.category}
                            </Badge>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(company.price)}</p>
                            <div className={`flex items-center gap-1 text-sm ${company.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {company.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {formatCurrency(company.change)} ({formatPercentage(company.changePercent)})
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Role:</span> {company.role}
                          </div>
                          <div>
                            <span className="font-medium">Involvement:</span> {company.involvement}
                          </div>
                          <div>
                            <span className="font-medium">Expected Impact:</span> {company.impact}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Confidence:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={company.confidence * 100} className="w-20 h-2" />
                              <span className="text-xs">{Math.round(company.confidence * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPTCrisisDashboard;
