import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import HistoryCard from '@/components/HistoryCard';
import { useUser } from '@/context/UserContext';
import { mockHistory } from '@/data/mockData';

const filters = ['All', 'Good', 'Moderate', 'Poor'] as const;
const filterStyles = {
  All: 'bg-foreground text-background',
  Good: 'bg-good text-good-foreground',
  Moderate: 'bg-moderate text-moderate-foreground',
  Poor: 'bg-poor text-poor-foreground',
};

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const { weeklyScore } = useUser();

  const items = mockHistory.filter((h) => activeFilter === 'All' || h.rating === activeFilter.toLowerCase());
  const goodCount = mockHistory.filter((h) => h.rating === 'good').length;
  const modCount = mockHistory.filter((h) => h.rating === 'moderate').length;
  const poorCount = mockHistory.filter((h) => h.rating === 'poor').length;

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
          <div className="flex items-center justify-between animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground">Food History</h1>
            <button onClick={() => alert('PDF export coming soon!')} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-poor/10 text-poor text-sm font-semibold hover:bg-poor/20 transition-colors">
              <FileText className="w-4 h-4" /> Export PDF
            </button>
          </div>

          {/* Weekly Summary */}
          <div className="bg-gradient-to-r from-primary to-good rounded-3xl p-6 text-primary-foreground flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} opacity={0.85} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
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

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeFilter === f ? filterStyles[f] : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {items.map((h) => (
              <HistoryCard key={h.id} {...h} />
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
