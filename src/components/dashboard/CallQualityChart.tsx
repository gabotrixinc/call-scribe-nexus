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

const data = [
  { metric: "STT Accuracy", score: 96, color: "hsl(var(--primary))" },
  { metric: "Voice Quality", score: 92, color: "hsl(var(--secondary))" },
  { metric: "Response Time", score: 87, color: "hsl(264, 70%, 50%)" }, // Light purple
  { metric: "Intent Recognition", score: 93, color: "hsl(32, 94%, 62%)" }, // Orange
  { metric: "Customer Satisfaction", score: 89, color: "hsl(var(--secondary))" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded-md shadow-sm">
        <p className="text-sm font-medium">{`${label}: ${payload[0].value}%`}</p>
      </div>
    );
  }

  return null;
};

const CallQualityChart: React.FC = () => {
  return (
    <Card className="col-span-full xl:col-span-6">
      <CardHeader>
        <CardTitle>Voice Quality Metrics</CardTitle>
        <CardDescription>Performance scores for AI-based calls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 30,
              }}
              barSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
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
              <Bar dataKey="score" fill="currentColor" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <rect key={`rect-${index}`} fill={entry.color} />
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
