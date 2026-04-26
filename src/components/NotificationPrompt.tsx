import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationPrompt() {
  const { permission, enable } = useNotifications();
  const [show, setShow] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('notif_prompt_dismissed');
    if (!dismissed && permission === 'default') {
      const t = setTimeout(() => setShow(true), 10000);
      return () => clearTimeout(t);
    }
  }, []);

  async function handleEnable() {
    setIsEnabling(true);
    await enable();
    setIsEnabling(false);
    setShow(false);
    localStorage.setItem('notif_prompt_dismissed', 'true');
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem('notif_prompt_dismissed', 'true');
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 max-w-sm w-full z-50">
      <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Enable Smart Reminders</h4>
                <p className="text-xs text-muted-foreground">Never miss a gut health check</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5 mb-4">
            {['🌅 Meal time reminders', '💡 Daily personalized gut tips', '🔥 Streak reminder alerts'].map(item => (
              <div key={item} className="text-xs text-foreground">{item}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleEnable} disabled={isEnabling}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-70 flex items-center justify-center gap-1.5 transition-all">
              {isEnabling
                ? <><div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />Enabling...</>
                : <><Bell className="w-3.5 h-3.5" />Enable</>}
            </button>
            <button onClick={handleDismiss} className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
