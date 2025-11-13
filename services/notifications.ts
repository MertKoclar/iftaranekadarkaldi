import * as Notifications from 'expo-notifications';
import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings, PrayerTime } from '../types';
import { format, parse, addMinutes, isBefore, isAfter } from 'date-fns';
import i18n from '../i18n/config';

const NOTIFICATION_SETTINGS_KEY = '@prayer_times_notifications';

// Bildirim handler'ı ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationPermissionResult {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
}

export const getNotificationPermissionStatus = async (): Promise<NotificationPermissionResult> => {
  try {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return {
      status: status as NotificationPermissionStatus,
      canAskAgain: canAskAgain ?? true,
    };
  } catch (error) {
    console.error('Bildirim izni durumu kontrol edilirken hata:', error);
    return {
      status: 'undetermined',
      canAskAgain: true,
    };
  }
};

export const openNotificationSettings = async (): Promise<void> => {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  } catch (error) {
    console.error('Ayarlar açılırken hata:', error);
  }
};

export const requestNotificationPermissions = async (
  showAlert: boolean = false,
  t?: (key: string) => string
): Promise<boolean> => {
  try {
    const { status: existingStatus, canAskAgain } = await Notifications.getPermissionsAsync();
    
    // Eğer zaten izin verilmişse
    if (existingStatus === 'granted') {
      return true;
    }
    
    // Eğer izin reddedilmişse ve tekrar sorulamıyorsa
    if (existingStatus === 'denied' && !canAskAgain) {
      if (showAlert && t) {
        Alert.alert(
          t('permissions.notification.title'),
          t('permissions.notification.denied'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('permissions.notification.openSettings'),
              onPress: openNotificationSettings,
            },
          ]
        );
      }
      return false;
    }
    
    // İzin iste
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }
    
    // İzin reddedildiyse ve alert gösterilecekse
    if (showAlert && t && status === 'denied') {
      Alert.alert(
        t('permissions.notification.title'),
        t('permissions.notification.denied'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('permissions.notification.openSettings'),
            onPress: openNotificationSettings,
          },
        ]
      );
    }
    
    return false;
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

// Test bildirimi gönder (gerçek bildirim formatında)
export const sendTestNotification = async (
  timings: PrayerTime,
  settings: NotificationSettings
): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermissions(false);
    if (!hasPermission) {
      return false;
    }

    // Mevcut dili al
    const currentLanguage = i18n.language || 'tr';
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    // Sahur vakti
    const fajrTime = parse(timings.Fajr, 'HH:mm', new Date());
    const fajrDate = new Date(year, month, day, fajrTime.getHours(), fajrTime.getMinutes());
    
    // İftar vakti
    const maghribTime = parse(timings.Maghrib, 'HH:mm', new Date());
    const maghribDate = new Date(year, month, day, maghribTime.getHours(), maghribTime.getMinutes());
    
    // Yarının Sahur vakti (eğer bugünkü geçtiyse)
    const tomorrowFajr = new Date(fajrDate);
    if (fajrDate < now) {
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    }

    // Hangi vakit daha yakın?
    const timeToFajr = tomorrowFajr.getTime() - now.getTime();
    const timeToMaghrib = maghribDate.getTime() - now.getTime();
    
    // Çeviriler
    const translations: { [key: string]: any } = {
      tr: {
        fajr: {
          title: 'Sahur Vakti',
          bodyNow: 'Sahur vakti geldi!',
          bodyBefore: (minutes: number) => `Sahur vakti ${minutes} dakika sonra!`,
        },
        maghrib: {
          title: 'İftar Vakti',
          bodyNow: 'İftar vakti geldi!',
          bodyBefore: (minutes: number) => `İftar vakti ${minutes} dakika sonra!`,
        },
      },
      en: {
        fajr: {
          title: 'Sahur Time',
          bodyNow: 'Sahur time has arrived!',
          bodyBefore: (minutes: number) => `Sahur time in ${minutes} minutes!`,
        },
        maghrib: {
          title: 'Iftar Time',
          bodyNow: 'Iftar time has arrived!',
          bodyBefore: (minutes: number) => `Iftar time in ${minutes} minutes!`,
        },
      },
      ar: {
        fajr: {
          title: 'وقت السحور',
          bodyNow: 'حان وقت السحور!',
          bodyBefore: (minutes: number) => `وقت السحور بعد ${minutes} دقيقة!`,
        },
        maghrib: {
          title: 'وقت الإفطار',
          bodyNow: 'حان وقت الإفطار!',
          bodyBefore: (minutes: number) => `وقت الإفطار بعد ${minutes} دقيقة!`,
        },
      },
    };

    const t = translations[currentLanguage] || translations.tr;
    let notificationContent: { title: string; body: string };

    // Sahur daha yakınsa
    if (timeToFajr > 0 && (timeToMaghrib <= 0 || timeToFajr < timeToMaghrib)) {
      const beforeMinutes = settings.fajr.beforeMinutes || 0;
      notificationContent = {
        title: t.fajr.title,
        body: beforeMinutes > 0 ? t.fajr.bodyBefore(beforeMinutes) : t.fajr.bodyNow,
      };
    } 
    // İftar daha yakınsa veya Sahur geçtiyse
    else if (timeToMaghrib > 0) {
      const beforeMinutes = settings.maghrib.beforeMinutes || 0;
      notificationContent = {
        title: t.maghrib.title,
        body: beforeMinutes > 0 ? t.maghrib.bodyBefore(beforeMinutes) : t.maghrib.bodyNow,
      };
    } 
    // Her ikisi de geçtiyse, yarının Sahur'unu göster
    else {
      const beforeMinutes = settings.fajr.beforeMinutes || 0;
      notificationContent = {
        title: t.fajr.title,
        body: beforeMinutes > 0 ? t.fajr.bodyBefore(beforeMinutes) : t.fajr.bodyNow,
      };
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        ...notificationContent,
        sound: true,
      },
      trigger: {
        seconds: 2, // 2 saniye sonra gönder
      },
    });

    return true;
  } catch (error) {
    console.error('Test bildirimi gönderilirken hata:', error);
    return false;
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
    
    const hasPermission = await requestNotificationPermissions(false);
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

