'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'success' | 'danger';
  className?: string;
}

export function MetricCard({ title, value, trend, variant = 'default', className = '' }: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'danger':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-700';
      case 'danger':
        return 'text-red-700';
      default:
        return 'text-gray-900';
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    return trend.direction === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className={`${getVariantStyles()} ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div className="text-sm font-medium text-gray-600">{title}</div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor()}`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={`text-3xl font-bold ${getValueColor()}`}>
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </div>
      </CardContent>
    </Card>
  );
}
