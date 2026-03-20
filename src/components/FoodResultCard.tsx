import { X, Check, ArrowRight, Lightbulb } from 'lucide-react';

interface FoodResult {
  foodName: string;
  rating: 'good' | 'moderate' | 'poor';
  explanation: string;
  alternatives: string[];
  tip: string;
}

const ratingStyles = {
  good: 'bg-good text-good-foreground',
  moderate: 'bg-moderate text-moderate-foreground',
  poor: 'bg-poor text-poor-foreground',
};

const ratingLabels = {
  good: 'GOOD FOR YOU',
  moderate: 'EAT IN MODERATION',
  poor: 'AVOID THIS',
};

interface Props {
  result: FoodResult;
  onSave: () => void;
  onCheckAnother: () => void;
}

export default function FoodResultCard({ result, onSave, onCheckAnother }: Props) {
  return (
    <div className="bg-card rounded-3xl shadow-md border border-border p-6 animate-slide-up space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground">{result.foodName}</h2>
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${ratingStyles[result.rating]}`}>
          {ratingLabels[result.rating]}
        </span>
      </div>

      <hr className="border-border" />

      <div className="border-l-4 border-primary pl-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Why?</h3>
        <p className="text-foreground text-sm leading-relaxed">{result.explanation}</p>
      </div>

      {result.rating !== 'good' && result.alternatives.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Try instead</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {result.alternatives.map((alt, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">{alt}</span>
                {i < result.alternatives.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-moderate/10 rounded-2xl p-4 flex gap-3 items-start">
        <Lightbulb className="w-5 h-5 text-moderate flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">{result.tip}</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onSave} className="flex-1 border-2 border-primary text-primary rounded-2xl py-3 font-semibold hover:bg-primary/5 transition-colors duration-200">
          Save to History
        </button>
        <button onClick={onCheckAnother} className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 font-semibold hover:opacity-90 transition-opacity duration-200">
          Check Another
        </button>
      </div>
    </div>
  );
}
