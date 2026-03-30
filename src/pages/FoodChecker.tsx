import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Search, X, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import FoodResultCard from '@/components/FoodResultCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { foodSuggestions, foodImageMap } from '@/data/foodSuggestions';
import { staggerDelay } from '@/utils/animations';

const mockResults: Record<string, any> = {
  idli: { foodName: 'Idli', rating: 'good', explanation: 'Soft, steamed, and low in acid. Very gentle on your stomach lining and easy to digest.', alternatives: [], tip: 'Best eaten with sambar for added nutrients.' },
  coffee: { foodName: 'Coffee', rating: 'poor', explanation: 'Increases acid production significantly, which can worsen ulcer pain and irritate the stomach lining.', alternatives: ['Ginger Tea', 'Chamomile Tea', 'Warm Milk'], tip: 'Switch to ginger tea as a soothing morning drink.' },
  banana: { foodName: 'Banana', rating: 'good', explanation: 'Natural antacid that coats the stomach lining and helps reduce irritation.', alternatives: [], tip: 'Have one banana before meals for best effect.' },
  biryani: { foodName: 'Biryani', rating: 'moderate', explanation: 'Contains spices and oil that may irritate your stomach. Eat only a small portion.', alternatives: ['Plain Rice', 'Curd Rice', 'Khichdi'], tip: 'Follow with a cup of buttermilk to ease digestion.' },
  oats: { foodName: 'Oats', rating: 'good', explanation: 'High in soluble fiber, helps absorb stomach acid and reduces inflammation.', alternatives: [], tip: 'Add banana slices for extra gut benefits.' },
  'curd rice': { foodName: 'Curd Rice', rating: 'good', explanation: 'Probiotic-rich and cooling. Excellent for inflamed gut.', alternatives: [], tip: 'Add cucumber for extra gut-soothing effect.' },
  dosa: { foodName: 'Dosa', rating: 'moderate', explanation: 'Fermented batter may cause bloating. Opt for plain dosa.', alternatives: ['Idli', 'Upma'], tip: 'Avoid masala filling when stomach is sensitive.' },
  samosa: { foodName: 'Samosa', rating: 'poor', explanation: 'Deep fried and heavy — irritates stomach lining significantly.', alternatives: ['Baked Samosa', 'Dhokla', 'Idli'], tip: 'Try baked alternatives for a safer snack.' },
  khichdi: { foodName: 'Khichdi', rating: 'good', explanation: 'Light and easy to digest, soothes the gut beautifully.', alternatives: [], tip: 'Add a spoon of ghee for better nutrient absorption.' },
  poha: { foodName: 'Poha', rating: 'good', explanation: 'Flattened rice is light and gentle on the stomach.', alternatives: [], tip: 'Add peanuts for protein and squeeze lemon for taste.' },
  upma: { foodName: 'Upma', rating: 'good', explanation: 'Semolina-based dish that is light and easy to digest.', alternatives: [], tip: 'Add vegetables for extra nutrition.' },
  chai: { foodName: 'Chai', rating: 'moderate', explanation: 'Caffeine and milk can trigger acid reflux in sensitive stomachs.', alternatives: ['Ginger Tea', 'Green Tea'], tip: 'Limit to one cup daily and avoid on empty stomach.' },
  'paneer tikka': { foodName: 'Paneer Tikka', rating: 'moderate', explanation: 'Grilled paneer is okay but spices may cause issues.', alternatives: ['Plain Paneer', 'Cottage Cheese'], tip: 'Go easy on the marinade spices.' },
  vada: { foodName: 'Vada', rating: 'poor', explanation: 'Deep fried — heavy on the stomach and increases acid production.', alternatives: ['Idli', 'Appam'], tip: 'Choose steamed snacks instead.' },
  paratha: { foodName: 'Paratha', rating: 'moderate', explanation: 'Oil/ghee used in cooking can be heavy. Eat in moderation.', alternatives: ['Roti', 'Phulka'], tip: 'Use minimal oil and pair with curd.' },
  'rajma rice': { foodName: 'Rajma Rice', rating: 'moderate', explanation: 'Kidney beans can cause gas but are nutritious in moderation.', alternatives: ['Dal Rice', 'Khichdi'], tip: 'Soak rajma overnight and cook well to reduce gas.' },
  pongal: { foodName: 'Pongal', rating: 'good', explanation: 'South Indian comfort food that is gentle and soothing.', alternatives: [], tip: 'Ven pongal with ghee is best for gut health.' },
  buttermilk: { foodName: 'Buttermilk', rating: 'good', explanation: 'Probiotic drink that aids digestion and cools the stomach.', alternatives: [], tip: 'Add roasted cumin and mint for extra benefits.' },
  pizza: { foodName: 'Pizza', rating: 'poor', explanation: 'Cheese and tomato sauce increase acid reflux significantly.', alternatives: ['Homemade Toast', 'Rice Cakes'], tip: 'If craving, try a plain cheese toast instead.' },
  'roti & dal': { foodName: 'Roti & Dal', rating: 'good', explanation: 'Balanced meal with protein and fiber. Gentle on stomach.', alternatives: [], tip: 'Use moong dal which is lightest on the stomach.' },
  'ginger tea': { foodName: 'Ginger Tea', rating: 'good', explanation: 'Anti-inflammatory and soothes nausea. Great for gut health.', alternatives: [], tip: 'Add honey instead of sugar for extra benefits.' },
  dal: { foodName: 'Dal', rating: 'good', explanation: 'High in protein and fiber, easy to digest when cooked well.', alternatives: [], tip: 'Moong dal is the lightest option for sensitive stomachs.' },
  'boiled vegetables': { foodName: 'Boiled Vegetables', rating: 'good', explanation: 'Easy to digest, nutrient-rich, and gentle on the stomach.', alternatives: [], tip: 'Season with a pinch of cumin and salt.' },
};

