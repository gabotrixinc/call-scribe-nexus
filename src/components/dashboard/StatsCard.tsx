
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
    <Card className={cn(
      "glass-card overflow-hidden transition-all duration-300 hover:shadow-glass-hover group neon-border animate-fade-in", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 glass-panel">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        {icon && (
          <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 p-2 rounded-full backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300 neon-glow">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4 relative">
        <div className="text-2xl font-bold neo-gradient glow-text animate-glow group-hover:animate-text-glow">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center text-xs text-muted-foreground mt-2 group-hover:text-foreground/80 transition-colors">
            {trend && (
              <span className={cn(
                "mr-1 font-medium transition-all duration-300 group-hover:scale-110",
                trend.positive ? "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              )}>
                {trend.positive ? "+" : ""}{trend.value}%
              </span>
            )}
            {description && <p className="group-hover:text-foreground/90 transition-colors">{description}</p>}
          </div>
        )}
        
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
