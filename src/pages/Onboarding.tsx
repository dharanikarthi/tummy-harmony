import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleDot, Flame, AlertCircle, Dna, Zap, Leaf, Check, Sparkles, BarChart3, Utensils } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import ProgressBar from '@/components/ProgressBar';

const conditions = [
  { name: 'Peptic Ulcer', icon: CircleDot, desc: 'Sores in stomach lining', color: 'text-moderate' },
  { name: 'GERD', icon: Flame, desc: 'Chronic acid reflux', color: 'text-poor' },
  { name: 'IBS', icon: AlertCircle, desc: 'Irritable bowel syndrome', color: 'text-moderate' },
  { name: "Crohn's Disease", icon: Dna, desc: 'Inflammatory bowel disease', color: 'text-poor' },
  { name: 'Gastritis', icon: Zap, desc: 'Stomach inflammation', color: 'text-moderate' },
  { name: 'Healthy', icon: Leaf, desc: 'No known condition', color: 'text-good' },
];

const features = [
  { icon: Utensils, title: 'Food Analysis', desc: 'Scan any food instantly' },
  { icon: BarChart3, title: 'Health Tracking', desc: 'Monitor your gut score' },
  { icon: Sparkles, title: 'Smart Suggestions', desc: 'Get personalized swaps' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('');
  const { setUserName, setGutCondition } = useUser();
  const navigate = useNavigate();

  const handleFinish = () => {
    setUserName(name);
    setGutCondition(condition);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <ProgressBar step={step} total={3} />
      </div>

      {step === 1 && (
        <div className="min-h-[calc(100vh-3rem)] flex flex-col lg:flex-row">
          {/* Left */}
          <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 py-12 animate-fade-in">
            <span className="inline-block self-start px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              Your gut. Your rules.
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Welcome to <span className="text-primary">GutSense</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Get personalized food guidance based on your unique gut condition
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              className="w-full max-w-sm border-2 border-border rounded-2xl px-5 py-3.5 text-foreground bg-card placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors duration-200 mb-4"
            />
            <button
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              className="w-full max-w-sm bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-40 disabled:hover:scale-100"
            >
              Continue
            </button>
          </div>

          {/* Right - decorative */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-good rounded-l-[3rem] items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-40 h-40 bg-primary-foreground rounded-full" />
              <div className="absolute bottom-32 right-16 w-56 h-56 bg-primary-foreground rounded-full" />
              <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary-foreground rounded-full" />
            </div>
            <div className="space-y-4 z-10">
              {['AI-Powered Analysis', 'Personalized for You', 'Track Your Progress'].map((t, i) => (
                <div key={t} className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl px-6 py-4 text-primary-foreground flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-2">What's your gut condition?</h2>
          <p className="text-muted-foreground mb-8">We'll personalize everything based on your answer</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {conditions.map((c) => {
              const selected = condition === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setCondition(c.name)}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.03] ${
                    selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <c.icon className={`w-8 h-8 mb-2 ${selected ? 'text-primary' : c.color}`} />
                  <p className="font-semibold text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </button>
              );
            })}
          </div>

          <button
            disabled={!condition}
            onClick={() => setStep(3)}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-40 disabled:hover:scale-100"
          >
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-lg mx-auto px-6 py-16 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-good/15 flex items-center justify-center animate-scale-in">
            <Check className="w-10 h-10 text-good" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">You're all set, {name}!</h2>
          <div className="mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">{condition}</span>
          </div>

          <div className="grid gap-4 mb-8">
            {features.map((f, i) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 text-left animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleFinish}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          >
            Enter My Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
