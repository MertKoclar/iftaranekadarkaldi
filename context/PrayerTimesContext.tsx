import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getPrayerTimesByCity, getPrayerTimesByCoordinates } from '../services/api';
import { getAutoLocation, getLocationData, saveLocationData } from '../services/location';
import { getNotificationSettings, schedulePrayerNotifications } from '../services/notifications';
import { LocationData, NotificationSettings, PrayerTimesData } from '../types';

interface PrayerTimesContextType {
  prayerTimes: PrayerTimesData | null;
  location: LocationData | null;
  notificationSettings: NotificationSettings;
  loading: boolean;
  error: string | null;
  refreshPrayerTimes: () => Promise<void>;
  updateLocation: (location: LocationData) => Promise<void>;
  setAutoLocation: () => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    fajr: { enabled: true, beforeMinutes: 0 },
    maghrib: { enabled: true, beforeMinutes: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrayerTimes = useCallback(async (locationData: LocationData, settings?: NotificationSettings) => {
    try {
      setLoading(true);
      setError(null);
      
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
      
      // Bildirimleri ayarla (eğer ayarlar verilmişse)
      const currentSettings = settings || notificationSettings;
      if (currentSettings.enabled && data.timings) {
        await schedulePrayerNotifications(data.timings, currentSettings);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Namaz vakitleri alınırken bir hata oluştu';
      setError(errorMessage);
      console.error('Namaz vakitleri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, [notificationSettings]);

  const refreshPrayerTimes = useCallback(async () => {
    if (location) {
      await loadPrayerTimes(location);
    }
  }, [location, loadPrayerTimes]);

  const updateLocation = useCallback(async (locationData: LocationData) => {
    await saveLocationData(locationData);
    setLocation(locationData);
    await loadPrayerTimes(locationData);
  }, [loadPrayerTimes]);

  const setAutoLocation = useCallback(async () => {
    setLoading(true);
    try {
      const autoLocation = await getAutoLocation();
      if (autoLocation) {
        setLocation(autoLocation);
        await loadPrayerTimes(autoLocation);
      } else {
        setError('Konum alınamadı. Lütfen manuel olarak şehir ve ülke girin.');
        setLoading(false);
      }
    } catch (err) {
      setError('Konum alınırken bir hata oluştu');
      setLoading(false);
    }
  }, [loadPrayerTimes]);

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
            setError('Konum alınamadı. Lütfen manuel olarak şehir ve ülke girin.');
            setLoading(false);
          }
        }
      } catch (err) {
        setError('Uygulama başlatılırken bir hata oluştu');
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

