import { useState, useEffect } from 'react';
import {
  NotificationSchedule, DEFAULT_SCHEDULE,
  requestPermission, getPermissionStatus,
  scheduleNotificationsForDay, sendNotification, isNotificationSupported,
} from '@/services/notifications';
import { useUser } from '@/context/UserContext';

const STORAGE_KEY = 'gutsense_notification_schedule';

export const useNotifications = () => {
  const { gutCondition, foodHistory } = useUser();

  const [permission, setPermission] = useState<NotificationPermission>(getPermissionStatus());
  const [schedule, setSchedule] = useState<NotificationSchedule>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : DEFAULT_SCHEDULE; }
    catch { return DEFAULT_SCHEDULE; }
  });
  const [isSupported] = useState(isNotificationSupported());

  const hasCheckedFoodToday = (): boolean => {
    const today = new Date().toDateString();
    return (foodHistory || []).some(log => new Date(log.date).toDateString() === today);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    if (permission === 'granted') {
      scheduleNotificationsForDay(schedule, gutCondition || "I'm Healthy", hasCheckedFoodToday());
    }
  }, [schedule, permission, gutCondition]);

  useEffect(() => {
    if (permission === 'granted') {
      scheduleNotificationsForDay(schedule, gutCondition || "I'm Healthy", hasCheckedFoodToday());
    }
  }, []);

  const enable = async (): Promise<boolean> => {
    const granted = await requestPermission();
    const newPerm: NotificationPermission = granted ? 'granted' : 'denied';
    setPermission(newPerm);
    if (granted) {
      scheduleNotificationsForDay(schedule, gutCondition || "I'm Healthy", hasCheckedFoodToday());
      sendNotification('🎉 GutSense Notifications On!', "You'll now receive meal reminders and daily gut tips.");
    }
    return granted;
  };

  const updateSchedule = (updates: Partial<NotificationSchedule>) =>
    setSchedule(prev => ({ ...prev, ...updates }));

  const sendTestNotification = () =>
    sendNotification('🧪 Test Notification', 'GutSense notifications are working correctly!');

  return {
    permission, isSupported, schedule, updateSchedule,
    enable, sendTestNotification,
    isEnabled: permission === 'granted',
  };
};