const loadingMessages = ['Analyzing your food...', 'Checking gut compatibility...', 'Generating insights...'];

const ratingStyles = {
  good: 'border-good/30 bg-good/5',
  moderate: 'border-moderate/30 bg-moderate/5',
  poor: 'border-poor/30 bg-poor/5',
};
const ratingDot = {
  good: 'bg-good',
  moderate: 'bg-moderate',
  poor: 'bg-poor',
};

export default function FoodChecker() {
  const [tab, setTab] = useState<'upload' | 'type'>('type');
  const [foodInput, setFoodInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { gutCondition, addFoodEntry } = useUser();

  useEffect(() => {
    if (!isLoading) return;
    const t = setInterval(() => setLoadingMsg((m) => (m + 1) % loadingMessages.length), 1500);
    return () => clearInterval(t);
  }, [isLoading]);

  const analyze = (name?: string) => {
    const query = (name || foodInput).trim().toLowerCase();
    if (!query && !image) return;
    setIsLoading(true);
    setResult(null);
    setLoadingMsg(0);
    setTimeout(() => {
      setIsLoading(false);
      setResult(mockResults[query] || {
        foodName: name || foodInput,
        rating: 'moderate' as const,
        explanation: `This food may have mixed effects on ${gutCondition || 'your gut'}. Eat in moderation and observe how you feel.`,
        alternatives: ['Plain Rice', 'Steamed Vegetables'],
        tip: 'Listen to your body and stop if you feel discomfort.',
      });
    }, 3000);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!result) return;
    addFoodEntry({
      id: Date.now(),
      foodName: result.foodName,
      rating: result.rating,
      explanation: result.explanation,
      alternatives: result.alternatives,
      tip: result.tip,
      date: new Date().toLocaleString(),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 pb-24 lg:pb-8">
        <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="animate-fadeInUp">
            <button onClick={() => navigate('/dashboard')} className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" /> Back
            </button>
            <h1 className="text-2xl font-bold text-foreground">Check a Food</h1>
            <p className="text-muted-foreground text-sm">Find out if this food is safe for your {gutCondition || 'gut'}</p>
          </div>

          {/* Tabs */}
          <div className="bg-muted rounded-2xl p-1 flex relative animate-fadeInUp" style={{ animationDelay: '100ms', animationFillMode: 'both', opacity: 0 }}>
            <div className="absolute top-1 bottom-1 bg-card shadow-sm rounded-xl transition-all duration-300" style={{ width: '50%', left: tab === 'upload' ? '0%' : '50%' }} />
            {(['upload', 'type'] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setResult(null); }} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 relative z-10 ${tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {t === 'upload' ? 'Upload Photo' : 'Type Food Name'}
              </button>
            ))}
          </div>

          {/* Content */}
          {!isLoading && !result && (
            <div className="animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'both', opacity: 0 }}>
              {tab === 'upload' ? (
                <>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                    className={`min-h-[16rem] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden ${dragOver ? 'border-primary bg-primary/5 scale-[1.02]' : image ? 'border-border' : 'border-border hover:border-primary/50'}`}
                  >
                    {image ? (
                      <>
                        <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover animate-scaleIn" />
                        <button onClick={(e) => { e.stopPropagation(); setImage(null); setFileName(''); }} className="absolute top-3 right-3 w-8 h-8 bg-poor/90 backdrop-blur rounded-full flex items-center justify-center z-10 animate-popIn hover:scale-110 hover:rotate-90 transition-all duration-200">
                          <X className="w-4 h-4 text-poor-foreground" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-primary mb-3 animate-float" />
                        <p className="font-medium text-foreground">{dragOver ? 'Release to analyze!' : 'Drop your food photo here'}</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                  {fileName && <p className="text-xs text-muted-foreground mt-2 animate-fadeInUp">{fileName}</p>}
                  <button disabled={!image} onClick={() => analyze('uploaded food')} className="mt-4 w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-200">
                    Analyze This Food
                  </button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      value={foodInput}
                      onChange={(e) => setFoodInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && analyze()}
                      placeholder="e.g. Biryani, Curd Rice, Coffee, Idli..."
                      className="w-full pl-12 pr-10 py-3.5 border-2 border-border rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all duration-300"
                    />
                    {foodInput && (
                      <button onClick={() => setFoodInput('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors animate-fadeInUp">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button disabled={!foodInput.trim()} onClick={() => analyze()} className="mt-4 w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-200">
                    Analyze This Food
                  </button>

                  {/* Food Suggestions Grid */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-foreground mb-3">Popular Indian Foods</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {foodSuggestions.map((food, i) => (
                        <button
                          key={food.name}
                          onClick={() => { setFoodInput(food.name); analyze(food.name); }}
                          className={`relative rounded-2xl overflow-hidden border-2 ${ratingStyles[food.rating]} hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 group animate-fadeInUp`}
                          style={staggerDelay(i, 40)}
                        >
                          <div className="aspect-square overflow-hidden">
                            <img src={food.image} alt={food.name} loading="lazy" width={256} height={256} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2.5">
                            <p className="text-white font-semibold text-sm drop-shadow-lg">{food.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={`w-2 h-2 rounded-full ${ratingDot[food.rating]}`} />
                              <span className="text-white/80 text-xs capitalize">{food.rating}</span>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="text-[10px] bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">{food.category}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center py-16 animate-fadeInUp">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center animate-heartbeat">
                  <Leaf className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-pulseRing" />
              </div>
              <div className="flex gap-1.5 mb-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary animate-float" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
              <p className="text-foreground font-medium mb-6 transition-opacity duration-300">{loadingMessages[loadingMsg]}</p>
              <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-progressFill" style={{ '--target-width': '90%' } as React.CSSProperties} />
              </div>
              <div className="mt-6 w-full max-w-xs">
                <LoadingSkeleton lines={3} />
              </div>
            </div>
          )}

          {result && !isLoading && (
            <FoodResultCard result={result} onSave={handleSave} onCheckAnother={() => { setResult(null); setFoodInput(''); setImage(null); }} />
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
