'use client';

import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendData {
  date: string;
  sybil: number;
  sensor: number;
}

interface ThreatTrendChartProps {
  data: TrendData[];
}

const chartConfig = {
  sybil: {
    label: 'Sybil Attacks',
    color: 'hsl(var(--primary))',
  },
  sensor: {
    label: 'Sensor Spoofing',
    color: 'hsl(var(--accent))',
  },
};

export function ThreatTrendChart({ data }: ThreatTrendChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Security Threat Trends</CardTitle>
        <CardDescription>Consolidated volume of malicious activities over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line 
                type="monotone" 
                dataKey="sybil" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="sensor" 
                stroke="hsl(var(--accent))" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'hsl(var(--accent))' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
