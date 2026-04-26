import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { foodSuggestions } from '@/data/foodSuggestions';

// Extended list of food names for autocomplete (beyond the image grid)
const EXTRA_FOODS = [
  'Dal', 'Boiled Vegetables', 'Ginger Tea', 'Roti & Dal', 'Buttermilk',
  'Banana', 'Oats', 'Curd Rice', 'Khichdi', 'Pongal', 'Upma', 'Poha',
  'Idli', 'Dosa', 'Samosa', 'Vada', 'Paratha', 'Rajma Rice', 'Biryani',
  'Coffee', 'Chai', 'Paneer Tikka', 'Pizza',
  'Apple', 'Papaya', 'Watermelon', 'Mango', 'Grapes',
  'Spinach', 'Carrot', 'Broccoli', 'Cucumber', 'Tomato',
  'Egg', 'Chicken', 'Fish', 'Mutton', 'Prawn',
  'Milk', 'Yogurt', 'Paneer', 'Cheese', 'Butter',
  'Rice', 'Wheat Bread', 'Brown Rice', 'Quinoa', 'Millet',
  'Lentils', 'Chickpeas', 'Kidney Beans', 'Moong Dal', 'Chana Dal',
  'Coconut Water', 'Green Tea', 'Turmeric Milk', 'Lassi', 'Nimbu Pani',
  'Fried Rice', 'Noodles', 'Burger', 'Sandwich', 'Pasta',
  'Ice Cream', 'Chocolate', 'Cake', 'Biscuits', 'Chips',
  'Alcohol', 'Soda', 'Energy Drink', 'Fruit Juice', 'Smoothie',
];

// Merge with foodSuggestions names, deduplicate
const ALL_FOODS = [...new Set([...foodSuggestions.map(f => f.name), ...EXTRA_FOODS])].sort();

const ratingColors = {
  good:     'text-green-600 dark:text-green-400',
  moderate: 'text-amber-600 dark:text-amber-400',
  poor:     'text-red-600 dark:text-red-400',
};
const ratingDots = {
  good:     'bg-green-500',
  moderate: 'bg-amber-500',
  poor:     'bg-red-500',
};

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (val: string) => void;   // called when user picks a suggestion
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function FoodSearchInput({
  value, onChange, onSelect, placeholder = 'e.g. Biryani, Curd Rice, Coffee...', className = '', autoFocus,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  const suggestions = value.trim().length > 0
    ? ALL_FOODS.filter(f => f.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  // Get rating for a food name if it exists in foodSuggestions
  const getRating = (name: string) => foodSuggestions.find(f => f.name.toLowerCase() === name.toLowerCase())?.rating;
  const getImage  = (name: string) => foodSuggestions.find(f => f.name.toLowerCase() === name.toLowerCase())?.image;

  function handleSelect(name: string) {
    onChange(name);
    setOpen(false);
    setHighlighted(-1);
    if (onSelect) onSelect(name);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); handleSelect(suggestions[highlighted]); }
    if (e.key === 'Escape') { setOpen(false); setHighlighted(-1); }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setHighlighted(-1);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset highlight when suggestions change
  useEffect(() => { setHighlighted(-1); }, [value]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-10 py-3.5 border-2 border-border rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all duration-300 text-sm"
        />
        {value && (
          <button type="button" onClick={() => { onChange(''); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Suggestions</span>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {suggestions.map((name, i) => {
              const rating = getRating(name);
              const img    = getImage(name);
              return (
                <li key={name}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(name); }}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i === highlighted ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                  >
                    {/* Food image or placeholder */}
                    {img ? (
                      <img src={img} alt={name} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-border" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-lg">🍽️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{name}</p>
                      {rating && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${ratingDots[rating]}`} />
                          <span className={`text-xs capitalize ${ratingColors[rating]}`}>{rating} for gut</span>
                        </div>
                      )}
                    </div>
                    {/* Highlight matched text hint */}
                    <span className="text-xs text-muted-foreground shrink-0">↵</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
