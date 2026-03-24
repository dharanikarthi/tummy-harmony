import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import FoodResultCard from '@/components/FoodResultCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Leaf } from 'lucide-react';

const quickSuggestions = ['Idli', 'Coffee', 'Banana', 'Biryani', 'Oats', 'Curd Rice'];

const mockResults: Record<string, any> = {
  idli: { foodName: 'Idli', rating: 'good', explanation: 'Soft, steamed, and low in acid. Very gentle on your stomach lining and easy to digest.', alternatives: [], tip: 'Best eaten with sambar for added nutrients.' },
  coffee: { foodName: 'Coffee', rating: 'poor', explanation: 'Increases acid production significantly, which can worsen ulcer pain and irritate the stomach lining.', alternatives: ['Ginger Tea', 'Chamomile Tea', 'Warm Milk'], tip: 'Switch to ginger tea as a soothing morning drink.' },
  banana: { foodName: 'Banana', rating: 'good', explanation: 'Natural antacid that coats the stomach lining and helps reduce irritation.', alternatives: [], tip: 'Have one banana before meals for best effect.' },
  biryani: { foodName: 'Biryani', rating: 'moderate', explanation: 'Contains spices and oil that may irritate your stomach. Eat only a small portion.', alternatives: ['Plain Rice', 'Curd Rice', 'Khichdi'], tip: 'Follow with a cup of buttermilk to ease digestion.' },
  oats: { foodName: 'Oats', rating: 'good', explanation: 'High in soluble fiber, helps absorb stomach acid and reduces inflammation.', alternatives: [], tip: 'Add banana slices for extra gut benefits.' },
  'curd rice': { foodName: 'Curd Rice', rating: 'good', explanation: 'Probiotic-rich and cooling. Excellent for inflamed gut.', alternatives: [], tip: 'Add cucumber for extra gut-soothing effect.' },
};

const loadingMessages = [
  'Analyzing your food...',
  'Checking gut compatibility...',
  'Generating insights...',
];

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
        rating: 'moderate',
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
        <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
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
            <div
              className="absolute top-1 bottom-1 bg-card shadow-sm rounded-xl transition-all duration-300"
              style={{ width: '50%', left: tab === 'upload' ? '0%' : '50%' }}
            />
            {(['upload', 'type'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setResult(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 relative z-10 ${
                  tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
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
                    className={`min-h-[16rem] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden ${
                      dragOver ? 'border-primary bg-primary/5 scale-[1.02]' : image ? 'border-border' : 'border-border hover:border-primary/50'
                    }`}
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
                      <button onClick={() => { setFoodInput(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors animate-fadeInUp">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {quickSuggestions.map((s, i) => (
                      <button key={s} onClick={() => setFoodInput(s)} className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary/10 hover:text-primary hover:scale-[1.08] active:scale-[0.95] transition-all duration-200 animate-popIn" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both', opacity: 0 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <button disabled={!foodInput.trim()} onClick={() => analyze()} className="mt-4 w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-200">
                    Analyze This Food
                  </button>
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
