export interface NotificationSchedule {
  mealReminders: boolean;
  mealReminderTimes: { breakfast: string; lunch: string; dinner: string };
  dailyTip: boolean;
  dailyTipTime: string;
  streakReminder: boolean;
  streakReminderTime: string;
}

export const DEFAULT_SCHEDULE: NotificationSchedule = {
  mealReminders: true,
  mealReminderTimes: { breakfast: '08:00', lunch: '13:00', dinner: '19:00' },
  dailyTip: true,
  dailyTipTime: '08:00',
  streakReminder: true,
  streakReminderTime: '18:00',
};

export const isNotificationSupported = (): boolean => 'Notification' in window;

export const requestPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const p = await Notification.requestPermission();
  return p === 'granted';
};

export const getPermissionStatus = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const sendNotification = (
  title: string, body: string,
  icon = '/icons/icon.svg', badge = '/icons/icon.svg',
  tag = 'gutsense', data: Record<string, unknown> = {},
): void => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  const n = new Notification(title, { body, icon, badge, tag, data, requireInteraction: false });
  setTimeout(() => n.close(), 5000);
  n.onclick = () => { window.focus(); if (data.url) window.location.href = data.url as string; n.close(); };
};

const GUT_TIPS: Record<string, string[]> = {
  'Peptic Ulcer': [
    'Eat smaller meals every 3-4 hours to reduce acid buildup.',
    'Avoid coffee and spicy foods on an empty stomach.',
    'Chew your food slowly — it reduces stomach acid needed.',
    'Stress worsens ulcers. Try deep breathing before meals.',
    'Honey has antibacterial properties that fight H. pylori.',
    'Sleep on your left side to reduce nighttime acid reflux.',
    'Cabbage juice may help heal your stomach lining naturally.',
  ],
  'GERD': [
    'Avoid lying down for 3 hours after eating.',
    'Elevate your head while sleeping to prevent acid reflux.',
    'Chewing gum after meals stimulates saliva to neutralize acid.',
    'Wear loose clothing — tight clothes worsen GERD.',
    'Eat your largest meal at lunch, not dinner.',
    'Aloe vera juice before meals can soothe the esophagus.',
    'Keep a food diary to find your personal GERD triggers.',
  ],
  'IBS': [
    'Eat at consistent times daily — your gut loves routine.',
    'Peppermint oil capsules can reduce IBS cramping.',
    'Soluble fiber (oats, bananas) is better than insoluble fiber.',
    'Stress is a major IBS trigger — try a 10 min walk today.',
    'Stay hydrated — aim for 8 glasses of water.',
    'Probiotics can reduce IBS bloating over 4-8 weeks.',
    'Low-FODMAP diet helps 75% of IBS patients.',
  ],
  "Crohn's Disease": [
    'During flare-ups switch to soft liquid foods.',
    'Small frequent meals are easier on inflamed intestines.',
    'Cook vegetables until soft — easier to digest.',
    "Vitamin D deficiency is common in Crohn's — ask your doctor.",
    'Omega-3 fatty acids have anti-inflammatory properties.',
    'Avoid NSAIDs like ibuprofen — use paracetamol instead.',
    'Track your symptoms to find your personal triggers.',
  ],
  'Gastritis': [
    'Cold milk can temporarily neutralize stomach acid.',
    'Ginger tea before meals reduces gastritis inflammation.',
    'Avoid NSAIDs — they worsen gastritis.',
    'Eat slowly and chew thoroughly.',
    'Manuka honey fights H. pylori bacteria naturally.',
    'Avoid spicy food on an empty stomach.',
    'Licorice root supplements protect the stomach lining.',
  ],
  "I'm Healthy": [
    'Eat 30 different plant foods per week for gut diversity.',
    'Fermented foods feed beneficial gut bacteria.',
    'Aim for 25-35g of fiber daily from whole foods.',
    "Your gut produces 90% of your body's serotonin.",
    'Exercise 30 min daily to increase gut microbiome diversity.',
    'Avoid unnecessary antibiotics — they wipe out good bacteria.',
    'Intermittent fasting allows your gut to self-clean.',
  ],
};

export const getGutTip = (condition: string): string => {
  const tips = GUT_TIPS[condition] || GUT_TIPS["I'm Healthy"];
  return tips[Math.floor(Date.now() / 86400000) % tips.length];
};

export const getMealMessage = (
  meal: 'breakfast' | 'lunch' | 'dinner', condition: string,
): { title: string; body: string } => ({
  breakfast: { title: '🌅 Breakfast Time!', body: `Time for breakfast! Check if your food is safe for your ${condition}.` },
  lunch:     { title: '☀️ Lunch Break!',    body: `It's lunch time! Scan your meal before eating to protect your gut.` },
  dinner:    { title: '🌙 Dinner Time',     body: `Dinner time! Remember to eat light and gut-friendly for your ${condition}.` },
}[meal]);

let scheduledTimers: ReturnType<typeof setTimeout>[] = [];

export const clearAllScheduled = () => {
  scheduledTimers.forEach(t => clearTimeout(t));
  scheduledTimers = [];
};

export const scheduleNotificationsForDay = (
  schedule: NotificationSchedule, condition: string, hasCheckedFoodToday: boolean,
) => {
  clearAllScheduled();
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const scheduleAt = (timeStr: string, cb: () => void) => {
    const [h, m] = timeStr.split(':').map(Number);
    const t = new Date(); t.setHours(h, m, 0, 0);
    const delay = t.getTime() - now.getTime();
    if (delay > 0) scheduledTimers.push(setTimeout(cb, delay));
  };

  if (schedule.mealReminders) {
    (['breakfast', 'lunch', 'dinner'] as const).forEach(meal => {
      scheduleAt(schedule.mealReminderTimes[meal], () => {
        const msg = getMealMessage(meal, condition);
        sendNotification(msg.title, msg.body, '/icons/icon.svg', '/icons/icon.svg', `meal-${meal}`, { url: '/check' });
      });
    });
  }

  if (schedule.dailyTip) {
    scheduleAt(schedule.dailyTipTime, () => {
      sendNotification('💡 Your Daily Gut Tip', getGutTip(condition), '/icons/icon.svg', '/icons/icon.svg', 'daily-tip', { url: '/dashboard' });
    });
  }

  if (schedule.streakReminder && !hasCheckedFoodToday) {
    scheduleAt(schedule.streakReminderTime, () => {
      sendNotification("🔥 Keep Your Streak Alive!", "You haven't checked any food today. Log a meal to maintain your streak!", '/icons/icon.svg', '/icons/icon.svg', 'streak-reminder', { url: '/check' });
    });
  }
};
