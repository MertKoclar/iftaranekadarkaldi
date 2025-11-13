import * as Location from 'expo-location';
import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from '../types';

const LOCATION_STORAGE_KEY = '@prayer_times_location';

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface LocationPermissionResult {
  status: LocationPermissionStatus;
  canAskAgain: boolean;
}

export const getLocationPermissionStatus = async (): Promise<LocationPermissionResult> => {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    return {
      status: status as LocationPermissionStatus,
      canAskAgain: canAskAgain ?? true,
    };
  } catch (error) {
    console.error('Konum izni durumu kontrol edilirken hata:', error);
    return {
      status: 'undetermined',
      canAskAgain: true,
    };
  }
};

export const openLocationSettings = async (): Promise<void> => {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  } catch (error) {
    console.error('Ayarlar açılırken hata:', error);
  }
};

export const requestLocationPermission = async (
  showAlert: boolean = false,
  t?: (key: string) => string
): Promise<boolean> => {
  try {
    const { status: existingStatus, canAskAgain } = await Location.getForegroundPermissionsAsync();
    
    // Eğer zaten izin verilmişse
    if (existingStatus === 'granted') {
      return true;
    }
    
    // Eğer izin reddedilmişse ve tekrar sorulamıyorsa
    if (existingStatus === 'denied' && !canAskAgain) {
      if (showAlert && t) {
        Alert.alert(
          t('permissions.location.title'),
          t('permissions.location.denied'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('permissions.location.openSettings'),
              onPress: openLocationSettings,
            },
          ]
        );
      }
      return false;
    }
    
    // İzin iste
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }
    
    // İzin reddedildiyse ve alert gösterilecekse
    if (showAlert && t && status === 'denied') {
      Alert.alert(
        t('permissions.location.title'),
        t('permissions.location.denied'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('permissions.location.openSettings'),
            onPress: openLocationSettings,
          },
        ]
      );
    }
    
    return false;
  } catch (error) {
    console.error('Konum izni alınırken hata:', error);
    return false;
  }
};

export const getCurrentLocation = async (
  showAlert: boolean = false,
  t?: (key: string) => string
): Promise<Location.LocationObject | null> => {
  try {
    const hasPermission = await requestLocationPermission(showAlert, t);
    
    if (!hasPermission) {
      throw new Error('Konum izni verilmedi');
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return location;
  } catch (error) {
    console.error('Konum alınırken hata:', error);
    return null;
  }
};

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{ city: string; country: string } | null> => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (addresses && addresses.length > 0) {
      const address = addresses[0];
      
      // Şehir bilgisini öncelik sırasına göre kontrol et
      // Türkiye'de genellikle subAdministrativeArea il adını içerir
      const city = 
        address.city || 
        address.subAdministrativeArea || 
        address.region || 
        address.district || 
        address.subLocality ||
        'Bilinmeyen';
      
      // Ülke bilgisi
      const country = address.country || 'Bilinmeyen';
      
      console.log('Reverse geocode sonucu:', {
        city: address.city,
        subAdministrativeArea: address.subAdministrativeArea,
        region: address.region,
        district: address.district,
        country: address.country,
        seçilenCity: city,
      });
      
      return {
        city,
        country,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Adres çözümleme hatası:', error);
    return null;
  }
};

export const saveLocationData = async (locationData: LocationData): Promise<void> => {
  try {
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
  } catch (error) {
    console.error('Konum verisi kaydedilirken hata:', error);
    throw error;
  }
};

export const getLocationData = async (): Promise<LocationData | null> => {
  try {
    const data = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Konum verisi okunurken hata:', error);
    return null;
  }
};

export const getAutoLocation = async (
  showAlert: boolean = false,
  t?: (key: string) => string
): Promise<LocationData | null> => {
  try {
    const location = await getCurrentLocation(showAlert, t);
    
    if (!location) {
      return null;
    }
    
    const { latitude, longitude } = location.coords;
    const address = await reverseGeocode(latitude, longitude);
    
    if (!address) {
      return null;
    }
    
    const locationData: LocationData = {
      city: address.city,
      country: address.country,
      latitude,
      longitude,
      isAuto: true,
    };
    
    await saveLocationData(locationData);
    
    return locationData;
  } catch (error) {
    console.error('Otomatik konum alınırken hata:', error);
    return null;
  }
};

