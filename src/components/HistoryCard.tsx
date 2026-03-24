import { Check, X, AlertTriangle } from 'lucide-react';
import { staggerDelay } from '@/utils/animations';

interface Props {
  foodName: string;
  rating: 'good' | 'moderate' | 'poor';
  date: string;
  reason: string;
  tip: string;
  index?: number;
}

const icons = {
  good: <Check className="w-4 h-4" />,
  moderate: <AlertTriangle className="w-4 h-4" />,
  poor: <X className="w-4 h-4" />,
};

const styles = {
  good: 'bg-good/15 text-good',
  moderate: 'bg-moderate/15 text-moderate',
  poor: 'bg-poor/15 text-poor',
};

const borderColors = {
  good: 'hover:border-l-good',
  moderate: 'hover:border-l-moderate',
  poor: 'hover:border-l-poor',
};

export default function HistoryCard({ foodName, rating, date, reason, tip, index = 0 }: Props) {
  return (
    <div
      className={`bg-card rounded-2xl p-4 shadow-sm border border-border border-l-4 border-l-transparent ${borderColors[rating]} hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 will-change-transform animate-fadeInUp cursor-default`}
      style={staggerDelay(index, 60)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-foreground text-lg">{foodName}</h3>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles[rating]}`}>
          {icons[rating]} {rating.toUpperCase()}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{date}</p>
      <p className="text-sm text-foreground mb-2">{reason}</p>
      <p className="text-xs text-muted-foreground italic">💡 {tip}</p>
    </div>
  );
}
