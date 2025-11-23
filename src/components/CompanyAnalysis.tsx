import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Company } from '@/types/conflict';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';

interface CompanyAnalysisProps {
  companies: Company[];
  type: 'causation' | 'solution';
}

export const CompanyAnalysis: React.FC<CompanyAnalysisProps> = ({ companies, type }) => {
  const getLatestPrice = (company: Company) => {
    return company.stockData[company.stockData.length - 1]?.price || 0;
  };

  const getPerformance = (company: Company) => {
    const latest = company.stockData[company.stockData.length - 1]?.price || 0;
    const initial = company.stockData[0]?.price || 0;
    return ((latest - initial) / initial) * 100;
  };

  const getRiskColor = (score: number) => {
    if (score >= 7) return 'text-conflict';
    if (score >= 4) return 'text-warning';
    return 'text-solution';
  };

  const typeConfig = {
    causation: {
      title: 'Companies Contributing to Conflict',
      description: 'Organizations identified as having direct or indirect involvement in conflict causation',
      icon: TrendingDown,
      color: 'conflict'
    },
    solution: {
      title: 'Companies Providing Solutions',
      description: 'Organizations contributing to conflict resolution, humanitarian aid, or defensive capabilities',
      icon: TrendingUp,
      color: 'solution'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  if (companies.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <IconComponent className={`h-12 w-12 text-${config.color}`} />
          <div>
            <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
            <p className="text-muted-foreground">No companies identified in this category yet.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <IconComponent className={`h-6 w-6 text-${config.color} mt-1`} />
        <div>
          <h3 className="text-lg font-semibold mb-1">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companies.map((company) => {
          const performance = getPerformance(company);
          const latestPrice = getLatestPrice(company);
          
          return (
            <Card key={company.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold">{company.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{company.ticker}</Badge>
                    <Badge variant="secondary">{company.sector}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${latestPrice.toFixed(2)}</p>
                  <p className={`text-sm font-medium ${performance >= 0 ? 'text-solution' : 'text-conflict'}`}>
                    {performance >= 0 ? '+' : ''}{performance.toFixed(2)}%
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{company.description}</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Risk Score</span>
                    <span className={`text-sm font-bold ${getRiskColor(company.riskScore)}`}>
                      {company.riskScore}/10
                    </span>
                  </div>
                  <Progress 
                    value={company.riskScore * 10} 
                    className="h-2"
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                    <span className="text-sm font-medium">Involvement Details</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{company.involvementDetails}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Market Cap</p>
                      <p className="font-medium">
                        ${(latestPrice * Math.random() * 1000000000).toLocaleString('en', {
                          notation: 'compact',
                          compactDisplay: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Volatility</p>
                      <p className="font-medium">
                        {(Math.random() * 50 + 10).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <Card className="p-6 bg-muted/30">
        <h4 className="text-lg font-semibold mb-4">Category Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{companies.length}</p>
            <p className="text-sm text-muted-foreground">Companies</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              ${companies.reduce((sum, company) => sum + getLatestPrice(company) * 1000000, 0).toLocaleString('en', {
                notation: 'compact',
                compactDisplay: 'short'
              })}
            </p>
            <p className="text-sm text-muted-foreground">Combined Value</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${
              companies.reduce((sum, company) => sum + getPerformance(company), 0) / companies.length >= 0 
                ? 'text-solution' : 'text-conflict'
            }`}>
              {((companies.reduce((sum, company) => sum + getPerformance(company), 0) / companies.length) || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Avg Performance</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${getRiskColor(
              companies.reduce((sum, company) => sum + company.riskScore, 0) / companies.length
            )}`}>
              {((companies.reduce((sum, company) => sum + company.riskScore, 0) / companies.length) || 0).toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">Avg Risk Score</p>
          </div>
        </div>
      </Card>
    </div>
  );
};