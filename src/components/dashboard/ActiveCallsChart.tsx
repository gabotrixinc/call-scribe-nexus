
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { time: "00:00", calls: 4 },
  { time: "01:00", calls: 3 },
  { time: "02:00", calls: 2 },
  { time: "03:00", calls: 1 },
  { time: "04:00", calls: 0 },
  { time: "05:00", calls: 1 },
  { time: "06:00", calls: 2 },
  { time: "07:00", calls: 5 },
  { time: "08:00", calls: 10 },
  { time: "09:00", calls: 15 },
  { time: "10:00", calls: 20 },
  { time: "11:00", calls: 25 },
  { time: "12:00", calls: 22 },
  { time: "13:00", calls: 18 },
  { time: "14:00", calls: 21 },
  { time: "15:00", calls: 24 },
  { time: "16:00", calls: 19 },
  { time: "17:00", calls: 15 },
  { time: "18:00", calls: 12 },
  { time: "19:00", calls: 8 },
  { time: "20:00", calls: 5 },
  { time: "21:00", calls: 4 },
  { time: "22:00", calls: 3 },
  { time: "23:00", calls: 2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded-md shadow-sm">
        <p className="text-sm font-medium">{`${label}: ${payload[0].value} calls`}</p>
      </div>
    );
  }

  return null;
};

const ActiveCallsChart: React.FC = () => {
  return (
    <Card className="col-span-full xl:col-span-6">
      <CardHeader>
        <CardTitle>Call Volume (24h)</CardTitle>
        <CardDescription>Active calls throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-xs"
                interval="preserveStartEnd"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="calls"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCalls)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveCallsChart;
