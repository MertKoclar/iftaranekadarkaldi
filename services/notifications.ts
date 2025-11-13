import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings, PrayerTime } from '../types';
import { format, parse, addMinutes, isBefore, isAfter } from 'date-fns';

const NOTIFICATION_SETTINGS_KEY = '@prayer_times_notifications';

// Bildirim handler'ı ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Bildirim izni alınırken hata:', error);
    return false;
  }
};

export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Bildirim ayarları kaydedilirken hata:', error);
    throw error;
  }
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Varsayılan ayarlar
    return {
      enabled: false,
      fajr: {
        enabled: true,
        beforeMinutes: 0,
      },
      maghrib: {
        enabled: true,
        beforeMinutes: 0,
      },
    };
  } catch (error) {
    console.error('Bildirim ayarları okunurken hata:', error);
    return {
      enabled: false,
      fajr: {
        enabled: true,
        beforeMinutes: 0,
      },
      maghrib: {
        enabled: true,
        beforeMinutes: 0,
      },
    };
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Bildirimler iptal edilirken hata:', error);
  }
};

export const schedulePrayerNotifications = async (
  timings: PrayerTime,
  settings: NotificationSettings,
  date: Date = new Date()
): Promise<void> => {
  try {
    // Önce tüm bildirimleri iptal et
    await cancelAllNotifications();
    
    if (!settings.enabled) {
      return;
    }
    
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Bildirim izni verilmedi');
      return;
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // İmsak/Sahur bildirimi
    if (settings.fajr.enabled) {
      const fajrTime = parse(timings.Fajr, 'HH:mm', new Date());
      const fajrDate = new Date(year, month, day, fajrTime.getHours(), fajrTime.getMinutes());
      const fajrNotificationTime = addMinutes(fajrDate, -settings.fajr.beforeMinutes);
      
      if (isAfter(fajrNotificationTime, new Date())) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Sahur Vakti',
            body: settings.fajr.beforeMinutes > 0
              ? `Sahur vakti ${settings.fajr.beforeMinutes} dakika sonra!`
              : 'Sahur vakti geldi!',
            sound: true,
          },
          trigger: fajrNotificationTime,
        });
      }
    }
    
    // İftar bildirimi
    if (settings.maghrib.enabled) {
      const maghribTime = parse(timings.Maghrib, 'HH:mm', new Date());
      const maghribDate = new Date(year, month, day, maghribTime.getHours(), maghribTime.getMinutes());
      const maghribNotificationTime = addMinutes(maghribDate, -settings.maghrib.beforeMinutes);
      
      if (isAfter(maghribNotificationTime, new Date())) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'İftar Vakti',
            body: settings.maghrib.beforeMinutes > 0
              ? `İftar vakti ${settings.maghrib.beforeMinutes} dakika sonra!`
              : 'İftar vakti geldi!',
            sound: true,
          },
          trigger: maghribNotificationTime,
        });
      }
    }
    
    // Yarın için de bildirimleri ayarla
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Yarının vakitlerini almak için API çağrısı yapılabilir
    // Şimdilik sadece bugünkü vakitleri kullanıyoruz
  } catch (error) {
    console.error('Bildirimler ayarlanırken hata:', error);
  }
};

