// Home page with navigation to different services
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  Target, 
  PieChart, 
  ArrowRight,
  Zap,
  Shield,
  Brain
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'crisis-tracker',
      title: 'Crisis Tracker',
      description: 'Monitor global crises and conflicts with AI-powered analysis',
      icon: <Activity className="h-8 w-8" />,
      path: '/crisis-tracker',
      status: 'Active',
      statusColor: 'bg-green-500',
      features: ['Real-time crisis monitoring', 'Company involvement analysis', 'Risk assessment']
    },
    {
      id: 'profit-predictor',
      title: 'Profit Predictor',
      description: 'AI identifies companies likely to profit from global crises',
      icon: <Target className="h-8 w-8" />,
      path: '/profit-predictor',
      status: 'New',
      statusColor: 'bg-blue-500',
      features: ['Crisis-driven opportunities', 'Expected returns', 'Investment thesis']
    },
    {
      id: 'trading-signals',
      title: 'Trading Signals',
      description: 'AI-powered buy/sell recommendations based on crisis intelligence',
      icon: <TrendingUp className="h-8 w-8" />,
      path: '/trading-signals',
      status: 'New',
      statusColor: 'bg-orange-500',
      features: ['Buy/sell signals', 'Price targets', 'Risk analysis']
    },
    {
      id: 'portfolio-analysis',
      title: 'Portfolio Analysis',
      description: 'Analyze your portfolio\'s crisis exposure and optimization opportunities',
      icon: <PieChart className="h-8 w-8" />,
      path: '/portfolio-analysis',
      status: 'New',
      statusColor: 'bg-purple-500',
      features: ['Crisis exposure', 'Performance tracking', 'Optimization tips']
    }
  ];

  const ServiceCard: React.FC<{ service: typeof services[0] }> = ({ service }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              {service.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${service.statusColor} text-white`}>
                  {service.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <CardDescription className="text-base mt-2">
          {service.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Key Features:</div>
          <ul className="space-y-1">
            {service.features.map((feature, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <Button 
          onClick={() => navigate(service.path)}
          className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
          variant="outline"
        >
          Open {service.title}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Lethal Markets</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          When tragedies strike, our profits spike
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Claude AI Powered
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Real-time Analysis
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 space-y-4">
          <div className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This platform provides information for educational purposes only. 
            Not financial advice. Always do your own research.
          </div>
          <div className="text-xs text-muted-foreground">
            Powered by AI • Built for transparency • Exposing corporate war profiteering
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
