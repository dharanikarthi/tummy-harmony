import { useState } from 'react';
import { ArrowRight, Lightbulb, Check } from 'lucide-react';
import DangerMeter from './DangerMeter';

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
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-card rounded-3xl shadow-md border border-border p-6 animate-slideUpFade space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'both', opacity: 0 }}>
        <h2 className="text-2xl font-bold text-foreground">{result.foodName}</h2>
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold animate-popIn ${ratingStyles[result.rating]}`} style={{ animationDelay: '1600ms', animationFillMode: 'both', opacity: 0 }}>
          {ratingLabels[result.rating]}
        </span>
      </div>

      <DangerMeter rating={result.rating} />

      <hr className="border-border" />

      <div className="border-l-4 border-primary pl-4 animate-fadeInUp" style={{ animationDelay: '2000ms', animationFillMode: 'both', opacity: 0 }}>
        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Why?</h3>
        <p className="text-foreground text-sm leading-relaxed">{result.explanation}</p>
      </div>

      {result.rating !== 'good' && result.alternatives.length > 0 && (
        <div className="animate-fadeInUp" style={{ animationDelay: '2400ms', animationFillMode: 'both', opacity: 0 }}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Try instead</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {result.alternatives.map((alt, i) => (
              <span key={i} className="flex items-center gap-1 animate-fadeInUp" style={{ animationDelay: `${2400 + i * 100}ms`, animationFillMode: 'both', opacity: 0 }}>
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium hover:scale-105 transition-transform cursor-default">{alt}</span>
                {i < result.alternatives.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-moderate/10 rounded-2xl p-4 flex gap-3 items-start animate-fadeInRight" style={{ animationDelay: '2800ms', animationFillMode: 'both', opacity: 0 }}>
        <Lightbulb className="w-5 h-5 text-moderate flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">{result.tip}</p>
      </div>

      <div className="flex gap-3 animate-fadeInUp" style={{ animationDelay: '3000ms', animationFillMode: 'both', opacity: 0 }}>
        <button
          onClick={handleSave}
          className={`flex-1 border-2 rounded-2xl py-3 font-semibold transition-all duration-300 active:scale-[0.98] ${
            saved
              ? 'border-good bg-good text-good-foreground'
              : 'border-primary text-primary hover:bg-primary/5'
          }`}
        >
          {saved ? <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Saved!</span> : 'Save to History'}
        </button>
        <button onClick={onCheckAnother} className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 font-semibold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
          Check Another
        </button>
      </div>
    </div>
  );
}
