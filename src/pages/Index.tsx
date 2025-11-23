import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GPTCrisisDashboard from '@/components/GPTCrisisDashboard';
import { FinancialIntelligence } from '@/components/FinancialIntelligence';
import { Activity, DollarSign } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="crisis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crisis" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Crisis Tracker
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Intelligence
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="crisis">
            <GPTCrisisDashboard />
          </TabsContent>
          
          <TabsContent value="financial">
            <FinancialIntelligence />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;