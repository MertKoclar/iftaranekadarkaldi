import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from '../locales/tr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const LANGUAGE_STORAGE_KEY = '@prayer_times_language';

// Desteklenen diller
export const supportedLanguages = {
  tr: 'Türkçe',
  en: 'English',
  ar: 'العربية',
};

// Varsayılan dili belirle (cihaz diline göre veya Türkçe)
const getDefaultLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en' || savedLanguage === 'ar')) {
      return savedLanguage;
    }
    
    // Cihaz dilini kontrol et
    const deviceLanguage = Localization.locale.split('-')[0];
    if (deviceLanguage === 'tr' || deviceLanguage === 'en' || deviceLanguage === 'ar') {
      return deviceLanguage;
    }
    
    return 'tr'; // Varsayılan Türkçe
  } catch (error) {
    console.error('Dil yüklenirken hata:', error);
    return 'tr';
  }
};

// Dil kaydetme fonksiyonu
export const saveLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Dil kaydedilirken hata:', error);
  }
};

// i18n konfigürasyonu
const getInitialLanguage = (): string => {
  try {
    // Cihaz dilini kontrol et
    const deviceLanguage = Localization.locale.split('-')[0];
    if (deviceLanguage === 'tr' || deviceLanguage === 'en' || deviceLanguage === 'ar') {
      return deviceLanguage;
    }
    return 'tr'; // Varsayılan Türkçe
  } catch (error) {
    return 'tr';
  }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

// Uygulama başladığında kaydedilmiş dili yükle
getDefaultLanguage().then((savedLang) => {
  if (savedLang && savedLang !== i18n.language) {
    i18n.changeLanguage(savedLang);
  }
});

export default i18n;

