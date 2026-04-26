import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line,
} from 'recharts';
import { Activity, Utensils, ShieldCheck, Check, X, Bell, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationPrompt from '@/components/NotificationPrompt';
import { useUser } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import StatCard from '@/components/StatCard';
import ConditionBadge from '@/components/ConditionBadge';
import StreakTracker from '@/components/StreakTracker';
import DailyTipCard from '@/components/DailyTipCard';
import { weekData, monthlyTrend, nutrientData, mealTimeData, gutScoreHistory } from '@/data/mockData';
import { useInView } from '@/hooks/useInView';
import { staggerDelay } from '@/utils/animations';

// Food items with Unsplash images
const avoidFoods = [
  { name: 'Spicy foods',    reason: 'Irritates stomach lining',   img: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=80&h=80&fit=crop' },
  { name: 'Coffee',         reason: 'Increases acid production',  img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&h=80&fit=crop' },
  { name: 'Alcohol',        reason: 'Damages stomach lining',     img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop' },
  { name: 'Citrus fruits',  reason: 'High acid content',          img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=80&h=80&fit=crop' },
  { name: 'Fried foods',    reason: 'Slows digestion, causes reflux', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=80&h=80&fit=crop' },
];

const safeFoods = [
  { name: 'Bananas',           reason: 'Natural antacid, soothes gut',  img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=80&h=80&fit=crop' },
  { name: 'Oats',              reason: 'High fiber, absorbs acid',       img: 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=80&h=80&fit=crop' },
  { name: 'Curd rice',         reason: 'Probiotic-rich, cooling',        img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=80&h=80&fit=crop' },
  { name: 'Boiled vegetables', reason: 'Easy to digest, nutrient-rich',  img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&h=80&fit=crop' },
  { name: 'Idli',              reason: 'Steamed, low acid, gentle',      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=80&h=80&fit=crop' },
];

// Nutrient foods with images
const nutrientFoods: Record<string, { foods: string[]; img: string; tip: string }> = {
  Fiber:      { foods: ['Oats', 'Bananas', 'Lentils'],    img: 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=120&h=80&fit=crop', tip: 'Eat more whole grains & legumes' },
  Protein:    { foods: ['Dal', 'Eggs', 'Paneer'],         img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=80&fit=crop', tip: 'Include a protein source each meal' },
  Probiotics: { foods: ['Curd', 'Buttermilk', 'Kimchi'],  img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=120&h=80&fit=crop', tip: 'Have curd daily for gut bacteria' },
  Vitamins:   { foods: ['Spinach', 'Carrots', 'Papaya'],  img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120&h=80&fit=crop', tip: 'Eat colourful vegetables every day' },
};

const recentChecks = [
  { name: 'Idli',      rating: 'good'     as const, time: '2h ago' },
  { name: 'Coffee',    rating: 'poor'     as const, time: '3h ago' },
  { name: 'Curd Rice', rating: 'good'     as const, time: '1d ago' },
  { name: 'Biryani',   rating: 'moderate' as const, time: '1d ago' },
  { name: 'Oats',      rating: 'good'     as const, time: '2d ago' },
];

const ratingBadge = {
  good:     'bg-good/15 text-good',
  moderate: 'bg-moderate/15 text-moderate',
  poor:     'bg-poor/15 text-poor',
};

export default function Dashboard() {
  const { userName, foodHistory, weeklyScore, bmi, bmiCategory, age, height, weight, gutCondition, healthGoals, symptomLogs } = useUser();
  const { isEnabled } = useNotifications();
  const [healthExpanded, setHealthExpanded] = useState(false);
  const [chartRef,  chartInView]  = useInView(0.2);
  const [foodsRef,  foodsInView]  = useInView(0.1);
  const [recentRef, recentInView] = useInView(0.1);
  const [trendRef,  trendInView]  = useInView(0.2);
  const [mealRef,   mealInView]   = useInView(0.2);
  const [scoreRef,  scoreInView]  = useInView(0.2);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const checkedCount = foodHistory.length || 12;
  const safePercent = foodHistory.length
    ? Math.round((foodHistory.filter((f) => f.rating === 'good').length / foodHistory.length) * 100)
    : 72;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">

          {/* ── Daily tip (dismissible) ── */}
          <DailyTipCard />

          {/* ── Greeting + Stats + Chart — tight block ── */}
          <div className="mt-3 space-y-3">
            {/* Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {greeting}, {userName || 'Friend'} 👋
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">{dateStr}</p>
                <div className="mt-1"><ConditionBadge /></div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/notifications" className="relative w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-200">
                  <Bell className={`w-5 h-5 ${isEnabled ? 'text-teal-600' : 'text-muted-foreground'}`} />
                  <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-background ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                </Link>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-good text-primary-foreground flex items-center justify-center font-bold text-sm shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]">
                  {userName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="Gut Score"     value={`${weeklyScore}/10`} subtitle="based on recent choices" icon={<Activity className="w-5 h-5 text-primary-foreground" />}   color="bg-primary"  />
              <StatCard title="Foods Checked" value={checkedCount}        subtitle="this week"               icon={<Utensils className="w-5 h-5 text-good-foreground" />}       color="bg-good"     />
              <StatCard title="Safe Choices"  value={`${safePercent}%`}   subtitle="of foods checked"        icon={<ShieldCheck className="w-5 h-5 text-moderate-foreground" />} color="bg-moderate" />
              <StreakTracker />
            </div>

            {/* Health profile strip */}
            {bmi && (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setHealthExpanded((v) => !v)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-good text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-foreground text-sm">{userName}</span>
                  {gutCondition && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{gutCondition}</span>}
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold ml-auto">BMI {bmi} · {bmiCategory}</span>
                  {age && <span className="text-xs text-muted-foreground hidden sm:block">{age} yrs</span>}
                  {height && <span className="text-xs text-muted-foreground hidden sm:block">{height} cm</span>}
                  {weight && <span className="text-xs text-muted-foreground hidden sm:block">{weight} kg</span>}
                  {healthExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                {healthExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      {[{ label: 'Age', value: `${age} yrs` }, { label: 'Height', value: `${height} cm` }, { label: 'Weight', value: `${weight} kg` }, { label: 'BMI', value: String(bmi) }].map(({ label, value }) => (
                        <div key={label} className="text-center bg-muted/40 rounded-xl py-2">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="font-semibold text-foreground text-sm">{value}</p>
                        </div>
                      ))}
                    </div>
                    {healthGoals?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {healthGoals.map((g) => <span key={g} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{g}</span>)}
                      </div>
                    )}
                    <a href="/profile" className="text-xs text-primary hover:underline">Edit Profile →</a>
                  </div>
                )}
              </div>
            )}

            {/* ── Symptom strip ── */}
            {symptomLogs && symptomLogs.length > 0 ? (
              <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Recent Symptoms</p>
                    <p className="text-xs text-muted-foreground">{symptomLogs.length} log{symptomLogs.length !== 1 ? 's' : ''} recorded</p>
                  </div>
                </div>
                {symptomLogs[0] && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-foreground font-medium">{symptomLogs[0].foodName}</span>
                    {symptomLogs[0].symptoms.slice(0, 2).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">{s}</span>
                    ))}
                  </div>
                )}
                <Link to="/symptoms" className="text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline shrink-0">
                  View Insights →
                </Link>
              </div>
            ) : (
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Start tracking symptoms</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Log how foods make you feel to discover your personal triggers</p>
                </div>
                <Link to="/symptoms?log=new" className="px-4 py-2 rounded-xl border-2 border-purple-500 text-purple-600 dark:text-purple-400 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors shrink-0">
                  Log Now
                </Link>
              </div>
            )}

            {/* ── Meal plan teaser ── */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">7-Day Meal Plan</p>
                  <p className="text-xs text-muted-foreground">Get a personalized gut-friendly meal plan powered by AI</p>
                </div>
              </div>
              <Link to="/mealplan" className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shrink-0">
                Generate Plan →
              </Link>
            </div>

            {/* Weekly bar chart */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
              <h2 className="font-semibold text-foreground mb-3">Your food choices this week</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weekData}>
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelStyle={{ color: 'hsl(var(--foreground))' }} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                  <Bar dataKey="good"     stackId="a" fill="hsl(var(--good))"     radius={[0,0,0,0]} isAnimationActive={chartInView} animationDuration={1200} animationEasing="ease-out" />
                  <Bar dataKey="moderate" stackId="a" fill="hsl(var(--moderate))" radius={[0,0,0,0]} isAnimationActive={chartInView} animationDuration={1200} animationEasing="ease-out" />
                  <Bar dataKey="poor"     stackId="a" fill="hsl(var(--poor))"     radius={[4,4,0,0]} isAnimationActive={chartInView} animationDuration={1200} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Rest of dashboard ── */}
          <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div ref={scoreRef} className={`bg-card rounded-2xl p-5 shadow-sm border border-border transition-all duration-500 ${scoreInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="font-semibold text-foreground mb-3 text-sm">Daily Gut Score</h2>
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={gutScoreHistory}>
                  <defs>
                    <linearGradient id="dashScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#dashScoreGrad)" strokeWidth={2} isAnimationActive={scoreInView} animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div ref={trendRef} className={`bg-card rounded-2xl p-5 shadow-sm border border-border transition-all duration-500 ${trendInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="font-semibold text-foreground mb-3 text-sm">Monthly Progress</h2>
              <ResponsiveContainer width="100%" height={170}>
                <LineChart data={monthlyTrend}>
                  <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--good))" strokeWidth={3} dot={{ r: 5, fill: 'hsl(var(--good))' }} isAnimationActive={trendInView} animationDuration={1200} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Meal-wise analysis ── */}
          <div ref={mealRef} className={`bg-card rounded-2xl p-5 shadow-sm border border-border transition-all duration-500 ${mealInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="font-semibold text-foreground mb-3">Meal-wise Food Quality</h2>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={mealTimeData} layout="vertical">
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="time" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                <Bar dataKey="good"     stackId="a" fill="hsl(var(--good))"     radius={[0,0,0,0]} isAnimationActive={mealInView} animationDuration={1200} />
                <Bar dataKey="moderate" stackId="a" fill="hsl(var(--moderate))"                    isAnimationActive={mealInView} animationDuration={1200} />
                <Bar dataKey="poor"     stackId="a" fill="hsl(var(--poor))"     radius={[0,4,4,0]} isAnimationActive={mealInView} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Foods to Avoid / Safe Foods ── */}
          <div ref={foodsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Avoid */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="bg-poor/10 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-poor">Foods to Avoid</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Based on your gut condition</p>
              </div>
              <ul className="divide-y divide-border">
                {avoidFoods.map((f, i) => (
                  <li
                    key={f.name}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-default"
                  >
                    <img
                      src={f.img}
                      alt={f.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{f.reason}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-poor/15 flex items-center justify-center shrink-0">
                      <X className="w-3 h-3 text-poor" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safe */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="bg-good/10 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-good">Safe Foods for You</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Gut-friendly choices to enjoy</p>
              </div>
              <ul className="divide-y divide-border">
                {safeFoods.map((f, i) => (
                  <li
                    key={f.name}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-default"
                  >
                    <img
                      src={f.img}
                      alt={f.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{f.reason}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-good/15 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-good" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Nutrient Intake Score ── */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <h2 className="font-semibold text-foreground mb-4">Nutrient Intake Score</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {nutrientData.map((n) => {
                const info = nutrientFoods[n.name];
                return (
                  <div key={n.name} className="bg-muted/30 rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-200">
                    {/* Food image */}
                    <div className="relative h-24 overflow-hidden">
                      <img
                        src={info.img}
                        alt={n.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow">{n.name}</span>
                    </div>
                    {/* Score ring + info */}
                    <div className="p-3 flex items-center gap-3">
                      <div className="relative w-12 h-12 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15.5" fill="none"
                            stroke={n.color} strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={`${n.value} ${100 - n.value}`}
                            style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-foreground">{n.value}%</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground leading-tight">{info.tip}</p>
                        <p className="text-xs text-foreground/60 mt-1 truncate">{info.foods.join(' · ')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Recent checks ── */}
          <div ref={recentRef} className={`transition-all duration-500 ${recentInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="font-semibold text-foreground mb-3">Recent checks</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentChecks.map((r, i) => (
                <div
                  key={`${r.name}-${i}`}
                  className="flex-shrink-0 bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3 hover:shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-default"
                >
                  <span className="font-medium text-foreground text-sm">{r.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ratingBadge[r.rating]}`}>{r.rating}</span>
                  <span className="text-xs text-muted-foreground">{r.time}</span>
                </div>
              ))}
            </div>
          </div>

          </div>{/* end rest-of-dashboard */}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
