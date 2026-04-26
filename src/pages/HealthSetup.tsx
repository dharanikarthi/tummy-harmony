import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Activity, Shield, Leaf, TrendingDown, Zap, Moon,
  Check, X, Plus, CircleDot, Flame, AlertCircle, Dna, Heart, User, ChevronUp, ChevronDown,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { calculateBMI, getBMICategory } from '@/utils/validation';
import { toast } from '@/components/Toast';
import ConfettiBlast from '@/components/ConfettiBlast';

/* ── constants ─────────────────────────────────────────────── */
const CONDITIONS = [
  { name: 'Peptic Ulcer',    icon: CircleDot,   desc: 'Sores in stomach lining',       bg: 'bg-amber-100 dark:bg-amber-900/30',   iconColor: 'text-amber-600' },
  { name: 'GERD',            icon: Flame,        desc: 'Chronic acid reflux',            bg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600' },
  { name: 'IBS',             icon: AlertCircle,  desc: 'Irritable bowel syndrome',       bg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' },
  { name: "Crohn's Disease", icon: Dna,          desc: 'Inflammatory bowel disease',     bg: 'bg-rose-100 dark:bg-rose-900/30',     iconColor: 'text-rose-600' },
  { name: 'Gastritis',       icon: Zap,          desc: 'Stomach inflammation',           bg: 'bg-red-100 dark:bg-red-900/30',       iconColor: 'text-red-600' },
  { name: "I'm Healthy",     icon: Leaf,         desc: 'No known condition',             bg: 'bg-green-100 dark:bg-green-900/30',   iconColor: 'text-green-600' },
  { name: 'Other',           icon: Plus,         desc: 'Enter your condition',           bg: 'bg-teal-100 dark:bg-teal-900/30',     iconColor: 'text-teal-600' },
];

const GOALS = [
  { name: 'Improve Digestion',   desc: 'Reduce bloating and discomfort',    icon: Activity,     benefit: 'Daily gut-friendly meal suggestions' },
  { name: 'Manage My Condition', desc: 'Keep symptoms under control',       icon: Shield,       benefit: 'Condition-specific food warnings' },
  { name: 'Eat Healthier',       desc: 'Make better food choices daily',    icon: Leaf,         benefit: 'Nutrition score for every food' },
  { name: 'Lose Weight',         desc: 'Support healthy weight management', icon: TrendingDown, benefit: 'Calorie-conscious food ratings' },
  { name: 'Boost Energy',        desc: 'Feel more energetic through food',  icon: Zap,          benefit: 'Energy-boosting food highlights' },
  { name: 'Better Sleep',        desc: 'Improve sleep through gut health',  icon: Moon,         benefit: 'Sleep-friendly food suggestions' },
];

const CONDITION_MESSAGES: Record<string, string> = {
  'Peptic Ulcer':    "GutSense will help you identify foods that won't irritate your stomach lining.",
  'GERD':            'GutSense will flag foods that trigger acid reflux and suggest alternatives.',
  'IBS':             'GutSense will guide you through a low-FODMAP approach and track patterns.',
  "Crohn's Disease": 'GutSense will help you identify safe foods during flares.',
  'Gastritis':       'GutSense will highlight anti-inflammatory foods and avoid triggers.',
  "I'm Healthy":     'GutSense will help you maintain your gut health and build better habits.',
};

const BMI_DARK_GRADIENTS: Record<string, string> = {
  blue:  'from-blue-900 to-cyan-900',
  green: 'from-green-900 to-teal-900',
  amber: 'from-amber-900 to-orange-900',
  rose:  'from-red-900 to-rose-900',
};

/* ── helpers ───────────────────────────────────────────────── */
function StepBadge({ step, label }: { step: number; label: string }) {
  return (
    <span className="inline-block bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-full px-4 py-1 text-sm font-medium mb-6">
      Step {step} of 5 · {label}
    </span>
  );
}

function NavButtons({
  step, onBack, onNext, nextDisabled, nextLabel = 'Continue',
}: {
  step: number; onBack: () => void; onNext: () => void; nextDisabled: boolean; nextLabel?: string;
}) {
  return (
    <div className="flex gap-4 mt-auto pt-8">
      {step > 1 && (
        <button onClick={onBack}
          className="flex-1 py-4 rounded-2xl border-2 border-border text-foreground font-medium hover:border-teal-500 hover:text-teal-600 transition-all duration-200 flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}
      <button onClick={onNext} disabled={nextDisabled}
        className="flex-[2] py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
        {nextLabel} <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ── main ──────────────────────────────────────────────────── */
export default function HealthSetup() {
  const navigate = useNavigate();
  const {
    userName, userEmail,
    setGutCondition, setAllConditions, setCustomCondition: saveCustom,
    setAge, setGender, setHeight, setWeight, setBmi, setBmiCategory,
    setHealthGoals, setSetupCompleted,
  } = useUser();

  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  // Step 1
  const [ageNum, setAgeNum] = useState(25);
  const [genderVal, setGenderVal] = useState('');

  // Step 2
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightVal, setHeightVal] = useState(170);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [weightVal, setWeightVal] = useState(65);

  // Step 3
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Step 4
  const [goals, setGoals] = useState<string[]>([]);

  /* derived */
  const hCm = heightUnit === 'cm' ? heightVal : Math.round(heightFt * 30.48 + heightIn * 2.54);
  const wKg = weightUnit === 'kg' ? weightVal : Math.round(weightVal * 0.453592 * 10) / 10;
  const bmiVal = hCm >= 100 && wKg >= 30 ? calculateBMI(wKg, hCm) : null;

  const allConditionsList = [
    ...selectedConditions.filter((c) => c !== 'Other'),
    ...(customCondition.trim() ? [customCondition.trim()] : []),
  ];
  const primaryCondition = allConditionsList[0] || "I'm Healthy";

  /* validation */
  const step1Valid = !!genderVal;
  const step2Valid = hCm >= 100 && wKg >= 30;
  const step3Valid = selectedConditions.length > 0 || customCondition.trim().length > 0;
  const step4Valid = goals.length >= 1;

  function next() { setStep((s) => s + 1); }
  function back() { setStep((s) => s - 1); }

  function toggleCondition(name: string) {
    if (name === "I'm Healthy") {
      setSelectedConditions(["I'm Healthy"]);
      setShowCustomInput(false);
      return;
    }
    if (name === 'Other') {
      setSelectedConditions((prev) => {
        const without = prev.filter((c) => c !== "I'm Healthy");
        const next = without.includes('Other') ? without.filter((c) => c !== 'Other') : [...without, 'Other'];
        setShowCustomInput(next.includes('Other'));
        return next;
      });
      return;
    }
    setSelectedConditions((prev) => {
      const without = prev.filter((c) => c !== "I'm Healthy");
      return without.includes(name) ? without.filter((c) => c !== name) : [...without, name];
    });
  }

  function toggleGoal(g: string) {
    setGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  function handleFinish() {
    const finalBmi = bmiVal ?? 0;
    const cat = getBMICategory(finalBmi);
    const existing = JSON.parse(localStorage.getItem('gutsense_user') || '{}');
    const updated = {
      ...existing,
      age: ageNum, gender: genderVal,
      height: hCm, weight: wKg,
      bmi: finalBmi, bmiCategory: cat.label,
      gutCondition: primaryCondition,
      allConditions: allConditionsList,
      customCondition: customCondition.trim(),
      goals: goals,
      setupCompleted: true,
      loggedOut: false,
      setupCompletedAt: new Date().toISOString(),
    };
    localStorage.setItem('gutsense_user', JSON.stringify(updated));
    setAge(ageNum); setGender(genderVal);
    setHeight(hCm); setWeight(wKg);
    setBmi(finalBmi); setBmiCategory(cat.label);
    setGutCondition(primaryCondition);
    setAllConditions(allConditionsList);
    saveCustom(customCondition.trim());
    setHealthGoals(goals);
    setSetupCompleted(true);
    setShowConfetti(true);
    toast.success('Profile complete! Welcome to GutSense 🎉');
    setTimeout(() => navigate('/dashboard'), 800);
  }

  const dots = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {showConfetti && <ConfettiBlast />}

      {/* ── Progress bar ── */}
      <div className="w-full px-8 py-4 flex items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <span className="text-xs text-muted-foreground font-medium shrink-0">Step {step} of 5</span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
        <div className="flex gap-2 shrink-0">
          {dots.map((d) => (
            <div key={d} className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300
              ${d < step ? 'bg-teal-600 border-teal-600' : d === step ? 'bg-teal-600 border-teal-600 ring-2 ring-teal-400/40' : 'bg-background border-border'}`} />
          ))}
        </div>
        <span className="text-xs text-teal-600 font-semibold shrink-0">{Math.round((step / 5) * 100)}%</span>
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 w-full flex flex-col lg:flex-row">

        {/* ════════════════ STEP 1 ════════════════ */}
        {step === 1 && (
          <>
            {/* Left */}
            <div className="flex-1 flex flex-col justify-between px-8 py-10 md:px-16 lg:px-20 min-h-[calc(100vh-73px)]">
              <div>
                <StepBadge step={1} label="Personal Info" />
                <h2 className="text-4xl font-bold tracking-tight text-foreground">Let's get to know you</h2>
                <p className="text-muted-foreground text-lg mt-2 mb-10">This helps us personalize your gut health plan</p>

                {/* Age stepper */}
                <div className="mb-10">
                  <label className="text-sm font-medium text-foreground mb-3 block">How old are you?</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setAgeNum((v) => Math.max(10, v - 1))}
                      className="w-14 h-14 rounded-2xl border-2 border-border flex items-center justify-center text-2xl hover:border-teal-500 hover:text-teal-600 transition-all duration-200 bg-card">
                      <ChevronDown className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col items-center">
                      <input
                        type="number" min={10} max={100} value={ageNum}
                        onChange={(e) => setAgeNum(Math.min(100, Math.max(10, parseInt(e.target.value) || 10)))}
                        className="w-32 h-14 rounded-2xl border-2 border-teal-500 bg-teal-50 dark:bg-teal-950/30 text-center text-3xl font-bold text-teal-700 dark:text-teal-300 focus:outline-none"
                      />
                      <span className="text-sm text-muted-foreground mt-2">years old</span>
                      <span className="text-xs text-muted-foreground">Between 10 and 100</span>
                    </div>
                    <button onClick={() => setAgeNum((v) => Math.min(100, v + 1))}
                      className="w-14 h-14 rounded-2xl border-2 border-border flex items-center justify-center text-2xl hover:border-teal-500 hover:text-teal-600 transition-all duration-200 bg-card">
                      <ChevronUp className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Gender cards */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-4 block">What's your gender?</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {[
                      {
                        val: 'Male', label: 'Male',
                        selectedBorder: 'border-blue-500', selectedBg: 'bg-blue-50 dark:bg-blue-950/40', selectedText: 'text-blue-600 dark:text-blue-400',
                        icon: (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12">
                            <circle cx="10" cy="14" r="6" /><line x1="14.5" y1="9.5" x2="21" y2="3" /><polyline points="17,3 21,3 21,7" />
                          </svg>
                        ),
                      },
                      {
                        val: 'Female', label: 'Female',
                        selectedBorder: 'border-pink-500', selectedBg: 'bg-pink-50 dark:bg-pink-950/40', selectedText: 'text-pink-600 dark:text-pink-400',
                        icon: (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12">
                            <circle cx="12" cy="9" r="6" /><line x1="12" y1="15" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" />
                          </svg>
                        ),
                      },
                      {
                        val: 'Transgender', label: 'Transgender',
                        selectedBorder: 'border-purple-500', selectedBg: 'bg-purple-50 dark:bg-purple-950/40', selectedText: 'text-purple-600 dark:text-purple-400',
                        icon: (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12">
                            <circle cx="12" cy="12" r="4" />
                            <line x1="15" y1="9" x2="20" y2="4" /><polyline points="16,4 20,4 20,8" />
                            <line x1="12" y1="16" x2="12" y2="21" /><line x1="9" y1="19" x2="15" y2="19" />
                            <line x1="9" y1="9" x2="4" y2="4" /><polyline points="8,4 4,4 4,8" />
                          </svg>
                        ),
                      },
                      {
                        val: 'Prefer not to say', label: 'Prefer not to say',
                        selectedBorder: 'border-gray-600', selectedBg: 'bg-gray-100 dark:bg-gray-800/40', selectedText: 'text-gray-600 dark:text-gray-400',
                        icon: (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ),
                      },
                    ].map(({ val, label, selectedBorder, selectedBg, selectedText, icon }) => {
                      const sel = genderVal === val;
                      return (
                        <button key={val} onClick={() => setGenderVal(val)}
                          className={`relative flex flex-col items-center justify-center gap-3 py-8 px-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-md min-h-[120px]
                            ${sel ? `${selectedBorder} ${selectedBg} ${selectedText}` : 'border-border bg-card text-muted-foreground hover:border-teal-300'}`}>
                          {icon}
                          <span className="font-semibold text-sm text-center leading-tight">{label}</span>
                          {sel && (
                            <div className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-current flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <NavButtons step={step} onBack={back} onNext={next} nextDisabled={!step1Valid} />
            </div>

            {/* Right — animated body illustration */}
            <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden w-[420px] xl:w-[480px] min-h-[calc(100vh-73px)] sticky top-[73px] bg-gradient-to-br from-teal-600 to-emerald-700 p-10">
              {/* Background blobs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
              <div className="absolute bottom-20 -left-16 w-48 h-48 rounded-full bg-white/5 blur-xl" />
              {[
                'w-6 h-6 top-1/4 left-12 opacity-20',
                'w-4 h-4 top-1/3 right-16 opacity-15',
                'w-8 h-8 bottom-1/3 left-20 opacity-10',
                'w-3 h-3 bottom-1/4 right-24 opacity-20',
              ].map((cls, i) => (
                <div key={i} className={`absolute ${cls} bg-white rounded-full animate-float`} style={{ animationDelay: `${i * 0.5}s` }} />
              ))}

              {/* Body SVG */}
              <div className="relative z-10 flex flex-col items-center">
                <svg viewBox="0 0 200 400" className="w-44">
                  <circle cx="100" cy="40" r="28" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  <rect x="88" y="66" width="24" height="20" rx="4" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <rect x="60" y="84" width="80" height="120" rx="16" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <ellipse cx="100" cy="130" rx="24" ry="20" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                  </ellipse>
                  <path d="M 85 155 Q 70 165 85 175 Q 100 185 115 175 Q 130 165 115 155 Q 100 145 85 155" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeDasharray="5,3">
                    <animate attributeName="stroke-dashoffset" values="0;-50" dur="3s" repeatCount="indefinite" />
                  </path>
                  <rect x="20" y="90" width="36" height="14" rx="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" transform="rotate(15 20 90)" />
                  <rect x="144" y="90" width="36" height="14" rx="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" transform="rotate(-15 180 90)" />
                  <rect x="66" y="204" width="26" height="80" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <rect x="108" y="204" width="26" height="80" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                </svg>

                {/* Floating callout bubbles */}
                <div className="absolute left-0 top-[38%] flex items-center gap-1.5 bg-white/90 dark:bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-teal-800 dark:text-white animate-float" style={{ animationDelay: '0s' }}>
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
                  Digestive System
                </div>
                <div className="absolute right-0 top-[55%] flex items-center gap-1.5 bg-white/90 dark:bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-teal-800 dark:text-white animate-float" style={{ animationDelay: '0.4s' }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  Gut Microbiome
                </div>
                <div className="absolute right-2 top-[10%] flex items-center gap-1.5 bg-white/90 dark:bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-teal-800 dark:text-white animate-float" style={{ animationDelay: '0.8s' }}>
                  <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse shrink-0" />
                  Gut-Brain Axis
                </div>
              </div>

              <p className="relative z-10 text-white/70 text-sm text-center mt-6">Personalizing your gut health profile</p>
              <div className="flex gap-2 mt-3 relative z-10">
                {[0, 200, 400].map((delay) => (
                  <div key={delay} className="w-2 h-2 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </>
        )}


        {/* ════════════════ STEP 2 ════════════════ */}
        {step === 2 && (
          <>
            {/* Left */}
            <div className="flex-1 flex flex-col justify-between px-8 py-10 md:px-16 lg:px-20 min-h-[calc(100vh-73px)]">
              <div>
                <StepBadge step={2} label="Measurements" />
                <h2 className="text-4xl font-bold tracking-tight text-foreground">Your body measurements</h2>
                <p className="text-muted-foreground text-lg mt-2 mb-8">Used to calculate your BMI</p>

                {/* Height */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">Your Height</label>
                    <div className="flex bg-muted rounded-xl p-1">
                      {(['cm', 'ft'] as const).map((u) => (
                        <button key={u} onClick={() => setHeightUnit(u)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${heightUnit === u ? 'bg-white dark:bg-gray-800 shadow-sm text-foreground' : 'text-muted-foreground'}`}>{u}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center py-6 my-2">
                    {heightUnit === 'cm' ? (
                      <>
                        <input type="range" min={100} max={250} step={1} value={heightVal}
                          onChange={(e) => setHeightVal(parseInt(e.target.value))}
                          className="w-full accent-teal-600 h-2 rounded-full cursor-pointer mb-4" />
                        <p className="text-7xl font-bold text-teal-600 dark:text-teal-400">{heightVal}</p>
                        <p className="text-muted-foreground mt-1">cm</p>
                        <input type="number" value={heightVal} onChange={(e) => setHeightVal(parseInt(e.target.value) || 170)}
                          className="mt-3 w-24 text-center border border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:border-teal-500" />
                      </>
                    ) : (
                      <>
                        <div className="flex gap-6 items-end mb-4">
                          <div className="flex flex-col items-center">
                            <input type="range" min={3} max={8} step={1} value={heightFt}
                              onChange={(e) => setHeightFt(parseInt(e.target.value))}
                              className="w-32 accent-teal-600 h-2 rounded-full cursor-pointer mb-2" />
                            <p className="text-5xl font-bold text-teal-600 dark:text-teal-400">{heightFt}<span className="text-2xl ml-1">ft</span></p>
                          </div>
                          <div className="flex flex-col items-center">
                            <input type="range" min={0} max={11} step={1} value={heightIn}
                              onChange={(e) => setHeightIn(parseInt(e.target.value))}
                              className="w-32 accent-teal-600 h-2 rounded-full cursor-pointer mb-2" />
                            <p className="text-5xl font-bold text-teal-600 dark:text-teal-400">{heightIn}<span className="text-2xl ml-1">in</span></p>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">= {hCm} cm</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-b border-border my-4" />

                {/* Weight */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">Your Weight</label>
                    <div className="flex bg-muted rounded-xl p-1">
                      {(['kg', 'lbs'] as const).map((u) => (
                        <button key={u} onClick={() => setWeightUnit(u)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${weightUnit === u ? 'bg-white dark:bg-gray-800 shadow-sm text-foreground' : 'text-muted-foreground'}`}>{u}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center py-4">
                    <input type="range" min={weightUnit === 'kg' ? 30 : 66} max={weightUnit === 'kg' ? 200 : 440} step={1} value={weightVal}
                      onChange={(e) => setWeightVal(parseInt(e.target.value))}
                      className="w-full accent-teal-600 h-2 rounded-full cursor-pointer mb-4" />
                    <p className="text-7xl font-bold text-teal-600 dark:text-teal-400">{weightVal}</p>
                    <p className="text-muted-foreground mt-1">{weightUnit}</p>
                    <input type="number" value={weightVal} onChange={(e) => setWeightVal(parseInt(e.target.value) || 65)}
                      className="mt-3 w-24 text-center border border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:border-teal-500" />
                  </div>
                </div>
              </div>
              <NavButtons step={step} onBack={back} onNext={next} nextDisabled={!step2Valid} />
            </div>

            {/* Right — live BMI */}
            <div className="hidden lg:flex lg:flex-col w-[420px] xl:w-[480px] min-h-[calc(100vh-73px)] sticky top-[73px] bg-gray-950 p-10">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-6">Live Preview</p>
              {bmiVal !== null ? (() => {
                const cat = getBMICategory(bmiVal);
                const pct = Math.min(Math.max(((bmiVal - 10) / 30) * 100, 0), 100);
                return (
                  <div className={`flex-1 rounded-3xl p-8 bg-gradient-to-br ${BMI_DARK_GRADIENTS[cat.color]} flex flex-col justify-between`}>
                    <div>
                      <p className="text-white/60 text-sm mb-2">Your BMI</p>
                      <p className="text-8xl font-bold text-white leading-none">{bmiVal}</p>
                      <p className="text-2xl font-semibold text-white mt-3">{cat.label}</p>
                    </div>
                    <div>
                      <div className="relative h-4 rounded-full overflow-hidden mt-6 mb-1 flex">
                        <div className="flex-1 bg-blue-400/60" />
                        <div className="flex-1 bg-green-400/60" />
                        <div className="flex-1 bg-amber-400/60" />
                        <div className="flex-1 bg-red-400/60" />
                        <div className="absolute top-1 h-[calc(100%-8px)] w-1.5 bg-white rounded-full shadow-lg transition-all duration-500" style={{ left: `calc(${pct}% - 3px)` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-white/50 mb-4">
                        <span>&lt;18.5</span><span>18.5–25</span><span>25–30</span><span>&gt;30</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-white/40 mb-6">
                        <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                      </div>
                      <p className="text-white/60 text-sm">{wKg} kg · {hCm} cm</p>
                      <p className="text-white/50 text-xs mt-2">{cat.advice}</p>
                    </div>
                  </div>
                );
              })() : (
                <div className="flex-1 rounded-3xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center gap-4 text-gray-600">
                  <p className="text-4xl">📏</p>
                  <p className="text-sm font-medium text-center">Move the sliders to see your BMI</p>
                  <ArrowLeft className="w-5 h-5 rotate-180 animate-bounce" />
                </div>
              )}
            </div>
          </>
        )}


        {/* ════════════════ STEP 3 ════════════════ */}
        {step === 3 && (
          <>
            {/* Left */}
            <div className="flex-1 flex flex-col justify-between px-8 py-10 md:px-16 lg:px-20 min-h-[calc(100vh-73px)]">
              <div>
                <StepBadge step={3} label="Gut Health" />
                <h2 className="text-4xl font-bold tracking-tight text-foreground">What are your gut conditions?</h2>
                <p className="text-muted-foreground text-lg mt-2">Select all that apply</p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">Most people have more than one condition</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CONDITIONS.map((c) => {
                    const selected = selectedConditions.includes(c.name);
                    const isHealthy = c.name === "I'm Healthy";
                    const disabled = selectedConditions.includes("I'm Healthy") && !isHealthy;
                    return (
                      <button key={c.name} onClick={() => !disabled && toggleCondition(c.name)} disabled={disabled}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md text-left
                          ${selected ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40' : 'border-border bg-card hover:border-teal-300'}
                          ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${c.bg}`}>
                          <c.icon className={`w-6 h-6 ${selected ? 'text-teal-600' : c.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                          {selected && <span className="inline-block mt-2 text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">Selected</span>}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${selected ? 'bg-teal-600 border-teal-600' : 'border-border'}`}>
                          {selected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected chips */}
                {selectedConditions.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span className="text-sm text-muted-foreground">Selected:</span>
                    {selectedConditions.map((cond) => (
                      <span key={cond} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
                        {cond}
                        <button onClick={() => toggleCondition(cond)} className="ml-1 hover:text-teal-900 dark:hover:text-teal-100"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom input */}
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: showCustomInput ? '220px' : '0' }}>
                  <div className="bg-card rounded-2xl border-2 border-teal-200 dark:border-teal-800 p-5 mt-4">
                    <label className="text-sm font-medium text-foreground mb-2 block">Describe your condition</label>
                    <textarea value={customCondition} onChange={(e) => setCustomCondition(e.target.value)}
                      placeholder="e.g. Lactose intolerance, Celiac disease, Food allergies..."
                      rows={3}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-teal-500 resize-none placeholder:text-muted-foreground text-foreground" />
                    <p className="text-xs text-muted-foreground mt-2">GutSense AI will use this to personalize your food analysis</p>
                  </div>
                </div>
              </div>
              <NavButtons step={step} onBack={back} onNext={next} nextDisabled={!step3Valid} />
            </div>

            {/* Right — facts */}
            <div className="hidden lg:flex lg:flex-col w-[420px] xl:w-[480px] min-h-[calc(100vh-73px)] sticky top-[73px] bg-gradient-to-br from-purple-950 to-teal-950 p-10">
              <h3 className="text-white text-2xl font-bold mb-8">Did you know?</h3>
              <div className="space-y-4 flex-1">
                {[
                  { emoji: '🦠', fact: '70% of your immune system lives in your gut' },
                  { emoji: '🧠', fact: 'Your gut has 500 million neurons — called the "second brain"' },
                  { emoji: '🍽️', fact: 'What you eat affects your gut microbiome within 24 hours' },
                  { emoji: '💊', fact: 'Probiotics can reduce IBS symptoms in 75% of patients' },
                ].map(({ emoji, fact }) => (
                  <div key={fact} className="bg-white/10 rounded-2xl p-5 flex items-start gap-3">
                    <span className="text-2xl shrink-0">{emoji}</span>
                    <p className="text-white text-sm leading-relaxed">{fact}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-xs mt-6">GutSense uses AI to account for your specific conditions in every food rating</p>
            </div>
          </>
        )}


        {/* ════════════════ STEP 4 ════════════════ */}
        {step === 4 && (
          <>
            {/* Left */}
            <div className="flex-1 flex flex-col justify-between px-8 py-10 md:px-16 lg:px-20 min-h-[calc(100vh-73px)]">
              <div>
                <StepBadge step={4} label="Your Goals" />
                <h2 className="text-4xl font-bold tracking-tight text-foreground">What are your health goals?</h2>
                <p className="text-muted-foreground text-lg mt-2 mb-6">Select all that apply — we'll track your progress</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {/* Goal 1 — Improve Digestion */}
                  {(() => {
                    const sel = goals.includes('Improve Digestion');
                    return (
                      <button onClick={() => toggleGoal('Improve Digestion')}
                        className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg overflow-hidden text-left ${sel ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40' : 'border-border bg-card hover:border-teal-300'}`}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-teal-400/10 -translate-y-8 translate-x-8" />
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sel ? 'bg-teal-100 dark:bg-teal-900/40' : 'bg-muted'}`}>
                            <Activity className={`w-6 h-6 ${sel ? 'text-teal-600' : 'text-muted-foreground'}`} />
                          </div>
                          {sel && <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                        <div className="my-2 flex gap-1 items-end h-8">
                          {[4,7,5,9,6,8,4,6].map((h, i) => (
                            <div key={i} className="flex-1 bg-teal-400/40 rounded-full" style={{ height: `${h * 3}px`, animation: `pulse 1.5s ease-in-out ${i * 150}ms infinite` }} />
                          ))}
                        </div>
                        <p className="font-semibold text-foreground text-sm mt-1">Improve Digestion</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Reduce bloating and discomfort</p>
                      </button>
                    );
                  })()}

                  {/* Goal 2 — Manage My Condition */}
                  {(() => {
                    const sel = goals.includes('Manage My Condition');
                    return (
                      <button onClick={() => toggleGoal('Manage My Condition')}
                        className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg overflow-hidden text-left ${sel ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40' : 'border-border bg-card hover:border-purple-300'}`}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-400/10 -translate-y-8 translate-x-8" />
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sel ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-muted'}`}>
                            <Shield className={`w-6 h-6 ${sel ? 'text-purple-600' : 'text-muted-foreground'}`} />
                          </div>
                          {sel && <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                        <div className="my-2 h-8 flex items-center">
                          <svg viewBox="0 0 60 20" className="w-full h-8">
                            <polyline points="0,10 10,10 15,2 20,18 25,10 35,10 40,5 45,15 50,10 60,10" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400" strokeDasharray="100" strokeDashoffset="0">
                              <animate attributeName="stroke-dashoffset" values="100;0" dur="2s" repeatCount="indefinite" />
                            </polyline>
                          </svg>
                        </div>
                        <p className="font-semibold text-foreground text-sm mt-1">Manage My Condition</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Keep symptoms under control</p>
                      </button>
                    );
                  })()}

                  {/* Goal 3 — Eat Healthier */}
                  {(() => {
                    const sel = goals.includes('Eat Healthier');
                    return (
                      <button onClick={() => toggleGoal('Eat Healthier')}
                        className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg overflow-hidden text-left ${sel ? 'border-green-500 bg-green-50 dark:bg-green-950/40' : 'border-border bg-card hover:border-green-300'}`}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-green-400/10 -translate-y-8 translate-x-8" />
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sel ? 'bg-green-100 dark:bg-green-900/40' : 'bg-muted'}`}>
                            <Leaf className={`w-6 h-6 ${sel ? 'text-green-600' : 'text-muted-foreground'}`} />
                          </div>
                          {sel && <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                        <div className="my-2 flex gap-2 items-end justify-center h-8">
                          {[60, 100, 75].map((h, i) => (
                            <div key={i} className="w-4 bg-green-400/50 rounded-t-full" style={{ height: `${h * 0.28}px`, animation: `pulse 2s ease-in-out ${i * 300}ms infinite` }} />
                          ))}
                        </div>
                        <p className="font-semibold text-foreground text-sm mt-1">Eat Healthier</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Make better food choices daily</p>
                      </button>
                    );
                  })()}

                  {/* Goal 4 — Lose Weight */}
                  {(() => {
                    const sel = goals.includes('Lose Weight');
                    return (
                      <button onClick={() => toggleGoal('Lose Weight')}
                        className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg overflow-hidden text-left ${sel ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'border-border bg-card hover:border-amber-300'}`}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-400/10 -translate-y-8 translate-x-8" />
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sel ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-muted'}`}>
                            <TrendingDown className={`w-6 h-6 ${sel ? 'text-amber-600' : 'text-muted-foreground'}`} />
                          </div>
                          {sel && <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                        <div className="my-2 h-8">
                          <svg viewBox="0 0 60 24" className="w-full h-full">
                            <polyline points="0,4 15,8 30,12 45,18 60,22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-amber-400" strokeDasharray="80">
                              <animate attributeName="stroke-dashoffset" values="80;0" dur="2s" repeatCount="indefinite" />
                            </polyline>
                            <circle cx="60" cy="22" r="3" className="fill-amber-400">
                              <animate attributeName="opacity" values="0;1" dur="2s" repeatCount="indefinite" />
                            </circle>
                          </svg>
                        </div>
                        <p className="font-semibold text-foreground text-sm mt-1">Lose Weight</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Support healthy weight management</p>
                      </button>
                    );
                  })()}

                  {/* Goal 5 — Boost Energy */}
                  {(() => {
                    const sel = goals.includes('Boost Energy');
                    return (
                      <button onClick={() => toggleGoal('Boost Energy')}
                        className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg overflow-hidden text-left ${sel ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/40' : 'border-border bg-card hover:border-yellow-300'}`}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-yellow-400/10 -translate-y-8 translate-x-8" />
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sel ? 'bg-yellow-100 dark:bg-yellow-900/40' : 'bg-muted'}`}>
                            <Zap className={`w-6 h-6 ${sel ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                          </div>
                          {sel && <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                        <div className="my-2 flex items-center justify-center h-8 relative">
                          <svg viewBox="0 0 24 24" className="w-8 h-8 text-yellow-400">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.8">
                              <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
                            </path>
                          </svg>
                          <div className="absolute w-10 h-10 rounded-full border-2 border-yellow-300/30 animate-ping" />
                        </div>
                        <p className="font-semibold text-foreground text-sm mt-1">Boost Energy</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Feel more energetic through food</p>
                      </button>
                    );
                  })()}

                  {/* Goal 6 — Better Sleep */}
                  {(() => {
                    const sel = goals.includes('Better Sleep');
                    return (
                      <button onClick={() => toggleGoal('Better Sleep')}
                        className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg overflow-hidden text-left ${sel ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' : 'border-border bg-card hover:border-indigo-300'}`}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-400/10 -translate-y-8 translate-x-8" />
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sel ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-muted'}`}>
                            <Moon className={`w-6 h-6 ${sel ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                          </div>
                          {sel && <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                        <div className="my-2 flex items-center gap-2 justify-center h-8">
                          <svg viewBox="0 0 24 24" className="w-7 h-7 text-indigo-400">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor">
                              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                            </path>
                          </svg>
                          {[0, 300, 600].map((delay) => (
                            <div key={delay} className="w-1.5 h-1.5 rounded-full bg-indigo-300" style={{ animation: `pulse 1.5s ease-in-out ${delay}ms infinite` }} />
                          ))}
                        </div>
                        <p className="font-semibold text-foreground text-sm mt-1">Better Sleep</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Improve sleep through gut health</p>
                      </button>
                    );
                  })()}
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  {goals.length === 0 ? 'Select at least 1 goal to continue' : `${goals.length} goal${goals.length > 1 ? 's' : ''} selected`}
                </p>
              </div>
              <NavButtons step={step} onBack={back} onNext={next} nextDisabled={!step4Valid} />
            </div>

            {/* Right — live plan preview */}
            <div className="hidden lg:flex lg:flex-col w-[420px] xl:w-[480px] min-h-[calc(100vh-73px)] sticky top-[73px] bg-gradient-to-br from-gray-950 to-gray-900 p-10">
              <h3 className="text-white text-xl font-bold mb-2">Your personalized plan:</h3>
              <p className="text-gray-500 text-sm mb-6">Updates as you select goals</p>
              {goals.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <svg viewBox="0 0 80 80" className="w-20 h-20 opacity-20">
                    <circle cx="40" cy="40" r="35" fill="none" stroke="white" strokeWidth="3" />
                    <circle cx="40" cy="40" r="22" fill="none" stroke="white" strokeWidth="3" />
                    <circle cx="40" cy="40" r="9" fill="none" stroke="white" strokeWidth="3" />
                    <line x1="40" y1="5" x2="40" y2="75" stroke="white" strokeWidth="2" />
                    <line x1="5" y1="40" x2="75" y2="40" stroke="white" strokeWidth="2" />
                  </svg>
                  <p className="text-gray-500 text-sm text-center">Select goals to preview your personalized plan</p>
                </div>
              ) : (
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {GOALS.filter((g) => goals.includes(g.name)).map((g) => (
                    <div key={g.name} className="bg-white/10 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-600/80 flex items-center justify-center shrink-0">
                        <g.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{g.benefit}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{g.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-gray-500 text-sm">Goals selected</span>
                <span className="text-4xl font-bold text-teal-400">{goals.length}</span>
              </div>
            </div>
          </>
        )}


        {/* ════════════════ STEP 5 ════════════════ */}
        {step === 5 && (
          <div className="w-full px-8 py-10 md:px-16 lg:px-24 max-w-4xl mx-auto">
            <StepBadge step={5} label="Summary" />
            <h2 className="text-4xl font-bold tracking-tight text-foreground mb-2">Your health profile is ready!</h2>
            <p className="text-muted-foreground text-lg mb-8">Here's a summary of what you've told us</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Left col */}
              <div className="space-y-5">
                {/* Profile card */}
                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{userName}</p>
                    <p className="text-muted-foreground text-sm">{userEmail}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Member since today</p>
                  </div>
                </div>

                {/* Body metrics */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Body Metrics</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Age', value: `${ageNum}`, unit: 'years' },
                      { label: 'Gender', value: genderVal, unit: '' },
                      { label: 'Height', value: `${hCm}`, unit: 'cm' },
                      { label: 'Weight', value: `${wKg}`, unit: weightUnit },
                    ].map(({ label, value, unit }) => (
                      <div key={label} className="bg-muted/40 rounded-xl p-3 text-center">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="font-bold text-foreground mt-0.5">{value} <span className="text-xs font-normal text-muted-foreground">{unit}</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BMI */}
                {bmiVal !== null && (() => {
                  const cat = getBMICategory(bmiVal);
                  const pct = Math.min(Math.max(((bmiVal - 10) / 30) * 100, 0), 100);
                  return (
                    <div className={`rounded-2xl p-5 bg-gradient-to-br ${BMI_DARK_GRADIENTS[cat.color]} text-white`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-white/60 text-xs">BMI</p>
                          <p className="text-4xl font-bold">{bmiVal}</p>
                          <p className="text-lg font-semibold mt-0.5">{cat.label}</p>
                        </div>
                        <p className="text-white/60 text-xs text-right">{wKg}kg · {hCm}cm</p>
                      </div>
                      <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="absolute inset-0 flex">
                          <div className="flex-1 bg-blue-400/60" /><div className="flex-1 bg-green-400/60" />
                          <div className="flex-1 bg-amber-400/60" /><div className="flex-1 bg-red-400/60" />
                        </div>
                        <div className="absolute top-0 h-full w-1 bg-white rounded-full transition-all duration-500" style={{ left: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right col */}
              <div className="space-y-5">
                {/* Conditions */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Gut Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {allConditionsList.map((c) => (
                      <span key={c} className="px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-700">{c}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {CONDITION_MESSAGES[primaryCondition] || CONDITION_MESSAGES["I'm Healthy"]}
                  </p>
                </div>

                {/* Goals */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Health Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {goals.map((g) => (
                      <span key={g} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">{g}</span>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="bg-teal-50 dark:bg-teal-950/30 border-l-4 border-teal-500 rounded-r-2xl p-5">
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">GutSense says...</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {CONDITION_MESSAGES[primaryCondition] || CONDITION_MESSAGES["I'm Healthy"]}
                  </p>
                </div>
              </div>
            </div>

            {/* Full-width CTA */}
            <div className="flex gap-4">
              <button onClick={back}
                className="flex-1 py-4 rounded-2xl border-2 border-border text-foreground font-medium hover:border-teal-500 hover:text-teal-600 transition-all duration-200 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleFinish}
                className="relative flex-[3] py-5 text-xl rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3">
                <span className="absolute inset-0 rounded-2xl animate-pulseRing border-2 border-teal-400" />
                Start My Journey <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
