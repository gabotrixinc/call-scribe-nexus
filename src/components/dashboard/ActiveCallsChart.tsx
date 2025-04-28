
import React, { useState, useEffect } from 'react';
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
import { useCallsService } from '@/hooks/useCallsService';
import { format, subHours, addHours, startOfHour } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded-md shadow-sm">
        <p className="text-sm font-medium">{`${label}: ${payload[0].value} llamadas`}</p>
      </div>
    );
  }

  return null;
};

const ActiveCallsChart: React.FC = () => {
  const { completedCalls, activeCalls } = useCallsService();
  const [callData, setCallData] = useState<any[]>([]);

  useEffect(() => {
    const generateTimeSeriesData = () => {
      const now = new Date();
      const endHour = startOfHour(now);
      const startHour = subHours(endHour, 23); // 24 hours of data
      
      // Create 24 hours of slots
      const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const slotTime = addHours(startHour, i);
        return {
          hour: format(slotTime, 'HH:00'),
          timestamp: slotTime,
          calls: 0
        };
      });
      
      // Fill in data from completed calls
      if (completedCalls && completedCalls.length > 0) {
        completedCalls.forEach(call => {
          const callTime = new Date(call.start_time);
          const hourIndex = timeSlots.findIndex(slot => {
            return callTime >= slot.timestamp && 
                  callTime < addHours(slot.timestamp, 1);
          });
          
          if (hourIndex !== -1) {
            timeSlots[hourIndex].calls++;
          }
        });
      }
      
      // Add active calls to the current hour
      const currentHourIndex = timeSlots.length - 1;
      if (activeCalls && activeCalls.length > 0) {
        timeSlots[currentHourIndex].calls += activeCalls.length;
      }
      
      return timeSlots.map(slot => ({
        time: slot.hour,
        calls: slot.calls
      }));
    };
    
    const data = generateTimeSeriesData();
    setCallData(data);
    
    // Update every minute
    const interval = setInterval(() => {
      setCallData(generateTimeSeriesData());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [completedCalls, activeCalls]);

  return (
    <Card className="col-span-full xl:col-span-6">
      <CardHeader>
        <CardTitle>Volumen de llamadas (24h)</CardTitle>
        <CardDescription>Llamadas activas durante el día</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={callData}
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
