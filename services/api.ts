import { PrayerTimesData } from '../types';
import { getCoordinates } from '../data/turkeyCityCoordinates';
import { getErrorMessage, retryWithBackoff, ApiError } from '../utils/errorHandler';

const API_BASE_URL = 'https://api.aladhan.com/v1';

// Hata mesajlarını çevirmek için basit bir fonksiyon (i18n olmadan)
const getErrorTranslation = (code: string): string => {
  const translations: { [key: string]: string } = {
    NETWORK_ERROR: 'İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.',
    BAD_REQUEST: 'Geçersiz istek. Lütfen konum bilgilerinizi kontrol edin.',
    UNAUTHORIZED: 'Yetkilendirme hatası.',
    FORBIDDEN: 'Bu işlem için yetkiniz yok.',
    NOT_FOUND: 'İstenen veri bulunamadı.',
    RATE_LIMIT: 'Çok fazla istek gönderildi. Lütfen birkaç saniye sonra tekrar deneyin.',
    SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    SERVICE_UNAVAILABLE: 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
    UNKNOWN_ERROR: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
  };
  return translations[code] || translations.UNKNOWN_ERROR;
};

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

export const getPrayerTimes = async (
  params: PrayerTimesParams,
  retryCount: number = 3
): Promise<PrayerTimesData> => {
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
  
  // Retry mekanizması ile API çağrısı
  return retryWithBackoff(async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // HTTP status koduna göre hata oluştur
        const error = new Error(`HTTP ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }
      
      if (data.code !== 200) {
        const errorMessage = data.status || data.data?.status || 'API hatası';
        const error = new Error(errorMessage);
        (error as any).status = data.code;
        throw error;
      }
      
      return data.data;
    } catch (error) {
      // Network hatası kontrolü
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error('NETWORK_ERROR');
        (networkError as any).isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  }, retryCount);
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

