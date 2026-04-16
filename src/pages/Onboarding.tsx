import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleDot, Flame, AlertCircle, Dna, Zap, Leaf, Check, Sparkles, BarChart3, Utensils, PlusCircle } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import ProgressBar from '@/components/ProgressBar';
import ConfettiBlast from '@/components/ConfettiBlast';
import { staggerDelay } from '@/utils/animations';

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
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [showConfetti, setShowConfetti] = useState(false);
  const { setUserName, setGutCondition } = useUser();
  const navigate = useNavigate();

  const toggleCondition = (condName: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condName) ? prev.filter((c) => c !== condName) : [...prev, condName]
    );
  };

  const allConditions = [
    ...selectedConditions,
    ...(otherCondition.trim() ? [otherCondition.trim()] : []),
  ];

  const goToStep = (next: number) => {
    setDirection(next > step ? 'right' : 'left');
    setStep(next);
    if (next === 3) setShowConfetti(true);
  };

  const handleFinish = () => {
    setUserName(name);
    setGutCondition(allConditions.join(', '));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <ProgressBar step={step} total={3} />
      </div>

      {step === 1 && (
        <div className="min-h-[calc(100vh-3rem)] flex flex-col lg:flex-row animate-fadeInUp">
          {/* Left */}
          <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 py-12">
            <div className="animate-popIn">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6 animate-heartbeat">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <span className="inline-block self-start px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'both', opacity: 0 }}>
              Your gut. Your rules.
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 animate-fadeInUp" style={{ animationDelay: '400ms', animationFillMode: 'both', opacity: 0 }}>
              Welcome to <span className="text-primary">GutSense</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md animate-fadeInUp" style={{ animationDelay: '600ms', animationFillMode: 'both', opacity: 0 }}>
              Get personalized food guidance based on your unique gut condition
            </p>
            <div className="animate-fadeInUp" style={{ animationDelay: '800ms', animationFillMode: 'both', opacity: 0 }}>
              <div className="relative w-full max-w-sm mb-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full border-2 border-border rounded-2xl px-5 py-3.5 text-foreground bg-card placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all duration-300 pr-12"
                />
                {name.length > 1 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-good flex items-center justify-center animate-popIn">
                    <Check className="w-3.5 h-3.5 text-good-foreground" />
                  </div>
                )}
              </div>
              <button
                disabled={!name.trim()}
                onClick={() => goToStep(2)}
                className="w-full max-w-sm bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Right - decorative */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-good rounded-l-[3rem] items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-40 h-40 bg-primary-foreground rounded-full animate-float" />
              <div className="absolute bottom-32 right-16 w-56 h-56 bg-primary-foreground rounded-full animate-float" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary-foreground rounded-full animate-float" style={{ animationDelay: '2s' }} />
            </div>
            <div className="space-y-4 z-10">
              {['AI-Powered Analysis', 'Personalized for You', 'Track Your Progress'].map((t, i) => (
                <div key={t} className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl px-6 py-4 text-primary-foreground flex items-center gap-3 animate-fadeInRight" style={{ animationDelay: `${i * 200 + 400}ms`, animationFillMode: 'both', opacity: 0 }}>
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-foreground mb-2 animate-fadeInDown">What's your gut condition?</h2>
          <p className="text-muted-foreground mb-2 animate-fadeInUp" style={{ animationDelay: '100ms', animationFillMode: 'both', opacity: 0 }}>
            Select all that apply — we'll personalize everything based on your answers
          </p>
          {selectedConditions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 animate-fadeInUp">
              {allConditions.map((c) => (
                <span key={c} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{c}</span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {conditions.map((c, i) => {
              const selected = selectedConditions.includes(c.name);
              return (
                <button
                  key={c.name}
                  onClick={() => toggleCondition(c.name)}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] animate-fadeInUp ${
                    selected ? 'border-primary bg-gradient-to-br from-primary/5 to-good/5' : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                  style={staggerDelay(i, 80)}
                >
                  {selected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-popIn">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <c.icon className={`w-8 h-8 mb-2 transition-all duration-300 ${selected ? 'text-primary animate-float' : c.color}`} />
                  <p className="font-semibold text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Other Condition Section */}
          <div className="mb-6 animate-fadeInUp" style={{ animationDelay: '550ms', animationFillMode: 'both', opacity: 0 }}>
            {!showOtherInput ? (
              <button
                onClick={() => setShowOtherInput(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all duration-300 w-full"
              >
                <PlusCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Add another condition not listed above</span>
              </button>
            ) : (
              <div className="bg-card border-2 border-primary/30 rounded-2xl p-4 animate-scaleIn">
                <label className="text-sm font-semibold text-foreground mb-2 block">Other Condition</label>
                <input
                  value={otherCondition}
                  onChange={(e) => setOtherCondition(e.target.value)}
                  placeholder="e.g. Celiac Disease, Ulcerative Colitis..."
                  className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-foreground bg-background placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all duration-300 text-sm"
                  autoFocus
                />
                {otherCondition.trim() && (
                  <p className="text-xs text-good mt-2 flex items-center gap-1 animate-fadeInUp">
                    <Check className="w-3 h-3" /> Will be added to your profile
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            disabled={allConditions.length === 0}
            onClick={() => goToStep(3)}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] animate-fadeInUp"
            style={{ animationDelay: '600ms', animationFillMode: 'both', opacity: 0 }}
          >
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          {showConfetti && <ConfettiBlast />}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-good/15 flex items-center justify-center">
            <svg className="w-12 h-12" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="24" fill="none" stroke="hsl(var(--good))" strokeWidth="3"
                strokeDasharray="150.8" strokeDashoffset="150.8"
                style={{ animation: 'drawCircle 0.6s ease-out 0.2s forwards' }} />
              <path fill="none" stroke="hsl(var(--good))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                d="M14 27l8 8 16-16"
                strokeDasharray="40" strokeDashoffset="40"
                style={{ animation: 'drawCheck 0.4s ease-out 0.8s forwards' }} />
            </svg>
            <style>{`
              @keyframes drawCircle { to { stroke-dashoffset: 0; } }
              @keyframes drawCheck { to { stroke-dashoffset: 0; } }
            `}</style>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2 animate-fadeInUp" style={{ animationDelay: '1000ms', animationFillMode: 'both', opacity: 0 }}>
            You're all set, <span className="text-primary underline decoration-primary/30 decoration-2 underline-offset-4">{name}</span>!
          </h2>
          <div className="mb-8 flex flex-wrap gap-2 justify-center animate-popIn" style={{ animationDelay: '1200ms', animationFillMode: 'both', opacity: 0 }}>
            {allConditions.map((c) => (
              <span key={c} className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">{c}</span>
            ))}
          </div>

          <div className="grid gap-4 mb-8">
            {features.map((f, i) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 text-left animate-fadeInUp hover:shadow-md hover:-translate-y-0.5 transition-all duration-300" style={staggerDelay(i + 12, 100)}>
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
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 hover:shadow-[0_0_24px_hsl(var(--primary)/0.4)] animate-fadeInUp relative"
            style={{ animationDelay: '1800ms', animationFillMode: 'both', opacity: 0 }}
          >
            <span className="absolute inset-0 rounded-2xl animate-pulseRing border-2 border-primary" />
            Enter My Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
