import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Utensils, ShieldCheck, Check, X, Bell } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import StatCard from '@/components/StatCard';
import ConditionBadge from '@/components/ConditionBadge';
import StreakTracker from '@/components/StreakTracker';
import DailyTipCard from '@/components/DailyTipCard';
import { weekData } from '@/data/mockData';

const avoidFoods = ['Spicy foods', 'Coffee', 'Alcohol', 'Citrus fruits', 'Fried foods'];
const safeFoods = ['Bananas', 'Oats', 'Curd rice', 'Boiled vegetables', 'Idli'];

const recentChecks = [
  { name: 'Idli', rating: 'good' as const, time: '2h ago' },
  { name: 'Coffee', rating: 'poor' as const, time: '3h ago' },
  { name: 'Curd Rice', rating: 'good' as const, time: '1d ago' },
];

const ratingBadge = {
  good: 'bg-good/15 text-good',
  moderate: 'bg-moderate/15 text-moderate',
  poor: 'bg-poor/15 text-poor',
};

export default function Dashboard() {
  const { userName, foodHistory, weeklyScore } = useUser();

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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 pb-24 lg:pb-8">
        <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between animate-fade-in">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {greeting}, {userName || 'Friend'} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{dateStr}</p>
              <div className="mt-2"><ConditionBadge /></div>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Gut Score" value={`${weeklyScore}/10`} subtitle="based on recent choices" icon={<Activity className="w-5 h-5 text-primary-foreground" />} color="bg-primary" />
            <StatCard title="Foods Checked" value={checkedCount} subtitle="this week" icon={<Utensils className="w-5 h-5 text-good-foreground" />} color="bg-good" />
            <StatCard title="Safe Choices" value={`${safePercent}%`} subtitle="of foods checked" icon={<ShieldCheck className="w-5 h-5 text-moderate-foreground" />} color="bg-moderate" />
            <StreakTracker />
          </div>

          {/* Chart */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border animate-fade-in">
            <h2 className="font-semibold text-foreground mb-4">Your food choices this week</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weekData}>
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="good" stackId="a" fill="hsl(var(--good))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="moderate" stackId="a" fill="hsl(var(--moderate))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="poor" stackId="a" fill="hsl(var(--poor))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Avoid / Safe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-fade-in">
              <div className="bg-poor/10 px-5 py-3">
                <h3 className="font-semibold text-poor">Foods to Avoid</h3>
              </div>
              <ul className="p-4 space-y-3">
                {avoidFoods.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="w-7 h-7 rounded-full bg-poor/15 flex items-center justify-center flex-shrink-0">
                      <X className="w-3.5 h-3.5 text-poor" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-fade-in">
              <div className="bg-good/10 px-5 py-3">
                <h3 className="font-semibold text-good">Safe Foods for You</h3>
              </div>
              <ul className="p-4 space-y-3">
                {safeFoods.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="w-7 h-7 rounded-full bg-good/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-good" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent */}
          <div className="animate-fade-in">
            <h2 className="font-semibold text-foreground mb-3">Recent checks</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentChecks.map((r) => (
                <div key={r.name} className="flex-shrink-0 bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="font-medium text-foreground text-sm">{r.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ratingBadge[r.rating]}`}>{r.rating}</span>
                  <span className="text-xs text-muted-foreground">{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
