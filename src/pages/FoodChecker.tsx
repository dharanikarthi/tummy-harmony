import { useState, useRef } from 'react';
import { ArrowLeft, Upload, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import FoodResultCard from '@/components/FoodResultCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const quickSuggestions = ['Idli', 'Coffee', 'Banana', 'Biryani', 'Oats', 'Curd Rice'];

const mockResults: Record<string, any> = {
  idli: { foodName: 'Idli', rating: 'good', explanation: 'Soft, steamed, and low in acid. Very gentle on your stomach lining and easy to digest.', alternatives: [], tip: 'Best eaten with sambar for added nutrients.' },
  coffee: { foodName: 'Coffee', rating: 'poor', explanation: 'Increases acid production significantly, which can worsen ulcer pain and irritate the stomach lining.', alternatives: ['Ginger Tea', 'Chamomile Tea', 'Warm Milk'], tip: 'Switch to ginger tea as a soothing morning drink.' },
  banana: { foodName: 'Banana', rating: 'good', explanation: 'Natural antacid that coats the stomach lining and helps reduce irritation.', alternatives: [], tip: 'Have one banana before meals for best effect.' },
  biryani: { foodName: 'Biryani', rating: 'moderate', explanation: 'Contains spices and oil that may irritate your stomach. Eat only a small portion.', alternatives: ['Plain Rice', 'Curd Rice', 'Khichdi'], tip: 'Follow with a cup of buttermilk to ease digestion.' },
  oats: { foodName: 'Oats', rating: 'good', explanation: 'High in soluble fiber, helps absorb stomach acid and reduces inflammation.', alternatives: [], tip: 'Add banana slices for extra gut benefits.' },
  'curd rice': { foodName: 'Curd Rice', rating: 'good', explanation: 'Probiotic-rich and cooling. Excellent for inflamed gut.', alternatives: [], tip: 'Add cucumber for extra gut-soothing effect.' },
};

export default function FoodChecker() {
  const [tab, setTab] = useState<'upload' | 'type'>('type');
  const [foodInput, setFoodInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { gutCondition, addFoodEntry } = useUser();

  const analyze = (name?: string) => {
    const query = (name || foodInput).trim().toLowerCase();
    if (!query && !image) return;
    setIsLoading(true);
    setResult(null);
    setTimeout(() => {
      setIsLoading(false);
      setResult(mockResults[query] || {
        foodName: name || foodInput,
        rating: 'moderate',
        explanation: `This food may have mixed effects on ${gutCondition || 'your gut'}. Eat in moderation and observe how you feel.`,
        alternatives: ['Plain Rice', 'Steamed Vegetables'],
        tip: 'Listen to your body and stop if you feel discomfort.',
      });
    }, 1800);
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
    setResult(null);
    setFoodInput('');
    setImage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 pb-24 lg:pb-8">
        <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="animate-fade-in">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <h1 className="text-2xl font-bold text-foreground">Check a Food</h1>
            <p className="text-muted-foreground text-sm">Find out if this food is safe for your {gutCondition || 'gut'}</p>
          </div>

          {/* Tabs */}
          <div className="bg-muted rounded-2xl p-1 flex">
            {(['upload', 'type'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setResult(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'upload' ? 'Upload Photo' : 'Type Food Name'}
              </button>
            ))}
          </div>

          {/* Content */}
          {!isLoading && !result && (
            <div className="animate-fade-in">
              {tab === 'upload' ? (
                <>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                    className="min-h-[16rem] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden"
                  >
                    {image ? (
                      <>
                        <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <button onClick={(e) => { e.stopPropagation(); setImage(null); setFileName(''); }} className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur rounded-full flex items-center justify-center z-10">
                          <X className="w-4 h-4 text-foreground" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-primary mb-3" />
                        <p className="font-medium text-foreground">Drop your food photo here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                  {fileName && <p className="text-xs text-muted-foreground mt-2">{fileName}</p>}
                  <button disabled={!image} onClick={() => analyze('uploaded food')} className="mt-4 w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity">
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
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-border rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {quickSuggestions.map((s) => (
                      <button key={s} onClick={() => { setFoodInput(s); }} className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                  <button disabled={!foodInput.trim()} onClick={() => analyze()} className="mt-4 w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity">
                    Analyze This Food
                  </button>
                </>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center py-16 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4" style={{ animation: 'pulse-ring 1.5s ease-in-out infinite' }}>
                <div className="w-8 h-8 rounded-full bg-primary" />
              </div>
              <p className="text-foreground font-medium mb-4">GutSense is reading your food...</p>
              <LoadingSkeleton lines={3} />
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
