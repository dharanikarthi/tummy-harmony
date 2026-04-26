import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { FileText, MessageCircle, Copy, Check, Leaf } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import ConditionBadge from '@/components/ConditionBadge';
import { mockHistory, weekData, gutScoreHistory, mealTimeData } from '@/data/mockData';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { staggerDelay } from '@/utils/animations';

const radarData = [
  { subject: 'Breakfast', A: 8, fullMark: 10 },
  { subject: 'Lunch', A: 6, fullMark: 10 },
  { subject: 'Snacks', A: 4, fullMark: 10 },
  { subject: 'Dinner', A: 7, fullMark: 10 },
  { subject: 'Drinks', A: 5, fullMark: 10 },
];

export default function WeeklyReport() {
  const { userName, weeklyScore } = useUser();
  const [isCopied, setIsCopied] = useState(false);
  const [scoreRef, scoreInView] = useInView(0.3);
  const [chartRef, chartInView] = useInView(0.2);
  const [foodsRef, foodsInView] = useInView(0.1);
  const [pieRef, pieInView] = useInView(0.2);
  const [trendRef, trendInView] = useInView(0.2);
  const [radarRef, radarInView] = useInView(0.2);

  const goodCount = mockHistory.filter((h) => h.rating === 'good').length;
  const modCount = mockHistory.filter((h) => h.rating === 'moderate').length;
  const poorCount = mockHistory.filter((h) => h.rating === 'poor').length;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const weekRange = `${fmt(weekStart)} – ${fmt(weekEnd)}`;

  const verdict = weeklyScore >= 8 ? 'Excellent gut week!' : weeklyScore >= 6 ? 'Good progress!' : weeklyScore >= 4 ? 'Room to improve' : "Let's do better next week";
  const scoreColor = weeklyScore > 7 ? 'text-good' : weeklyScore > 4 ? 'text-moderate' : 'text-poor';
  const strokeColor = weeklyScore > 7 ? 'hsl(var(--good))' : weeklyScore > 4 ? 'hsl(var(--moderate))' : 'hsl(var(--poor))';

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (weeklyScore / 10) * circumference;
  const animatedScore = useCountUp(scoreInView ? weeklyScore : 0, 1500);

  const topGood = mockHistory.filter((h) => h.rating === 'good').slice(0, 3);
  const topPoor = mockHistory.filter((h) => h.rating === 'poor').slice(0, 3);

  const pieData = [
    { name: 'Good', value: goodCount },
    { name: 'Moderate', value: modCount },
    { name: 'Poor', value: poorCount },
  ];
  const pieColors = ['hsl(var(--good))', 'hsl(var(--moderate))', 'hsl(var(--poor))'];

  const summaryText = `My GutSense Weekly Report!\nGut Score: ${weeklyScore}/10\nGood foods: ${goodCount}\nCheck yours at gutsense.app`;

  const handleWhatsApp = () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(summaryText), '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 pb-24 lg:pb-6">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-good rounded-3xl p-6 text-primary-foreground animate-fadeInDown print:shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary-foreground/20 flex items-center justify-center animate-heartbeat">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg">GutSense</span>
            </div>
            <h1 className="text-2xl font-bold">Weekly Health Report</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">{weekRange}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="font-medium">{userName || 'User'}</span>
              <ConditionBadge />
            </div>
          </div>

          {/* Score Hero */}
          <div ref={scoreRef} className={`flex flex-col items-center transition-all duration-500 ${scoreInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={scoreInView ? offset : circumference} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor}`}>{animatedScore}</span>
                <span className="text-muted-foreground text-sm">/10</span>
              </div>
            </div>
            <p className={`text-lg font-semibold mt-3 ${scoreColor}`}>{verdict}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Checked', value: mockHistory.length, color: 'text-primary' },
              { label: 'Good Choices', value: `${goodCount} (${Math.round((goodCount / mockHistory.length) * 100)}%)`, color: 'text-good' },
              { label: 'Foods to Avoid', value: poorCount, color: 'text-poor' },
              { label: 'Day Streak', value: 5, color: 'text-moderate' },
            ].map((s, i) => (
              <div key={s.label} className="bg-card rounded-2xl p-4 border border-border text-center print:shadow-none hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeInUp" style={staggerDelay(i + 5, 100)}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pie + Radar side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div ref={pieRef} className={`bg-card rounded-2xl p-5 border border-border transition-all duration-500 ${pieInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <h2 className="font-semibold text-foreground mb-3 text-sm">Food Rating Breakdown</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none" isAnimationActive={pieInView} animationDuration={1200}>
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                    {p.name} ({p.value})
                  </div>
                ))}
              </div>
            </div>

            <div ref={radarRef} className={`bg-card rounded-2xl p-5 border border-border transition-all duration-500 ${radarInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <h2 className="font-semibold text-foreground mb-3 text-sm">Meal Quality Radar</h2>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} isAnimationActive={radarInView} animationDuration={1200} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart */}
          <div ref={chartRef} className={`bg-card rounded-2xl p-5 border border-border print:shadow-none transition-all duration-500 ${chartInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <h2 className="font-semibold text-foreground mb-4">Daily breakdown this week</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekData}>
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                <Bar dataKey="good" stackId="a" fill="hsl(var(--good))" isAnimationActive={chartInView} animationDuration={1200} />
                <Bar dataKey="moderate" stackId="a" fill="hsl(var(--moderate))" isAnimationActive={chartInView} animationDuration={1200} />
                <Bar dataKey="poor" stackId="a" fill="hsl(var(--poor))" radius={[4, 4, 0, 0]} isAnimationActive={chartInView} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gut Score Trend */}
          <div ref={trendRef} className={`bg-card rounded-2xl p-5 border border-border transition-all duration-500 ${trendInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <h2 className="font-semibold text-foreground mb-4">Gut Score Trend</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={gutScoreHistory}>
                <defs>
                  <linearGradient id="reportScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#reportScoreGrad)" strokeWidth={2} isAnimationActive={trendInView} animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top foods */}
          <div ref={foodsRef} className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ${foodsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="bg-card rounded-2xl border border-border overflow-hidden print:shadow-none">
              <div className="bg-good/10 px-5 py-3"><h3 className="font-semibold text-good">Best choices this week</h3></div>
              <ul className="p-4 space-y-3">
                {topGood.map((f, i) => (
                  <li key={f.id} className="flex items-center gap-3 text-sm text-foreground hover:translate-x-1 transition-transform duration-200" style={foodsInView ? staggerDelay(i, 80) : undefined}>
                    <div className="w-7 h-7 rounded-full bg-good/15 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-good" /></div>
                    {f.foodName}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden print:shadow-none">
              <div className="bg-poor/10 px-5 py-3"><h3 className="font-semibold text-poor">Foods to skip next week</h3></div>
              <ul className="p-4 space-y-3">
                {topPoor.map((f, i) => (
                  <li key={f.id} className="flex items-center gap-3 text-sm text-foreground hover:translate-x-1 transition-transform duration-200" style={foodsInView ? staggerDelay(i, 80) : undefined}>
                    <div className="w-7 h-7 rounded-full bg-poor/15 flex items-center justify-center"><span className="text-poor text-xs font-bold">✕</span></div>
                    {f.foodName}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Advice */}
          <div className="bg-card rounded-2xl border border-border p-5 border-l-4 border-l-primary print:shadow-none">
            <h3 className="font-semibold text-foreground mb-2">GutSense says...</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You made {goodCount} great food choices this week. Try to reduce your intake of fried and spicy foods, and focus on gut-soothing options like curd rice and bananas. Consistency is key — keep checking your foods daily for lasting improvement.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-poor text-poor-foreground rounded-2xl py-3 font-semibold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <FileText className="w-5 h-5" /> Download PDF
            </button>
            <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-good text-good-foreground rounded-2xl py-3 font-semibold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <MessageCircle className="w-5 h-5" /> Share to WhatsApp
            </button>
            <button onClick={handleCopy} className={`flex-1 flex items-center justify-center gap-2 border-2 rounded-2xl py-3 font-semibold transition-all duration-300 active:scale-[0.98] ${isCopied ? 'border-good bg-good text-good-foreground' : 'border-border text-foreground hover:bg-muted'}`}>
              {isCopied ? <><Check className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> Copy Summary</>}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
