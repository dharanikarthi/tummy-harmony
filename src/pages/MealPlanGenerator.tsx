import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Leaf, Heart, Wheat, Milk, Sparkles, RefreshCw,
  Save, Printer, ChevronDown, CheckCircle, Clock, Lightbulb,
  Droplets, ShoppingCart, X, Info,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useUser } from '@/context/UserContext';
import { generateMealPlan, type MealPlan, type MealPlanDay, type MealItem, type MealPreferences } from '@/services/gutAnalysis';

const GENERATING_STEPS = [
  'Analyzing your gut conditions...',
  'Calculating nutritional needs...',
  'Selecting gut-friendly foods...',
  'Building breakfast options...',
  'Planning lunches and dinners...',
  'Adding snacks and tips...',
  'Personalizing for your profile...',
  'Almost ready...',
];

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

/* ── Meal card ─────────────────────────────────────────────── */
function MealCard({ meal, mealType, icon, expandedMeal, setExpandedMeal }: {
  meal: MealItem; mealType: string; icon: string;
  expandedMeal: string | null; setExpandedMeal: (v: string | null) => void;
}) {
  const isExpanded = expandedMeal === mealType;
  const headerBg = mealType === 'breakfast' ? 'bg-amber-50 dark:bg-amber-950/30'
    : mealType === 'lunch'   ? 'bg-teal-50 dark:bg-teal-950/30'
    : mealType === 'dinner'  ? 'bg-blue-50 dark:bg-blue-950/30'
    : 'bg-purple-50 dark:bg-purple-950/30';
  const scoreBg = meal.gutScore >= 8 ? 'bg-green-500' : meal.gutScore >= 6 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden hover:shadow-md transition-all">
      <div className={`p-4 ${headerBg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl">{icon}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${scoreBg}`}>{meal.gutScore}/10</span>
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider capitalize">{mealType}</p>
        <h4 className="font-bold text-foreground mt-1 text-sm leading-tight">{meal.name}</h4>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{meal.description}</p>
        {meal.prepTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Clock className="w-3 h-3" />{meal.prepTime}
          </div>
        )}
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 mb-3">
          <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">✓ {meal.whyGood}</p>
        </div>
        {meal.ingredients && meal.ingredients.length > 0 && (
          <>
            <button onClick={() => setExpandedMeal(isExpanded ? null : mealType)}
              className="w-full flex items-center justify-between text-xs text-teal-600 font-medium hover:text-teal-700 transition-colors">
              View ingredients
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
              <div className="mt-3 flex flex-wrap gap-1">
                {meal.ingredients.map((ing, i) => (
                  <span key={i} className="px-2 py-1 bg-muted rounded-lg text-xs text-foreground">{ing}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── main component ─────────────────────────────────────────── */
export default function MealPlanGenerator() {
  const navigate = useNavigate();
  const { gutCondition, allConditions, customCondition, bmi, bmiCategory, age, healthGoals } = useUser();

  const [step, setStep]         = useState<'preferences' | 'generating' | 'plan'>('preferences');
  const [preferences, setPreferences] = useState<MealPreferences>({
    vegetarian: false, vegan: false, glutenFree: false, dairyFree: false,
    spiceLevel: 'medium', cuisinePreference: 'Indian',
  });
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [activeDay, setActiveDay]   = useState(0);
  const [error, setError]           = useState('');
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [currentGenStep, setCurrentGenStep] = useState(0);
  const [showDayTip, setShowDayTip] = useState(false);

  function buildConditionContext() {
    const conditions = allConditions?.length > 0 ? allConditions : [gutCondition || 'General health'];
    let ctx = `Patient gut conditions: ${conditions.join(', ')}.`;
    if (customCondition) ctx += ` Additional: ${customCondition}.`;
    if (age)             ctx += ` Age: ${age}.`;
    if (bmi)             ctx += ` BMI: ${bmi} (${bmiCategory}).`;
    if (healthGoals?.length > 0) ctx += ` Goals: ${healthGoals.join(', ')}.`;
    return ctx;
  }

  // Animate generating steps
  useEffect(() => {
    if (step !== 'generating') return;
    setCurrentGenStep(0);
    const t = setInterval(() => {
      setCurrentGenStep(prev => prev < GENERATING_STEPS.length - 1 ? prev + 1 : prev);
    }, 1200);
    return () => clearInterval(t);
  }, [step]);

  async function handleGenerate() {
    setStep('generating');
    setError('');
    setActiveDay(0);
    setExpandedMeal(null);
    try {
      const plan = await generateMealPlan(buildConditionContext(), preferences);
      setMealPlan(plan);
      setStep('plan');
    } catch (err: any) {
      setError(err.message || 'Failed to generate. Please try again.');
      setStep('preferences');
    }
  }

  function handleSavePlan() {
    if (!mealPlan) return;
    try {
      const saved = JSON.parse(localStorage.getItem('gutsense_user') || '{}');
      const plans = [{ id: Date.now(), plan: mealPlan, savedAt: new Date().toISOString(), condition: gutCondition, preferences }, ...(saved.savedMealPlans || [])];
      localStorage.setItem('gutsense_user', JSON.stringify({ ...saved, savedMealPlans: plans }));
      alert('Meal plan saved successfully!');
    } catch { alert('Could not save plan.'); }
  }

  const avgGutScore = mealPlan
    ? Math.round(mealPlan.days.reduce((sum, d) => sum + d.breakfast.gutScore + d.lunch.gutScore + d.dinner.gutScore + d.snack.gutScore, 0) / (mealPlan.days.length * 4) * 10) / 10
    : 0;

  const toggle = (key: keyof MealPreferences) =>
    setPreferences(p => ({ ...p, [key]: !p[key as keyof typeof p] }));


  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <div className="w-full p-4 lg:p-6">

            {/* ── Header ── */}
            <div className="w-full flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Meal Plan Generator</h1>
                  <p className="text-muted-foreground text-sm">7-day personalized gut-friendly meal plan</p>
                </div>
              </div>
              {step === 'plan' && mealPlan && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={handleGenerate} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-teal-500 text-teal-600 text-sm font-semibold hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                  <button onClick={handleSavePlan} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
                    <Save className="w-4 h-4" /> Save Plan
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm mb-4">
                ⚠️ {error}
              </div>
            )}

            {/* ════════ PREFERENCES ════════ */}
            {step === 'preferences' && (
              <div className="w-full">
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* LEFT — form */}
                  <div className="space-y-5">

                    {/* Dietary toggles */}
                    <div className="bg-card rounded-3xl border border-border p-6">
                      <h2 className="font-semibold text-foreground mb-1">Dietary Preferences</h2>
                      <p className="text-xs text-muted-foreground mb-4">Select all that apply</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'vegetarian', label: 'Vegetarian', icon: <Leaf className="w-5 h-5" />, color: 'text-green-600' },
                          { key: 'vegan',      label: 'Vegan',      icon: <Heart className="w-5 h-5" />, color: 'text-green-600' },
                          { key: 'glutenFree', label: 'Gluten Free',icon: <Wheat className="w-5 h-5" />, color: 'text-amber-600' },
                          { key: 'dairyFree',  label: 'Dairy Free', icon: <Milk className="w-5 h-5" />,  color: 'text-blue-600' },
                        ].map(({ key, label, icon, color }) => {
                          const active = preferences[key as keyof MealPreferences] as boolean;
                          return (
                            <button key={key} onClick={() => toggle(key as keyof MealPreferences)}
                              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${active ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30' : 'border-border bg-card'}`}>
                              <div className="flex items-center gap-2">
                                <span className={active ? 'text-teal-600' : color}>{icon}</span>
                                <span className={`text-sm font-medium ${active ? 'text-teal-700 dark:text-teal-300' : 'text-foreground'}`}>{label}</span>
                              </div>
                              {active && <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Spice level */}
                    <div className="bg-card rounded-3xl border border-border p-6">
                      <h2 className="font-semibold text-foreground mb-4">Spice Preference</h2>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: 'mild',   emoji: '🌶️',       label: 'Mild',   active: 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300' },
                          { val: 'medium', emoji: '🌶️🌶️',    label: 'Medium', active: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' },
                          { val: 'spicy',  emoji: '🌶️🌶️🌶️', label: 'Spicy',  active: 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' },
                        ].map(({ val, emoji, label, active }) => (
                          <button key={val} onClick={() => setPreferences(p => ({ ...p, spiceLevel: val as MealPreferences['spiceLevel'] }))}
                            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${preferences.spiceLevel === val ? active : 'border-border bg-card text-foreground'}`}>
                            <span className="text-2xl">{emoji}</span>
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cuisine */}
                    <div className="bg-card rounded-3xl border border-border p-6">
                      <h2 className="font-semibold text-foreground mb-4">Cuisine Preference</h2>
                      <div className="flex flex-wrap gap-2">
                        {['Indian','South Indian','North Indian','Mediterranean','Continental','Mixed'].map(c => (
                          <button key={c} onClick={() => setPreferences(p => ({ ...p, cuisinePreference: c }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${preferences.cuisinePreference === c ? 'bg-teal-600 text-white border-teal-600' : 'border-border text-muted-foreground hover:border-teal-400'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — profile + what to expect */}
                  <div className="space-y-5">
                    <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-6 text-white">
                      <h2 className="font-bold text-lg mb-1">Your Gut Profile</h2>
                      <p className="text-white/80 text-sm mb-4">Your plan will be tailored to these conditions</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(allConditions?.length > 0 ? allConditions : [gutCondition || 'General']).map(c => (
                          <span key={c} className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">{c}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-white/80">
                        {bmi && <span>BMI: {bmi} ({bmiCategory})</span>}
                        {age && <span>Age: {age}</span>}
                      </div>
                      {healthGoals?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {healthGoals.map(g => <span key={g} className="px-2 py-0.5 bg-white/10 rounded-lg text-xs">{g}</span>)}
                        </div>
                      )}
                      <p className="text-white/80 text-sm mt-4 leading-relaxed">GutSense will generate a meal plan specifically designed for your conditions and preferences.</p>
                    </div>

                    <div className="bg-card rounded-3xl border border-border p-6">
                      <h2 className="font-semibold text-foreground mb-4">Your plan will include:</h2>
                      <div className="space-y-3">
                        {[
                          '7 days of breakfast, lunch, dinner and snacks',
                          'Gut score for every meal',
                          'Prep time for each meal',
                          'Ingredients list',
                          'Why each meal is good for you',
                          'Daily gut health tips',
                        ].map(f => (
                          <div key={f} className="flex items-center gap-3 text-sm text-foreground">
                            <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />{f}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generate button */}
                <button onClick={handleGenerate}
                  className="w-full mt-6 py-5 rounded-2xl bg-teal-600 text-white font-bold text-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99]">
                  <Sparkles className="w-6 h-6" /> Generate My 7-Day Meal Plan
                </button>
              </div>
            )}


            {/* ════════ GENERATING ════════ */}
            {step === 'generating' && (
              <div className="w-full flex items-center justify-center min-h-[60vh]">
                <div className="bg-card rounded-3xl border border-border p-12 max-w-md w-full text-center">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="w-24 h-24 rounded-full border-4 border-teal-100 dark:border-teal-900" />
                    <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">🥗</div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">Creating your meal plan...</h2>
                  <div className="space-y-2 text-left mb-6">
                    {GENERATING_STEPS.map((s, i) => (
                      <div key={i} className={`flex items-center gap-3 py-1.5 text-sm transition-all duration-300 ${i === currentGenStep ? 'text-teal-600 dark:text-teal-400 font-medium' : i < currentGenStep ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                        {i < currentGenStep
                          ? <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                          : i === currentGenStep
                            ? <div className="w-4 h-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin shrink-0" />
                            : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                        {s}
                      </div>
                    ))}
                  </div>
                  <div className="bg-teal-50 dark:bg-teal-950/30 rounded-2xl px-5 py-3 text-sm text-teal-700 dark:text-teal-300">
                    Personalizing for: <strong>{gutCondition || 'your condition'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ PLAN VIEW ════════ */}
            {step === 'plan' && mealPlan && (
              <div className="w-full space-y-6">

                {/* Overview card */}
                <div className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                  <div className="absolute -bottom-8 right-20 w-24 h-24 rounded-full bg-white/5" />
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                      <p className="text-white/80 text-sm mb-1">Your 7-Day Gut Health Plan</p>
                      <h2 className="text-2xl font-bold mb-3">{mealPlan.weeklyTheme}</h2>
                      <p className="text-white/80 text-sm leading-relaxed">{mealPlan.generalAdvice}</p>
                    </div>
                    <div className="flex flex-col gap-3 shrink-0">
                      <div className="bg-white/20 rounded-2xl px-4 py-3 text-center">
                        <p className="text-xl font-bold">~{mealPlan.estimatedCalories}</p>
                        <p className="text-white/70 text-xs">Daily calories</p>
                      </div>
                      <div className="bg-white/10 rounded-xl px-3 py-2 text-center text-sm">
                        Plan for: <strong>{gutCondition || 'General'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick info row */}
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Stock Up', value: mealPlan.foodsToStockUp.length, sub: 'ingredients', color: 'text-teal-600' },
                    { label: 'Avoid',    value: mealPlan.foodsToAvoid.length,   sub: 'foods',       color: 'text-red-500' },
                    { label: 'Total Meals', value: 28, sub: 'this week',        color: 'text-blue-600' },
                    { label: 'Avg Gut Score', value: `${avgGutScore}/10`, sub: 'all meals',   color: 'text-green-600' },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                      <p className="text-xs text-muted-foreground/60">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Day selector */}
                <div className="w-full flex gap-2 overflow-x-auto pb-2">
                  {mealPlan.days.map((day, i) => (
                    <button key={i} onClick={() => { setActiveDay(i); setExpandedMeal(null); }}
                      className={`flex-shrink-0 px-6 py-3 rounded-2xl font-medium text-sm transition-all ${activeDay === i ? 'bg-teal-600 text-white shadow-md' : 'bg-card border border-border text-foreground hover:border-teal-400'}`}>
                      {day.day}
                    </button>
                  ))}
                </div>

                {/* Day header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-lg">{mealPlan.days[activeDay]?.day}'s Gut-Friendly Meals</h3>
                  <button onClick={() => setShowDayTip(v => !v)}
                    className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors">
                    <Info className="w-4 h-4" /> Daily Tip
                  </button>
                </div>
                {showDayTip && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200">
                    💡 {mealPlan.days[activeDay]?.dailyTip}
                  </div>
                )}

                {/* Meal cards grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mealPlan.days[activeDay] && (
                    <>
                      <MealCard meal={mealPlan.days[activeDay].breakfast} mealType="breakfast" icon="🌅" expandedMeal={expandedMeal} setExpandedMeal={setExpandedMeal} />
                      <MealCard meal={mealPlan.days[activeDay].lunch}     mealType="lunch"     icon="☀️" expandedMeal={expandedMeal} setExpandedMeal={setExpandedMeal} />
                      <MealCard meal={mealPlan.days[activeDay].dinner}    mealType="dinner"    icon="🌙" expandedMeal={expandedMeal} setExpandedMeal={setExpandedMeal} />
                      <MealCard meal={mealPlan.days[activeDay].snack}     mealType="snack"     icon="🍎" expandedMeal={expandedMeal} setExpandedMeal={setExpandedMeal} />
                    </>
                  )}
                </div>

                {/* Daily tip + water */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200">Today's Gut Tip</h4>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{mealPlan.days[activeDay]?.dailyTip}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Recommended Water</h4>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">{mealPlan.days[activeDay]?.waterIntake}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Droplets key={i} className={`w-5 h-5 ${i < 6 ? 'text-blue-500' : 'text-blue-200 dark:text-blue-800'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stock up + avoid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card rounded-3xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingCart className="w-5 h-5 text-teal-600" />
                      <h3 className="font-semibold text-foreground">Stock Up This Week</h3>
                    </div>
                    {mealPlan.foodsToStockUp.map((food, i) => (
                      <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-sm font-bold text-teal-700 dark:text-teal-300 shrink-0">{i + 1}</div>
                        <span className="text-sm text-foreground font-medium flex-1">{food}</span>
                        <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-800 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <X className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-red-800 dark:text-red-200">Avoid This Week</h3>
                    </div>
                    {mealPlan.foodsToAvoid.map((food, i) => (
                      <div key={i} className="flex items-center gap-3 py-3 border-b border-red-200 dark:border-red-800 last:border-0">
                        <X className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-sm text-red-700 dark:text-red-300 font-medium">{food}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="w-full flex gap-4 flex-wrap pb-4">
                  <button onClick={handleGenerate} className="flex-1 py-4 rounded-2xl border-2 border-teal-500 text-teal-600 font-semibold hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5" /> Regenerate Plan
                  </button>
                  <button onClick={handleSavePlan} className="flex-1 py-4 rounded-2xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> Save This Plan
                  </button>
                  <button onClick={() => window.print()} className="flex-1 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 print:hidden">
                    <Printer className="w-5 h-5" /> Print Plan
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
