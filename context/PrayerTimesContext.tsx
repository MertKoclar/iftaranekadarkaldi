import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PrayerTimesData, LocationData, NotificationSettings } from '../types';
import { getPrayerTimesByCoordinates, getPrayerTimesByCity } from '../services/api';
import { getLocationData, getAutoLocation, saveLocationData } from '../services/location';
import { getNotificationSettings, schedulePrayerNotifications } from '../services/notifications';

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

  const loadPrayerTimes = useCallback(async (locationData: LocationData) => {
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
        data = await getPrayerTimesByCity(
          locationData.city,
          locationData.country
        );
      }
      
      setPrayerTimes(data);
      
      // Bildirimleri ayarla
      if (notificationSettings.enabled && data.timings) {
        await schedulePrayerNotifications(data.timings, notificationSettings);
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
    const autoLocation = await getAutoLocation();
    if (autoLocation) {
      setLocation(autoLocation);
      await loadPrayerTimes(autoLocation);
    } else {
      setError('Konum alınamadı. Lütfen manuel olarak şehir ve ülke girin.');
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
          setLocation(savedLocation);
          await loadPrayerTimes(savedLocation);
        } else {
          // Konum yoksa otomatik konum almayı dene
          await setAutoLocation();
        }
      } catch (err) {
        setError('Uygulama başlatılırken bir hata oluştu');
        console.error('Başlatma hatası:', err);
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Bildirim ayarları değiştiğinde vakitleri yeniden yükle
  useEffect(() => {
    if (prayerTimes && notificationSettings.enabled) {
      schedulePrayerNotifications(prayerTimes.timings, notificationSettings);
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

