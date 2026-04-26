import { useState } from 'react';
import { ArrowRight, Lightbulb, Check } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
} from 'recharts';
import DangerMeter from './DangerMeter';

interface FoodResult {
  food_name?: string;
  food_identified?: boolean;
  rating: 'good' | 'moderate' | 'poor';
  rating_label?: string;
  explanation: string;
  gut_score?: number;
  alternatives: Array<{ name: string; reason: string } | string>;
  tip: string;
  nutrients_to_watch?: string[];
  best_time_to_eat?: string;
  foodName?: string;
}

const ratingStyles = {
  good:     'bg-good text-good-foreground',
  moderate: 'bg-moderate text-moderate-foreground',
  poor:     'bg-poor text-poor-foreground',
};

const ratingLabels = {
  good:     'GOOD FOR YOU',
  moderate: 'EAT IN MODERATION',
  poor:     'AVOID THIS',
};

function generateNutrientData(rating: 'good' | 'moderate' | 'poor') {
  const base = rating === 'good' ? 80 : rating === 'moderate' ? 55 : 25;
  return [
    { name: 'Gut Safety',   value: base + Math.floor(Math.random() * 15) },
    { name: 'Digestion',    value: Math.min(100, base + 5 + Math.floor(Math.random() * 10)) },
    { name: 'Nutrition',    value: 40 + Math.floor(Math.random() * 40) },
    { name: 'Acid Level',   value: rating === 'poor' ? 70 + Math.floor(Math.random() * 20) : 20 + Math.floor(Math.random() * 30) },
    { name: 'Inflammation', value: rating === 'poor' ? 65 + Math.floor(Math.random() * 20) : 15 + Math.floor(Math.random() * 25) },
  ];
}

function generateRadarData(rating: 'good' | 'moderate' | 'poor') {
  const base = rating === 'good' ? 80 : rating === 'moderate' ? 55 : 30;
  return [
    { subject: 'Fiber',       A: Math.min(100, base + Math.floor(Math.random() * 20)) },
    { subject: 'Protein',     A: 30 + Math.floor(Math.random() * 50) },
    { subject: 'Vitamins',    A: 40 + Math.floor(Math.random() * 40) },
    { subject: 'Probiotics',  A: rating === 'good' ? 60 + Math.floor(Math.random() * 30) : 10 + Math.floor(Math.random() * 30) },
    { subject: 'Antioxidants',A: 30 + Math.floor(Math.random() * 40) },
    { subject: 'Minerals',    A: 35 + Math.floor(Math.random() * 40) },
  ];
}

const barColors = [
  'hsl(var(--good))',
  'hsl(var(--primary))',
  'hsl(var(--moderate))',
  'hsl(var(--poor))',
  'hsl(var(--poor))',
];

interface Props {
  result: FoodResult;
  onSave: () => void;
  onCheckAnother: () => void;
}

export default function FoodResultCard({ result, onSave, onCheckAnother }: Props) {
  // safeRating MUST be computed before useState calls that use it
  const safeRating: 'good' | 'moderate' | 'poor' =
    result.rating === 'good' || result.rating === 'poor' ? result.rating : 'moderate';

  const [saved, setSaved] = useState(false);
  const [nutrientData] = useState(() => generateNutrientData(safeRating));
  const [radarData]    = useState(() => generateRadarData(safeRating));

  const foodName    = result.food_name || result.foodName || 'Unknown Food';
  const ratingLabel = result.rating_label || ratingLabels[safeRating];
  const altList     = (result.alternatives || []).map((a) => typeof a === 'string' ? a : a.name);
  const altReasons: Record<string, string> = {};
  (result.alternatives || []).forEach((a) => { if (typeof a !== 'string') altReasons[a.name] = a.reason; });
  const gutScore  = result.gut_score;
  const nutrients = result.nutrients_to_watch || [];
  const bestTime  = result.best_time_to_eat;

  const handleSave = () => {
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-card rounded-3xl shadow-md border border-border p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{foodName}</h2>
          {gutScore !== undefined && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Gut Score: <span className="font-semibold text-foreground">{gutScore}/10</span>
            </p>
          )}
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${ratingStyles[safeRating]}`}>
          {ratingLabel}
        </span>
      </div>

      <DangerMeter rating={safeRating} />

      <hr className="border-border" />

      {/* Gut Compatibility Chart */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Gut Compatibility Breakdown</h3>
        <div className="bg-muted/30 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={nutrientData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} width={85} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={1200} animationEasing="ease-out">
                {nutrientData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nutrient Profile Radar */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Nutrient Profile</h3>
        <div className="bg-muted/30 rounded-2xl p-4 flex justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Nutrients" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} isAnimationActive animationDuration={1200} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanation */}
      <div className="border-l-4 border-primary pl-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Why?</h3>
        <p className="text-foreground text-sm leading-relaxed">{result.explanation}</p>
      </div>

      {/* Nutrients to watch */}
      {nutrients.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Nutrients to watch</h3>
          <div className="flex flex-wrap gap-2">
            {nutrients.map((n, i) => (
              <span key={i} className="bg-muted text-foreground px-3 py-1 rounded-full text-xs font-medium">{n}</span>
            ))}
          </div>
        </div>
      )}

      {/* Best time */}
      {bestTime && bestTime !== 'avoid' && (
        <p className="text-sm text-muted-foreground">
          Best time to eat: <span className="font-semibold text-foreground capitalize">{bestTime}</span>
        </p>
      )}

      {/* Alternatives */}
      {altList.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Try instead</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {altList.map((alt, i) => (
              <span key={i} className="flex items-center gap-1">
                <span title={altReasons[alt] || ''} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium hover:scale-105 transition-transform cursor-default">{alt}</span>
                {i < altList.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="bg-moderate/10 rounded-2xl p-4 flex gap-3 items-start">
        <Lightbulb className="w-5 h-5 text-moderate flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">{result.tip}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className={`flex-1 border-2 rounded-2xl py-3 font-semibold transition-all duration-300 active:scale-[0.98] ${
            saved ? 'border-good bg-good text-good-foreground' : 'border-primary text-primary hover:bg-primary/5'
          }`}
        >
          {saved
            ? <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Saved!</span>
            : 'Save to History'}
        </button>
        <button onClick={onCheckAnother} className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 font-semibold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
          Check Another
        </button>
      </div>
    </div>
  );
}
