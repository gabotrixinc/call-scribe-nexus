
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCallsService } from '@/hooks/useCallsService';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-lg border-white/10 shadow-xl">
        <p className="text-sm font-medium">{`${label}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const CallQualityChart: React.FC = () => {
  const { callMetrics } = useCallsService();

  // Procesar las métricas para mostrar promedios
  const processedData = React.useMemo(() => {
    if (!callMetrics) return [];

    const metricGroups = callMetrics.reduce((acc: any, metric: any) => {
      if (!acc[metric.metric_type]) {
        acc[metric.metric_type] = {
          total: 0,
          count: 0
        };
      }
      acc[metric.metric_type].total += metric.value;
      acc[metric.metric_type].count += 1;
      return acc;
    }, {});

    return Object.entries(metricGroups).map(([metric, data]: [string, any]) => ({
      metric,
      score: Math.round(data.total / data.count),
      color: `hsla(${Math.random() * 360}, 80%, 65%, 1)`
    }));
  }, [callMetrics]);

  return (
    <Card className="col-span-full xl:col-span-6 glass-card animate-fade-in">
      <CardHeader className="border-b border-white/5">
        <CardTitle className="text-lg font-semibold neo-gradient">Métricas de Calidad de Voz</CardTitle>
        <CardDescription>Puntuaciones de rendimiento para llamadas basadas en IA</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 30,
              }}
              barSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-white/10" />
              <XAxis
                dataKey="metric"
                tickLine={false}
                axisLine={false}
                tick={{ 
                  fill: 'hsl(var(--muted-foreground))',
                  textAnchor: 'end',
                  fontSize: 12,
                  dy: 10,
                  transform: 'rotate(-35)'
                }}
                height={70}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {processedData.map((entry, index) => (
                  <rect key={`rect-${index}`} fill={entry.color} className="opacity-80 hover:opacity-100 transition-opacity" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallQualityChart;
