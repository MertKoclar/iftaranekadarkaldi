import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from '../types';

const LOCATION_STORAGE_KEY = '@prayer_times_location';

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Konum izni alınırken hata:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    
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
      return {
        city: address.city || address.subAdministrativeArea || 'Bilinmeyen',
        country: address.country || 'Bilinmeyen',
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

export const getAutoLocation = async (): Promise<LocationData | null> => {
  try {
    const location = await getCurrentLocation();
    
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

