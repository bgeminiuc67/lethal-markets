// Crisis Tracker page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import GPTCrisisDashboard from '@/components/GPTCrisisDashboard';

export const CrisisTracker: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Crisis Tracker</h1>
            <p className="text-muted-foreground">Monitor global crises and corporate involvement</p>
          </div>
        </div>
        
        <GPTCrisisDashboard />
      </div>
    </div>
  );
};

export default CrisisTracker;
