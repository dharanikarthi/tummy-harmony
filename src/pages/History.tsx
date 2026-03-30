import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import HistoryCard from '@/components/HistoryCard';
import { useUser } from '@/context/UserContext';
import { mockHistory, gutScoreHistory, mealTimeData } from '@/data/mockData';
import { foodImageMap } from '@/data/foodSuggestions';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { staggerDelay } from '@/utils/animations';

const filters = ['All', 'Good', 'Moderate', 'Poor'] as const;
const filterStyles = {
  All: 'bg-foreground text-background',
  Good: 'bg-good text-good-foreground',
  Moderate: 'bg-moderate text-moderate-foreground',
  Poor: 'bg-poor text-poor-foreground',
};

const radarData = [
  { subject: 'Breakfast', A: 8, fullMark: 10 },
  { subject: 'Lunch', A: 6, fullMark: 10 },
  { subject: 'Snacks', A: 4, fullMark: 10 },
  { subject: 'Dinner', A: 7, fullMark: 10 },
  { subject: 'Drinks', A: 5, fullMark: 10 },
];

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const { weeklyScore } = useUser();
  const navigate = useNavigate();
  const [listRef, listInView] = useInView(0.05);
  const [chartRef, chartInView] = useInView(0.2);
  const [radarRef, radarInView] = useInView(0.2);

  const items = mockHistory.filter((h) => activeFilter === 'All' || h.rating === activeFilter.toLowerCase());
  const goodCount = mockHistory.filter((h) => h.rating === 'good').length;
  const modCount = mockHistory.filter((h) => h.rating === 'moderate').length;
  const poorCount = mockHistory.filter((h) => h.rating === 'poor').length;
  const totalCount = useCountUp(mockHistory.length, 1000);

  const pieData = [
    { name: 'Good', value: goodCount },
    { name: 'Moderate', value: modCount },
    { name: 'Poor', value: poorCount },
  ];
  const pieColors = ['hsl(var(--good))', 'hsl(var(--moderate))', 'hsl(var(--poor))'];

  const scoreMsg = weeklyScore > 7 ? 'Excellent gut week!' : weeklyScore > 4 ? 'Room to improve' : "Let's do better this week";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 pb-24 lg:pb-8">
        <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between animate-fadeInUp">
            <h1 className="text-2xl font-bold text-foreground">Food History</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/report')} className="flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <TrendingUp className="w-4 h-4" /> Weekly Report
              </button>
              <button onClick={() => alert('PDF export coming soon!')} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-poor/10 text-poor text-sm font-semibold hover:bg-poor/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <FileText className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-gradient-to-r from-primary to-good rounded-3xl p-6 text-primary-foreground flex flex-col sm:flex-row items-center gap-6 animate-fadeInUp" style={{ animationDelay: '100ms', animationFillMode: 'both', opacity: 0 }}>
            <div className="w-32 h-32 flex-shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" stroke="none" animationDuration={1200} animationEasing="ease-out">
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} opacity={0.85} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">{totalCount}</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">This Week's Score: {weeklyScore}/10</p>
              <p className="text-primary-foreground/80 mt-1">{scoreMsg}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <span>✅ {goodCount} Good</span>
                <span>⚠️ {modCount} Moderate</span>
                <span>❌ {poorCount} Poor</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gut Score Trend */}
            <div ref={chartRef} className={`bg-card rounded-2xl p-5 border border-border transition-all duration-500 ${chartInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <h3 className="font-semibold text-foreground mb-3 text-sm">Gut Score Trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={gutScoreHistory}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#scoreGrad)" strokeWidth={2} isAnimationActive={chartInView} animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Meal Quality Radar */}
            <div ref={radarRef} className={`bg-card rounded-2xl p-5 border border-border transition-all duration-500 ${radarInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <h3 className="font-semibold text-foreground mb-3 text-sm">Meal Quality by Time</h3>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} isAnimationActive={radarInView} animationDuration={1200} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'both', opacity: 0 }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 active:scale-[0.96] ${
                  activeFilter === f ? filterStyles[f] : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          <div ref={listRef} className="space-y-3">
            {items.map((h, i) => (
              <HistoryCard key={h.id} {...h} image={foodImageMap[h.foodName.toLowerCase()]} index={i} />
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
