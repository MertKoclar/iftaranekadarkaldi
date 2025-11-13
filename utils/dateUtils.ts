import { format, parse, differenceInSeconds, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PrayerTime, NextPrayerType, Countdown } from '../types';

export const formatPrayerTime = (timeString: string): string => {
  try {
    const time = parse(timeString, 'HH:mm', new Date());
    return format(time, 'HH:mm');
  } catch {
    return timeString;
  }
};

export const getNextPrayer = (timings: PrayerTime, currentDate: Date = new Date()): {
  type: NextPrayerType;
  time: Date;
  name: string;
} | null => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  
  const prayers: Array<{ type: NextPrayerType; time: Date; name: string }> = [];
  
  // İmsak/Sahur
  const fajrTime = parse(timings.Fajr, 'HH:mm', new Date());
  const fajrDate = new Date(year, month, day, fajrTime.getHours(), fajrTime.getMinutes());
  prayers.push({ type: 'fajr', time: fajrDate, name: 'Sahur' });
  
  // İftar
  const maghribTime = parse(timings.Maghrib, 'HH:mm', new Date());
  const maghribDate = new Date(year, month, day, maghribTime.getHours(), maghribTime.getMinutes());
  prayers.push({ type: 'maghrib', time: maghribDate, name: 'İftar' });
  
  // Yarının İmsak vakti
  const tomorrowFajr = addDays(fajrDate, 1);
  prayers.push({ type: 'fajr', time: tomorrowFajr, name: 'Sahur' });
  
  // Şu anki zamandan sonraki ilk vakit
  const now = currentDate;
  const upcomingPrayers = prayers
    .filter(p => p.time > now)
    .sort((a, b) => a.time.getTime() - b.time.getTime());
  
  if (upcomingPrayers.length > 0) {
    return upcomingPrayers[0];
  }
  
  return null;
};

export const calculateCountdown = (targetDate: Date, currentDate: Date = new Date()): Countdown => {
  const totalSeconds = Math.max(0, differenceInSeconds(targetDate, currentDate));
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
  };
};

export const formatHijriDate = (hijri: { day: string; month: { en: string }; year: string }): string => {
  const monthNames: { [key: string]: string } = {
    'Muharram': 'Muharrem',
    'Safar': 'Safer',
    'Rabi\' al-awwal': 'Rebiülevvel',
    'Rabi\' al-thani': 'Rebiülahir',
    'Jumada al-awwal': 'Cemaziyelevvel',
    'Jumada al-thani': 'Cemaziyelahir',
    'Rajab': 'Recep',
    'Sha\'ban': 'Şaban',
    'Ramadan': 'Ramazan',
    'Shawwal': 'Şevval',
    'Dhu al-Qi\'dah': 'Zilkade',
    'Dhu al-Hijjah': 'Zilhicce',
  };
  
  const monthName = monthNames[hijri.month.en] || hijri.month.en;
  return `${hijri.day} ${monthName} ${hijri.year}`;
};

export const formatGregorianDate = (date: Date): string => {
  return format(date, 'd MMMM yyyy EEEE', { locale: tr });
};

