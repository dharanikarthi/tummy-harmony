import { Check, X, AlertTriangle } from 'lucide-react';

interface Props {
  foodName: string;
  rating: 'good' | 'moderate' | 'poor';
  date: string;
  reason: string;
  tip: string;
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

export default function HistoryCard({ foodName, rating, date, reason, tip }: Props) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition-all duration-200 animate-fade-in">
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
