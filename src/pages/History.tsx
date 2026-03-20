import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FileText } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import HistoryCard from '@/components/HistoryCard';
import { useUser } from '@/context/UserContext';

const mockHistory = [
  { id: 1, foodName: 'Idli', rating: 'good' as const, date: 'Today, 8:30 AM', reason: 'Soft and low-acid, gentle on stomach lining.', tip: 'Best eaten with sambar for added nutrients.' },
  { id: 2, foodName: 'Coffee', rating: 'poor' as const, date: 'Today, 9:00 AM', reason: 'Increases acid production, worsens ulcer pain.', tip: 'Switch to ginger tea as a morning drink.' },
  { id: 3, foodName: 'Curd Rice', rating: 'good' as const, date: 'Yesterday, 1:00 PM', reason: 'Probiotic-rich and cooling for inflamed gut.', tip: 'Add cucumber for extra gut-soothing effect.' },
  { id: 4, foodName: 'Biryani', rating: 'moderate' as const, date: 'Yesterday, 2:30 PM', reason: 'Spicy and oily — eat a small portion only.', tip: 'Follow with buttermilk to ease digestion.' },
  { id: 5, foodName: 'Banana', rating: 'good' as const, date: '2 days ago', reason: 'Natural antacid, coats stomach lining.', tip: 'Have one before meals for best protection.' },
  { id: 6, foodName: 'Samosa', rating: 'poor' as const, date: '2 days ago', reason: 'Deep fried and heavy — irritates stomach.', tip: 'Try baked alternatives for a safer snack.' },
  { id: 7, foodName: 'Oats', rating: 'good' as const, date: '3 days ago', reason: 'High fiber, absorbs excess stomach acid.', tip: 'Add banana slices for extra gut benefits.' },
  { id: 8, foodName: 'Pizza', rating: 'poor' as const, date: '3 days ago', reason: 'Cheese and sauce increase acid reflux risk.', tip: 'If craving, try a plain cheese toast instead.' },
];

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
