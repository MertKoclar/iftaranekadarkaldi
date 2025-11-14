/**
 * Widget Data Service
 * 
 * Bu servis, uygulama ve widget arasında veri paylaşımı için kullanılır.
 * Widget'lar native kod ile yazıldığı için, veriler AsyncStorage veya
 * platform-specific storage (App Groups/SharedPreferences) üzerinden paylaşılır.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Countdown, LocationData, NextPrayerType, PrayerTimesData } from '../types';
import { calculateCountdown, getNextPrayer } from '../utils/dateUtils';

const WIDGET_DATA_KEY = '@widget_prayer_times_data';

export interface WidgetData {
  // Prayer times
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  
  // Location
  location: {
    city: string;
    country: string;
  };
  
  // Next prayer info
  nextPrayer: {
    type: NextPrayerType;
    name: string;
    time: string; // ISO string
  } | null;
  
  // Countdown
  countdown: Countdown | null;
  
  // Last update timestamp
  lastUpdated: string; // ISO string
  
  // Date info
  date: {
    gregorian: string; // ISO string
    hijri: {
      day: string;
      month: {
        en: string;
        ar: string;
      };
      year: string;
    };
  };
}

/**
 * Widget için güncel veriyi hazırla ve kaydet
 */
export const updateWidgetData = async (
  prayerTimes: PrayerTimesData | null,
  location: LocationData | null
): Promise<void> => {
  try {
    if (!prayerTimes || !location) {
      return;
    }

    const now = new Date();
    const nextPrayerInfo = getNextPrayer(prayerTimes.timings, now);
    const countdown = nextPrayerInfo ? calculateCountdown(nextPrayerInfo.time, now) : null;

    const widgetData: WidgetData = {
      timings: prayerTimes.timings,
      location: {
        city: location.city,
        country: location.country,
      },
      nextPrayer: nextPrayerInfo
        ? {
            type: nextPrayerInfo.type,
            name: nextPrayerInfo.name,
            time: nextPrayerInfo.time.toISOString(),
          }
        : null,
      countdown: countdown
        ? {
            hours: countdown.hours,
            minutes: countdown.minutes,
            seconds: countdown.seconds,
            totalSeconds: countdown.totalSeconds,
          }
        : null,
      lastUpdated: now.toISOString(),
      date: {
        gregorian: now.toISOString(),
        hijri: prayerTimes.date.hijri,
      },
    };

    // AsyncStorage'a kaydet (Android için)
    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));

    // Native modül ile platform-specific storage'a kaydet
    try {
      const { Platform, NativeModules } = await import('react-native');
      
      if (Platform.OS === 'ios') {
        // iOS App Groups için native modül çağrısı
        if (NativeModules.WidgetDataManager) {
          await NativeModules.WidgetDataManager.updateWidgetData(
            JSON.stringify(widgetData)
          );
        }
      } else if (Platform.OS === 'android') {
        // Android SharedPreferences için native modül çağrısı
        if (NativeModules.WidgetDataManager) {
          try {
            await NativeModules.WidgetDataManager.updateWidgetData(
              JSON.stringify(widgetData)
            );
            console.log('Widget verisi native modül ile güncellendi');
          } catch (nativeError) {
            console.error('Widget native modül hatası:', nativeError);
          }
        } else {
          console.log('WidgetDataManager native modül bulunamadı');
        }
      }
    } catch (error) {
      // Native modül henüz implement edilmediyse sessizce devam et
      // AsyncStorage zaten kaydetti, bu yeterli
      console.log('Widget native modül hatası:', error);
    }
  } catch (error) {
    console.error('Widget verisi güncellenirken hata:', error);
  }
};

/**
 * Widget verisini oku
 */
export const getWidgetData = async (): Promise<WidgetData | null> => {
  try {
    const data = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Widget verisi okunurken hata:', error);
    return null;
  }
};

/**
 * Widget verisini temizle
 */
export const clearWidgetData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WIDGET_DATA_KEY);
  } catch (error) {
    console.error('Widget verisi temizlenirken hata:', error);
  }
};

