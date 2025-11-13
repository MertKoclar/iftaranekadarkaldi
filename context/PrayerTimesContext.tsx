import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getPrayerTimesByCity, getPrayerTimesByCoordinates } from '../services/api';
import { getAutoLocation, getLocationData, saveLocationData } from '../services/location';
import { getNotificationSettings, schedulePrayerNotifications } from '../services/notifications';
import { LocationData, NotificationSettings, PrayerTimesData } from '../types';
import { getErrorMessage } from '../utils/errorHandler';
import { useLanguage } from './LanguageContext';
import { useNetwork } from './NetworkContext';

const CURRENT_PRAYER_TIMES_KEY = '@current_prayer_times';

interface PrayerTimesContextType {
  prayerTimes: PrayerTimesData | null;
  location: LocationData | null;
  notificationSettings: NotificationSettings;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  isRetrying: boolean;
  refreshPrayerTimes: () => Promise<void>;
  updateLocation: (location: LocationData) => Promise<void>;
  setAutoLocation: () => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, isInternetReachable } = useNetwork();
  const { t } = useLanguage();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    fajr: { enabled: true, beforeMinutes: 0 },
    maghrib: { enabled: true, beforeMinutes: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Offline durumunu kontrol et
  useEffect(() => {
    const offline = !isConnected || isInternetReachable === false;
    setIsOffline(offline);
  }, [isConnected, isInternetReachable]);

  // Cache'den vakitleri yükle
  const loadPrayerTimesFromCache = useCallback(async (): Promise<PrayerTimesData | null> => {
    try {
      const cached = await AsyncStorage.getItem(CURRENT_PRAYER_TIMES_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Bugünün verisi ise cache'den kullan
        const today = new Date();
        const cacheDate = new Date(timestamp);
        if (
          cacheDate.getDate() === today.getDate() &&
          cacheDate.getMonth() === today.getMonth() &&
          cacheDate.getFullYear() === today.getFullYear()
        ) {
          return data;
        }
      }
    } catch (error) {
      console.error('Cache okuma hatası:', error);
    }
    return null;
  }, []);

  // Vakitleri cache'e kaydet
  const savePrayerTimesToCache = useCallback(async (data: PrayerTimesData) => {
    try {
      await AsyncStorage.setItem(
        CURRENT_PRAYER_TIMES_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Cache kaydetme hatası:', error);
    }
  }, []);

  const loadPrayerTimes = useCallback(
    async (locationData: LocationData, settings?: NotificationSettings, retryCount: number = 0) => {
      try {
        setLoading(true);
        setError(null);
        setIsRetrying(retryCount > 0);

        // Offline modda cache'den yükle
        if (isOffline) {
          const cachedData = await loadPrayerTimesFromCache();
          if (cachedData) {
            setPrayerTimes(cachedData);
            setError(t('errors.offlineMode'));
            setLoading(false);
            return;
          } else {
            setError(t('errors.offlineDataUnavailable'));
            setLoading(false);
            return;
          }
        }

        let data: PrayerTimesData;

        if (locationData.isAuto && locationData.latitude && locationData.longitude) {
          data = await getPrayerTimesByCoordinates(
            locationData.latitude,
            locationData.longitude
          );
        } else {
          // İl ve ilçe bilgisini ayır
          let cityName = locationData.city;
          let districtName: string | undefined = undefined;

          if (locationData.city.includes(' - ')) {
            const parts = locationData.city.split(' - ');
            cityName = parts[0];
            districtName = parts[1];
          }

          data = await getPrayerTimesByCity(
            cityName,
            locationData.country,
            2, // method
            undefined, // date
            districtName // ilçe bilgisi
          );
        }

        setPrayerTimes(data);
        await savePrayerTimesToCache(data);
        setIsOffline(false);

        // Bildirimleri ayarla (eğer ayarlar verilmişse)
        const currentSettings = settings || notificationSettings;
        if (currentSettings.enabled && data.timings) {
          await schedulePrayerNotifications(data.timings, currentSettings);
        }
      } catch (err) {
        // Hata mesajını kullanıcı dostu hale getir
        const apiError = getErrorMessage(err, t);
        setError(apiError.userFriendlyMessage);

        // Eğer retryable ise ve retry sayısı 3'ten azsa, cache'den yükle
        if (apiError.retryable && retryCount < 3) {
          const cachedData = await loadPrayerTimesFromCache();
          if (cachedData) {
            setPrayerTimes(cachedData);
            setError(t('errors.offlineMode'));
          }
        } else {
          // Retryable değilse veya retry limiti aşıldıysa, cache'den yükle
          const cachedData = await loadPrayerTimesFromCache();
          if (cachedData) {
            setPrayerTimes(cachedData);
            setError(apiError.userFriendlyMessage);
          }
        }

        console.error('Namaz vakitleri yüklenirken hata:', err);
      } finally {
        setLoading(false);
        setIsRetrying(false);
      }
    },
    [notificationSettings, isOffline, t, loadPrayerTimesFromCache, savePrayerTimesToCache]
  );

  const refreshPrayerTimes = useCallback(
    async (retryCount: number = 0) => {
      if (location) {
        await loadPrayerTimes(location, undefined, retryCount);
      }
    },
    [location, loadPrayerTimes]
  );

  const updateLocation = useCallback(async (locationData: LocationData) => {
    await saveLocationData(locationData);
    setLocation(locationData);
    await loadPrayerTimes(locationData);
  }, [loadPrayerTimes]);

  const setAutoLocation = useCallback(async () => {
    setLoading(true);
    try {
      const autoLocation = await getAutoLocation(false, t);
      if (autoLocation) {
        setLocation(autoLocation);
        await loadPrayerTimes(autoLocation);
      } else {
        setError(t('errors.offlineDataUnavailable'));
        setLoading(false);
      }
    } catch (err) {
      setError(t('errors.unknownError'));
      setLoading(false);
    }
  }, [loadPrayerTimes, t]);

  const updateNotificationSettings = useCallback(async (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    // Bildirim ayarlarını kaydet
    const { saveNotificationSettings } = await import('../services/notifications');
    await saveNotificationSettings(settings);
    
    // Eğer vakitler yüklüyse, bildirimleri yeniden ayarla
    if (prayerTimes?.timings) {
      await schedulePrayerNotifications(prayerTimes.timings, settings);
    }
  }, [prayerTimes]);

  // İlk yükleme
  useEffect(() => {
    const initialize = async () => {
      try {
        // Bildirim ayarlarını yükle
        const settings = await getNotificationSettings();
        setNotificationSettings(settings);
        
        // Önce cache'den veri yüklemeyi dene (hızlı başlangıç için)
        const cachedData = await loadPrayerTimesFromCache();
        if (cachedData) {
          setPrayerTimes(cachedData);
        }
        
        // Konum verilerini yükle
        const savedLocation = await getLocationData();
        
        if (savedLocation) {
          // Eğer kaydedilmiş konum "Bilinmeyen" içeriyorsa, yeniden konum almayı dene
          if (savedLocation.city === 'Bilinmeyen' && savedLocation.isAuto) {
            console.log('Kaydedilmiş konum "Bilinmeyen" içeriyor, yeniden konum alınıyor...');
            const autoLocation = await getAutoLocation();
            if (autoLocation && autoLocation.city !== 'Bilinmeyen') {
              setLocation(autoLocation);
              await loadPrayerTimes(autoLocation, settings);
            } else {
              // Yine "Bilinmeyen" geldiyse, kaydedilmiş konumu kullan
              setLocation(savedLocation);
              await loadPrayerTimes(savedLocation, settings);
            }
          } else {
            setLocation(savedLocation);
            await loadPrayerTimes(savedLocation, settings);
          }
        } else {
          // Konum yoksa otomatik konum almayı dene
          const autoLocation = await getAutoLocation();
          if (autoLocation) {
            setLocation(autoLocation);
            await loadPrayerTimes(autoLocation, settings);
          } else {
            // Konum alınamadıysa, cache'den veri varsa onu kullan
            if (cachedData) {
              setError(t('errors.offlineMode'));
            } else {
              setError(t('errors.offlineDataUnavailable'));
            }
            setLoading(false);
          }
        }
      } catch (err) {
        // Hata durumunda cache'den veri yüklemeyi dene
        const cachedData = await loadPrayerTimesFromCache();
        if (cachedData) {
          setPrayerTimes(cachedData);
          setError(t('errors.offlineMode'));
        } else {
          const apiError = getErrorMessage(err, t);
          setError(apiError.userFriendlyMessage);
        }
        console.error('Başlatma hatası:', err);
        setLoading(false);
      }
    };
    
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bildirim ayarları değiştiğinde bildirimleri güncelle
  useEffect(() => {
    if (prayerTimes?.timings) {
      if (notificationSettings.enabled) {
        schedulePrayerNotifications(prayerTimes.timings, notificationSettings);
      } else {
        // Bildirimler kapalıysa tüm bildirimleri iptal et
        const { cancelAllNotifications } = require('../services/notifications');
        cancelAllNotifications();
      }
    }
  }, [notificationSettings, prayerTimes]);

  return (
    <PrayerTimesContext.Provider
      value={{
        prayerTimes,
        location,
        notificationSettings,
        loading,
        error,
        isOffline,
        isRetrying,
        refreshPrayerTimes,
        updateLocation,
        setAutoLocation,
        updateNotificationSettings,
      }}
    >
      {children}
    </PrayerTimesContext.Provider>
  );
};

export const usePrayerTimes = () => {
  const context = useContext(PrayerTimesContext);
  if (context === undefined) {
    throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
  }
  return context;
};

