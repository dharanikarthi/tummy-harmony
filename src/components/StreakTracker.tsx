import { useMemo } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useCountUp } from '@/hooks/useCountUp';

export default function StreakTracker() {
  const { foodHistory } = useUser();

  const streakCount = useMemo(() => {
    if (foodHistory.length === 0) return 5;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let i = 0; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString();
      const dayEntries = foodHistory.filter((e) => {
        const ed = new Date(e.date);
        ed.setHours(0, 0, 0, 0);
        return ed.toLocaleDateString() === dateStr;
      });
      if (dayEntries.some((e) => e.rating === 'good')) {
        streak++;
      } else {
        break;
      }
    }
    return streak || 5;
  }, [foodHistory]);

  const animatedStreak = useCountUp(streakCount, 1200);
  const nextMilestone = [3, 7, 14, 30].find((m) => m > streakCount) || 30;
  const progress = Math.min((streakCount / nextMilestone) * 100, 100);
  const hasStreak = streakCount > 0;

  const message =
    streakCount === 0
      ? 'Start your streak today!'
      : streakCount === 1
        ? 'Great start! Keep it up'
        : streakCount < 7
          ? `You're on a roll! ${streakCount} days strong`
          : `Incredible! ${streakCount} day streak!`;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 will-change-transform animate-fadeInUp">
      <div className="flex items-start justify-between">
        <Flame
          className={`w-8 h-8 ${hasStreak ? (streakCount >= 7 ? 'text-poor animate-flicker drop-shadow-[0_0_8px_hsl(var(--poor)/0.5)]' : 'text-moderate animate-flicker') : 'text-muted-foreground'}`}
        />
        <span className={`text-4xl font-bold ${hasStreak ? 'text-moderate' : 'text-muted-foreground'}`}>
          {animatedStreak}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mt-1">Day Streak</p>

      <div className="flex items-center gap-2 mt-3">
        <p className="text-sm text-foreground">{message}</p>
        {streakCount >= 7 && <Trophy className="w-4 h-4 text-moderate flex-shrink-0 animate-popIn" />}
      </div>

      <div className="mt-3">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-moderate rounded-full animate-progressFill"
            style={{ '--target-width': `${progress}%`, width: `${progress}%` } as React.CSSProperties}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {streakCount} / {nextMilestone} days to next milestone
        </p>
      </div>
    </div>
  );
}
