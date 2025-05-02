
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className
}) => {
  return (
    <Card className={cn("glass-card overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/10", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="bg-secondary/40 p-2 rounded-full backdrop-blur-sm">{icon}</div>}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-2xl font-bold neo-gradient glow-text animate-glow">{value}</div>
        {(description || trend) && (
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            {trend && (
              <span className={cn(
                "mr-1 font-medium",
                trend.positive ? "text-green-500" : "text-red-500"
              )}>
                {trend.positive ? "+" : ""}{trend.value}%
              </span>
            )}
            {description && <p>{description}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
