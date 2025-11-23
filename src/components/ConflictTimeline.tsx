import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimelineEvent } from '@/types/conflict';
import { mockTimelineEvents } from '@/data/mockData';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, Building } from 'lucide-react';

interface ConflictTimelineProps {
  conflictId: string;
}

export const ConflictTimeline: React.FC<ConflictTimelineProps> = ({ conflictId }) => {
  const timelineEvents = mockTimelineEvents
    .filter(event => event.conflictId === conflictId || event.companyId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'conflict_start':
        return AlertTriangle;
      case 'escalation':
        return TrendingUp;
      case 'resolution':
        return TrendingDown;
      case 'company_action':
        return Building;
      case 'market_event':
        return TrendingUp;
      default:
        return Calendar;
    }
  };

  const getEventColor = (impact: TimelineEvent['impact']) => {
    switch (impact) {
      case 'positive':
        return 'border-solution bg-solution/10';
      case 'negative':
        return 'border-conflict bg-conflict/10';
      default:
        return 'border-muted bg-muted/10';
    }
  };

  const getImpactBadge = (impact: TimelineEvent['impact']) => {
    switch (impact) {
      case 'positive':
        return <Badge className="bg-solution text-solution-foreground">Positive</Badge>;
      case 'negative':
        return <Badge className="bg-conflict text-conflict-foreground">Negative</Badge>;
      default:
        return <Badge variant="secondary">Neutral</Badge>;
    }
  };

  if (timelineEvents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Timeline Events</h3>
        <p className="text-muted-foreground">Timeline data will appear here as events are tracked.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Conflict Timeline</h3>
        <Badge variant="outline">{timelineEvents.length} events</Badge>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
        
        <div className="space-y-6">
          {timelineEvents.map((event, index) => {
            const IconComponent = getEventIcon(event.type);
            
            return (
              <div key={index} className="relative flex gap-6">
                {/* Timeline dot */}
                <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background ${getEventColor(event.impact)}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                
                {/* Event content */}
                <Card className="flex-1 p-4 -mt-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        {event.date.toLocaleDateString()}
                      </span>
                      {getImpactBadge(event.impact)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="capitalize">
                      {event.type.replace('_', ' ')}
                    </Badge>
                    {event.conflictId && (
                      <Badge variant="secondary">Conflict Event</Badge>
                    )}
                    {event.companyId && (
                      <Badge variant="secondary">Corporate Action</Badge>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Summary */}
      <Card className="p-6 bg-muted/30">
        <h4 className="font-semibold mb-4">Timeline Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-conflict">
              {timelineEvents.filter(e => e.impact === 'negative').length}
            </p>
            <p className="text-sm text-muted-foreground">Negative Events</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-solution">
              {timelineEvents.filter(e => e.impact === 'positive').length}
            </p>
            <p className="text-sm text-muted-foreground">Positive Events</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {timelineEvents.filter(e => e.impact === 'neutral').length}
            </p>
            <p className="text-sm text-muted-foreground">Neutral Events</p>
          </div>
        </div>
      </Card>
    </div>
  );
};