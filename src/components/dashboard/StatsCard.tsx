
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
    <div className={cn(
      "group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 backdrop-blur-2xl hover:border-purple-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20", 
      className
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
              {title}
            </p>
            {trend && (
              <div className="flex items-center space-x-1">
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  trend.positive 
                    ? "text-emerald-400 bg-emerald-500/20" 
                    : "text-red-400 bg-red-500/20"
                )}>
                  {trend.positive ? "+" : ""}{trend.value}%
                </span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 group-hover:scale-110 transition-transform duration-300">
              <div className="text-purple-300 group-hover:text-purple-200 transition-colors">
                {icon}
              </div>
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-white group-hover:text-purple-200 transition-colors">
            {value}
          </h3>
          {description && (
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

export default StatsCard;
