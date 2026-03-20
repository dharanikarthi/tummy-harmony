import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  color: string;
  trend?: 'up' | 'down';
}

export default function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
