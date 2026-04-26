import { useState } from 'react';
import { Bell, CheckCircle, X, Utensils, Lightbulb, Flame, Zap, Info } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useUser } from '@/context/UserContext';
import { useNotifications } from '@/hooks/useNotifications';
import { getGutTip } from '@/services/notifications';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative inline-flex w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 shrink-0 ${on ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

export default function NotificationSettings() {
  const { gutCondition } = useUser();
  const { permission, isSupported, schedule, updateSchedule, enable, sendTestNotification } = useNotifications();
  const [isEnabling, setIsEnabling] = useState(false);
  const [testSent, setTestSent] = useState(false);

  async function handleEnable() {
    setIsEnabling(true);
    await enable();
    setIsEnabling(false);
  }

  function handleTest() {
    sendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  }

  const todayTip = getGutTip(gutCondition || "I'm Healthy");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <div className="w-full max-w-2xl mx-auto p-4 lg:p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Smart Notifications</h1>
                <p className="text-muted-foreground text-sm">Stay on top of your gut health</p>
              </div>
            </div>

            {/* Permission card */}
            {!isSupported ? (
              <div className="w-full rounded-3xl border-2 border-gray-300 bg-gray-50 dark:bg-gray-900 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <Bell className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">Notifications not supported</p>
                    <p className="text-sm text-muted-foreground">Your browser doesn't support push notifications. Try Chrome or Edge for the best experience.</p>
                  </div>
                </div>
              </div>
            ) : permission === 'granted' ? (
              <div className="w-full rounded-3xl border-2 border-green-500 bg-green-50 dark:bg-green-950/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 dark:text-green-200 text-lg">Notifications Enabled ✓</p>
                    <p className="text-sm text-green-700 dark:text-green-300">GutSense will send you smart reminders and gut tips</p>
                  </div>
                </div>
              </div>
            ) : permission === 'denied' ? (
              <div className="w-full rounded-3xl border-2 border-red-400 bg-red-50 dark:bg-red-950/30 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                    <X className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800 dark:text-red-200 text-lg">Notifications Blocked</p>
                    <p className="text-sm text-red-700 dark:text-red-300">To enable: click the lock icon in your browser's address bar → Notifications → Allow</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">How to enable in Chrome:</p>
                  <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                    <li>Click 🔒 in the address bar</li>
                    <li>Click "Site settings"</li>
                    <li>Find "Notifications"</li>
                    <li>Change to "Allow"</li>
                    <li>Refresh the page</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="w-full rounded-3xl border-2 border-teal-500 bg-teal-50 dark:bg-teal-950/30 p-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                    <Bell className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-teal-800 dark:text-teal-200 text-lg">Enable Smart Notifications</p>
                    <p className="text-sm text-teal-700 dark:text-teal-300">Get meal reminders, daily gut tips and streak alerts</p>
                  </div>
                  <button onClick={handleEnable} disabled={isEnabling}
                    className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-70 shrink-0">
                    {isEnabling
                      ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Requesting...</>
                      : <><Bell className="w-4 h-4" />Enable Notifications</>}
                  </button>
                </div>
              </div>
            )}

            {/* Settings — only when granted */}
            {permission === 'granted' && (
              <>
                {/* Meal reminders */}
                <div className="w-full bg-card rounded-3xl border border-border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Utensils className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Meal Reminders</p>
                        <p className="text-xs text-muted-foreground">Get notified before meals</p>
                      </div>
                    </div>
                    <Toggle on={schedule.mealReminders} onToggle={() => updateSchedule({ mealReminders: !schedule.mealReminders })} />
                  </div>
                  {schedule.mealReminders && (
                    <div className="mt-5 space-y-4 border-t border-border pt-4">
                      {(['breakfast', 'lunch', 'dinner'] as const).map(meal => (
                        <div key={meal} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}</span>
                            <div>
                              <p className="text-sm font-medium text-foreground capitalize">{meal}</p>
                              <p className="text-xs text-muted-foreground">{meal === 'breakfast' ? 'Morning' : meal === 'lunch' ? 'Midday' : 'Evening'} meal reminder</p>
                            </div>
                          </div>
                          <input type="time" value={schedule.mealReminderTimes[meal]}
                            onChange={e => updateSchedule({ mealReminderTimes: { ...schedule.mealReminderTimes, [meal]: e.target.value } })}
                            className="px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-teal-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Daily tip */}
                <div className="w-full bg-card rounded-3xl border border-border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Daily Gut Tip</p>
                        <p className="text-xs text-muted-foreground">Personalized tip every morning</p>
                      </div>
                    </div>
                    <Toggle on={schedule.dailyTip} onToggle={() => updateSchedule({ dailyTip: !schedule.dailyTip })} />
                  </div>
                  {schedule.dailyTip && (
                    <div className="mt-5 border-t border-border pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">Send time</p>
                        <input type="time" value={schedule.dailyTipTime}
                          onChange={e => updateSchedule({ dailyTipTime: e.target.value })}
                          className="px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-teal-500" />
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-400 mb-1 font-medium">💡 Today's preview:</p>
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">{todayTip}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Streak reminder */}
                <div className="w-full bg-card rounded-3xl border border-border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Streak Reminder</p>
                        <p className="text-xs text-muted-foreground">Remind if no food checked by set time</p>
                      </div>
                    </div>
                    <Toggle on={schedule.streakReminder} onToggle={() => updateSchedule({ streakReminder: !schedule.streakReminder })} />
                  </div>
                  {schedule.streakReminder && (
                    <div className="mt-5 border-t border-border pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">Reminder time</p>
                        <input type="time" value={schedule.streakReminderTime}
                          onChange={e => updateSchedule({ streakReminderTime: e.target.value })}
                          className="px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-teal-500" />
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-4 border border-orange-200 dark:border-orange-800">
                        <p className="text-xs text-orange-700 dark:text-orange-400 mb-1 font-medium">🔥 Sample reminder:</p>
                        <p className="text-sm text-orange-800 dark:text-orange-200">You haven't checked any food today. Log a meal to maintain your streak!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Test */}
                <div className="w-full bg-muted/50 rounded-3xl border border-border p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Test Notifications</p>
                      <p className="text-sm text-muted-foreground">Send a test to verify it's working</p>
                    </div>
                  </div>
                  <button onClick={handleTest}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all shrink-0 ${testSent ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300' : 'border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30'}`}>
                    {testSent ? 'Sent! ✓' : 'Send Test'}
                  </button>
                </div>
              </>
            )}

            {/* Info card */}
            <div className="w-full bg-blue-50 dark:bg-blue-950/30 rounded-3xl border border-blue-200 dark:border-blue-800 p-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" /> How notifications work
              </h3>
              <div className="space-y-3">
                {[
                  'Notifications only work while your browser is open',
                  'For background notifications, install GutSense as an app (PWA)',
                  "Times are based on your device's local time",
                  'You can change times anytime and they\'ll update immediately',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />{tip}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
