export interface PrayerTime {
  Fajr: string; // İmsak/Sahur
  Sunrise: string; // Güneş
  Dhuhr: string; // Öğle
  Asr: string; // İkindi
  Maghrib: string; // Akşam/İftar
  Isha: string; // Yatsı
}

export interface PrayerTimesData {
  timings: PrayerTime;
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      day: string;
      month: {
        number: number;
        en: string;
      };
      year: string;
    };
    hijri: {
      date: string;
      day: string;
      month: {
        number: number;
        en: string;
        ar: string;
      };
      year: string;
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
      params: {
        Fajr: number;
        Isha: number;
      };
    };
  };
}

export interface LocationData {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isAuto: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  fajr: {
    enabled: boolean;
    beforeMinutes: number;
  };
  maghrib: {
    enabled: boolean;
    beforeMinutes: number;
  };
}

export type NextPrayerType = 'fajr' | 'maghrib' | null;

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

