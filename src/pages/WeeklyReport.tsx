import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, MessageCircle, Copy, Check, TrendingUp, Leaf } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import ConditionBadge from '@/components/ConditionBadge';
import { mockHistory, weekData } from '@/data/mockData';

export default function WeeklyReport() {
  const { userName, weeklyScore } = useUser();
  const [isCopied, setIsCopied] = useState(false);

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

  const topGood = mockHistory.filter((h) => h.rating === 'good').slice(0, 3);
  const topPoor = mockHistory.filter((h) => h.rating === 'poor').slice(0, 3);

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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 pb-24 lg:pb-8">
        <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-good rounded-3xl p-6 text-primary-foreground animate-fade-in print:shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
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
          <div className="flex flex-col items-center py-6 animate-fade-in print:shadow-none">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor}`}>{weeklyScore}</span>
                <span className="text-muted-foreground text-sm">/10</span>
              </div>
            </div>
            <p className={`text-lg font-semibold mt-3 ${scoreColor}`}>{verdict}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {[
              { label: 'Total Checked', value: mockHistory.length, color: 'text-primary' },
              { label: 'Good Choices', value: `${goodCount} (${Math.round((goodCount / mockHistory.length) * 100)}%)`, color: 'text-good' },
              { label: 'Foods to Avoid', value: poorCount, color: 'text-poor' },
              { label: 'Day Streak', value: 5, color: 'text-moderate' },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-2xl p-4 border border-border text-center print:shadow-none">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in print:shadow-none">
            <h2 className="font-semibold text-foreground mb-4">Daily breakdown this week</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekData}>
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                <Bar dataKey="good" stackId="a" fill="hsl(var(--good))" />
                <Bar dataKey="moderate" stackId="a" fill="hsl(var(--moderate))" />
                <Bar dataKey="poor" stackId="a" fill="hsl(var(--poor))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top foods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-card rounded-2xl border border-border overflow-hidden print:shadow-none">
              <div className="bg-good/10 px-5 py-3"><h3 className="font-semibold text-good">Best choices this week</h3></div>
              <ul className="p-4 space-y-3">
                {topGood.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="w-7 h-7 rounded-full bg-good/15 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-good" /></div>
                    {f.foodName}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden print:shadow-none">
              <div className="bg-poor/10 px-5 py-3"><h3 className="font-semibold text-poor">Foods to skip next week</h3></div>
              <ul className="p-4 space-y-3">
                {topPoor.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="w-7 h-7 rounded-full bg-poor/15 flex items-center justify-center"><span className="text-poor text-xs font-bold">✕</span></div>
                    {f.foodName}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Advice */}
          <div className="bg-card rounded-2xl border border-border p-5 border-l-4 border-l-primary animate-fade-in print:shadow-none">
            <h3 className="font-semibold text-foreground mb-2">GutSense says...</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You made {goodCount} great food choices this week. Try to reduce your intake of fried and spicy foods, and focus on gut-soothing options like curd rice and bananas. Consistency is key — keep checking your foods daily for lasting improvement.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-poor text-poor-foreground rounded-2xl py-3 font-semibold hover:opacity-90 transition-opacity">
              <FileText className="w-5 h-5" /> Download PDF
            </button>
            <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-good text-good-foreground rounded-2xl py-3 font-semibold hover:opacity-90 transition-opacity">
              <MessageCircle className="w-5 h-5" /> Share to WhatsApp
            </button>
            <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 border-2 border-border text-foreground rounded-2xl py-3 font-semibold hover:bg-muted transition-colors">
              {isCopied ? <><Check className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> Copy Summary</>}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
