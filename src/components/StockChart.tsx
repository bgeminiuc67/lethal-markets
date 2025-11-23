import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { StockData } from '@/types/conflict';
import { Card } from '@/components/ui/card';

interface StockChartProps {
  stockData: StockData[];
  companyName: string;
  ticker: string;
  conflictStartDate: Date;
  involvement: 'causation' | 'solution' | 'neutral';
}

export const StockChart: React.FC<StockChartProps> = ({
  stockData,
  companyName,
  ticker,
  conflictStartDate,
  involvement
}) => {
  const chartData = stockData.map(data => ({
    date: data.date.toISOString().split('T')[0],
    price: data.price,
    volume: data.volume,
    timestamp: data.date.getTime()
  }));

  const conflictTimestamp = conflictStartDate.getTime();
  const latestPrice = stockData[stockData.length - 1]?.price || 0;
  const initialPrice = stockData[0]?.price || 0;
  const totalChange = ((latestPrice - initialPrice) / initialPrice) * 100;

  const lineColor = {
    causation: 'hsl(var(--conflict))',
    solution: 'hsl(var(--solution))',
    neutral: 'hsl(var(--neutral))'
  }[involvement];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">
            Price: <span className="font-semibold">${payload[0].value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{companyName}</h3>
          <p className="text-sm text-muted-foreground">{ticker}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">${latestPrice.toFixed(2)}</p>
          <p className={`text-sm font-medium ${totalChange >= 0 ? 'text-solution' : 'text-conflict'}`}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              x={conflictStartDate.toISOString().split('T')[0]}
              stroke="hsl(var(--warning))"
              strokeDasharray="2 2"
              label={{ value: "Conflict Start", position: "top" }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: lineColor, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between text-sm text-muted-foreground">
        <span>Since conflict start: {conflictStartDate.toLocaleDateString()}</span>
        <span className={`font-medium ${
          involvement === 'causation' ? 'text-conflict' : 
          involvement === 'solution' ? 'text-solution' : 
          'text-neutral'
        }`}>
          {involvement === 'causation' ? 'Causation' : 
           involvement === 'solution' ? 'Solution' : 
           'Neutral'}
        </span>
      </div>
    </Card>
  );
};