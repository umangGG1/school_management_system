import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: number; // positive = up, negative = down
  icon: ReactNode;
  color: string; // Tailwind bg class for icon box e.g. 'bg-blue-100'
  iconColor?: string; // Tailwind text class e.g. 'text-blue-600'
  suffix?: string;
}

export function StatCard({ title, value, change, icon, color, iconColor = 'text-blue-600', suffix }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-start gap-4">
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
        <span className={cn('w-6 h-6', iconColor)}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">
          {value}
          {suffix && <span className="text-sm font-normal text-gray-500 ml-1">{suffix}</span>}
        </p>
        <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-500')}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{isPositive ? '+' : ''}{change}% from last term</span>
        </div>
      </div>
    </div>
  );
}
