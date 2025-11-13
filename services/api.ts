import { PrayerTimesData } from '../types';

const API_BASE_URL = 'http://api.aladhan.com/v1';

export interface PrayerTimesParams {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  method?: number; // 2 = Diyanet İşleri
  date?: string; // YYYY-MM-DD formatında
}

export const getPrayerTimes = async (params: PrayerTimesParams): Promise<PrayerTimesData> => {
  const { city, country, latitude, longitude, method = 2, date } = params;
  
  let url = `${API_BASE_URL}/timings`;
  
  if (date) {
    url += `/${date}`;
  }
  
  const queryParams = new URLSearchParams();
  
  if (latitude !== undefined && longitude !== undefined) {
    queryParams.append('latitude', latitude.toString());
    queryParams.append('longitude', longitude.toString());
  } else if (city && country) {
    queryParams.append('city', city);
    queryParams.append('country', country);
  }
  
  queryParams.append('method', method.toString());
  
  url += `?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.status || 'API hatası');
    }
    
    return data.data;
  } catch (error) {
    console.error('Namaz vakitleri alınırken hata:', error);
    throw error;
  }
};

export const getPrayerTimesByCoordinates = async (
  latitude: number,
  longitude: number,
  method: number = 2,
  date?: string
): Promise<PrayerTimesData> => {
  return getPrayerTimes({ latitude, longitude, method, date });
};

export const getPrayerTimesByCity = async (
  city: string,
  country: string,
  method: number = 2,
  date?: string
): Promise<PrayerTimesData> => {
  return getPrayerTimes({ city, country, method, date });
};

