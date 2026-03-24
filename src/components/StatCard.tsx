import { ReactNode } from 'react';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  color: string;
  trend?: 'up' | 'down';
}

export default function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseInt(String(value));
  const animatedValue = useCountUp(isNaN(numericValue) ? 0 : numericValue, 1500);
  const displayValue = typeof value === 'string' && isNaN(numericValue) ? value
    : typeof value === 'string' ? value.replace(/\d+/, String(animatedValue))
    : animatedValue;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 will-change-transform animate-fadeInUp group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} transition-transform duration-200 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground transition-transform duration-200 group-hover:scale-105 origin-left">{displayValue}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
