import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConflictMap } from './ConflictMap';
import { StockChart } from './StockChart';
import { CompanyAnalysis } from './CompanyAnalysis';
import { ConflictTimeline } from './ConflictTimeline';
import RealTimeDashboard from './RealTimeDashboard';
import { Conflict, Company } from '@/types/conflict';
import { mockConflicts, mockCompanies } from '@/data/mockData';
import { AlertTriangle, TrendingUp, TrendingDown, Building, Users } from 'lucide-react';

export const ConflictDashboard: React.FC = () => {
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(mockConflicts[0]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-conflict text-conflict-foreground';
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-conflict text-conflict-foreground';
      case 'escalating': return 'bg-destructive text-destructive-foreground';
      case 'de-escalating': return 'bg-warning text-warning-foreground';
      case 'resolved': return 'bg-solution text-solution-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const relatedCompanies = selectedConflict 
    ? mockCompanies.filter(company => company.conflictIds.includes(selectedConflict.id))
    : [];

  const causationCompanies = relatedCompanies.filter(c => c.involvement === 'causation');
  const solutionCompanies = relatedCompanies.filter(c => c.involvement === 'solution');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Global Conflict Tracker</h1>
            <p className="text-muted-foreground">
              Monitoring conflicts and corporate involvement worldwide
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Active Conflicts</p>
              <p className="text-2xl font-bold text-conflict">{mockConflicts.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Companies Tracked</p>
              <p className="text-2xl font-bold">{mockCompanies.length}</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conflict List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-conflict" />
                Active Conflicts
              </h2>
              <div className="space-y-4">
                {mockConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
                      selectedConflict?.id === conflict.id ? 'bg-accent border-primary' : 'border-border'
                    }`}
                    onClick={() => setSelectedConflict(conflict)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm">{conflict.name}</h3>
                      <div className="flex gap-1">
                        <Badge className={getSeverityColor(conflict.severity)}>
                          {conflict.severity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {conflict.location.country} • {conflict.location.region}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge className={getStatusColor(conflict.status)}>
                        {conflict.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {conflict.startDate.toLocaleDateString()}
                      </span>
                    </div>
                    {conflict.casualties && (
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {conflict.casualties.toLocaleString()} casualties
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Map and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Conflict Details */}
            {selectedConflict && (
              <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedConflict.name}</h2>
                    <p className="text-muted-foreground">{selectedConflict.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(selectedConflict.severity)}>
                      {selectedConflict.severity}
                    </Badge>
                    <Badge className={getStatusColor(selectedConflict.status)}>
                      {selectedConflict.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-semibold">{selectedConflict.startDate.toLocaleDateString()}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">
                      {Math.floor((Date.now() - selectedConflict.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                  {selectedConflict.casualties && (
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Casualties</p>
                      <p className="font-semibold text-conflict">{selectedConflict.casualties.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Companies</p>
                    <p className="font-semibold">{relatedCompanies.length}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {selectedConflict.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Map */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Global Conflict Map</h2>
              <div className="h-96">
                <ConflictMap 
                  conflicts={mockConflicts}
                  onConflictSelect={setSelectedConflict}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Company Analysis Tabs */}
        {selectedConflict && relatedCompanies.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Analysis: {selectedConflict.name}
            </h2>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="realtime">Real-Time</TabsTrigger>
                <TabsTrigger value="causation">Causation ({causationCompanies.length})</TabsTrigger>
                <TabsTrigger value="solutions">Solutions ({solutionCompanies.length})</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4 bg-conflict/10 border-conflict/20">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-8 w-8 text-conflict" />
                      <div>
                        <p className="text-sm text-muted-foreground">Causation Companies</p>
                        <p className="text-2xl font-bold text-conflict">{causationCompanies.length}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-solution/10 border-solution/20">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-solution" />
                      <div>
                        <p className="text-sm text-muted-foreground">Solution Companies</p>
                        <p className="text-2xl font-bold text-solution">{solutionCompanies.length}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Market Cap</p>
                        <p className="text-2xl font-bold">$2.5T</p>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {relatedCompanies.slice(0, 4).map((company) => (
                    <StockChart
                      key={company.id}
                      stockData={company.stockData}
                      companyName={company.name}
                      ticker={company.ticker}
                      conflictStartDate={selectedConflict.startDate}
                      involvement={company.involvement}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="realtime" className="mt-6">
                <RealTimeDashboard 
                  conflicts={mockConflicts}
                  companies={mockCompanies}
                  selectedConflict={selectedConflict}
                />
              </TabsContent>
              
              <TabsContent value="causation" className="mt-6">
                <CompanyAnalysis companies={causationCompanies} type="causation" />
              </TabsContent>
              
              <TabsContent value="solutions" className="mt-6">
                <CompanyAnalysis companies={solutionCompanies} type="solution" />
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <ConflictTimeline conflictId={selectedConflict.id} />
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
};