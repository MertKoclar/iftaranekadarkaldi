import { PrayerTimesData } from '../types';
import { getCoordinates } from '../data/turkeyCityCoordinates';

const API_BASE_URL = 'https://api.aladhan.com/v1';

// Türkçe şehir adlarını İngilizce'ye çevir (Aladhan API için)
const cityNameMapping: { [key: string]: string } = {
  'İstanbul': 'Istanbul',
  'İzmir': 'Izmir',
  'Iğdır': 'Igdir',
  'Şanlıurfa': 'Sanliurfa',
  'Şırnak': 'Sirnak',
  // Diğer şehirler genellikle aynı kalıyor
};

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
    // Türkiye için ülke adını "Turkey" olarak gönder
    const countryName = country === 'Türkiye' ? 'Turkey' : country;
    // Şehir adını temizle ve normalize et
    let cityName = city.trim();
    // Türkçe şehir adını İngilizce'ye çevir (eğer mapping varsa)
    cityName = cityNameMapping[cityName] || cityName;
    queryParams.append('city', cityName);
    queryParams.append('country', countryName);
  }
  
  queryParams.append('method', method.toString());
  
  url += `?${queryParams.toString()}`;
  
  // Debug: URL'yi logla
  console.log('API isteği URL:', url);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.status || data.data?.status || `API hatası: ${response.status}`;
      console.error('API yanıt hatası:', errorMessage, 'URL:', url);
      console.error('API yanıt verisi:', JSON.stringify(data, null, 2));
      throw new Error(errorMessage);
    }
    
    if (data.code !== 200) {
      const errorMessage = data.status || data.data?.status || 'API hatası';
      console.error('API veri hatası:', errorMessage, 'URL:', url);
      console.error('API yanıt verisi:', JSON.stringify(data, null, 2));
      throw new Error(errorMessage);
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
  date?: string,
  district?: string
): Promise<PrayerTimesData> => {
  // Önce il ve ilçe koordinatını bulmayı deneyelim (daha güvenilir)
  const coordinates = getCoordinates(city, district);
  
  if (coordinates) {
    // Koordinat bulundu, koordinat ile API çağrısı yap
    const locationInfo = district ? `${city} - ${district}` : city;
    console.log(`"${locationInfo}" için koordinat bulundu, koordinat ile API çağrısı yapılıyor...`);
    return await getPrayerTimes({ 
      latitude: coordinates.latitude, 
      longitude: coordinates.longitude, 
      method, 
      date 
    });
  }
  
  // Koordinat bulunamadı, şehir adı ile deneyelim
  console.log(`"${city}" için koordinat bulunamadı, şehir adı ile API çağrısı yapılıyor...`);
  return await getPrayerTimes({ city, country, method, date });
};

