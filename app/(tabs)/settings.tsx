import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdBanner } from '../../components/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { useTheme } from '../../context/ThemeContext';
import { getAllCities, getDistrictsByCity } from '../../data/turkeyCities';
import { useInterstitialAd } from '../../hooks/useInterstitialAd';
import {
  getLocationPermissionStatus,
  LocationPermissionStatus,
  requestLocationPermission
} from '../../services/location';
import {
  getNotificationPermissionStatus,
  NotificationPermissionStatus,
  requestNotificationPermissions,
  sendTestNotification
} from '../../services/notifications';
import { LocationData, NotificationSettings } from '../../types';

export default function SettingsScreen() {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const { t, currentLanguage, setLanguage, supportedLanguages } = useLanguage();
  const {
    location,
    notificationSettings,
    prayerTimes,
    updateLocation,
    setAutoLocation,
    updateNotificationSettings,
  } = usePrayerTimes();
  const { showAd } = useInterstitialAd();

  const [isAutoLocation, setIsAutoLocation] = useState(location?.isAuto ?? true);
  
  // Kaydedilmiş konumdan il ve ilçeyi parse et
  const parseSavedLocation = (savedCity: string) => {
    if (savedCity.includes(' - ')) {
      const parts = savedCity.split(' - ');
      return { city: parts[0], district: parts[1] };
    }
    return { city: savedCity, district: '' };
  };
  
  const [city, setCity] = useState(
    location && !location.isAuto ? parseSavedLocation(location.city).city : ''
  );
  const [district, setDistrict] = useState(
    location && !location.isAuto ? parseSavedLocation(location.city).district : ''
  );
  const [country] = useState('Türkiye');
  const [loading, setLoading] = useState(false);
  
  // Picker state'leri
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(notificationSettings.enabled);
  const [fajrEnabled, setFajrEnabled] = useState(notificationSettings.fajr.enabled);
  
  // TextInput için local state - klavye kapanma sorununu önlemek için ref kullanıyoruz
  const fajrMinutesRef = React.useRef(notificationSettings.fajr.beforeMinutes.toString());
  const maghribMinutesRef = React.useRef(notificationSettings.maghrib.beforeMinutes.toString());
  const [fajrBeforeMinutes, setFajrBeforeMinutes] = useState(notificationSettings.fajr.beforeMinutes.toString());
  
  const [maghribEnabled, setMaghribEnabled] = useState(notificationSettings.maghrib.enabled);
  const [maghribBeforeMinutes, setMaghribBeforeMinutes] = useState(notificationSettings.maghrib.beforeMinutes.toString());

  // İzin durumları
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermissionStatus>('undetermined');
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<LocationPermissionStatus>('undetermined');
  const [checkingPermissions, setCheckingPermissions] = useState(false);

  // Tema modu state'lerini güncelle
  const [isLightMode, setIsLightMode] = useState(themeMode === 'light');
  const [isDarkMode, setIsDarkMode] = useState(themeMode === 'dark');
  const [isAutoMode, setIsAutoMode] = useState(themeMode === 'auto');

  useEffect(() => {
    setIsLightMode(themeMode === 'light');
    setIsDarkMode(themeMode === 'dark');
    setIsAutoMode(themeMode === 'auto');
  }, [themeMode]);

  // İzin durumlarını kontrol et
  useEffect(() => {
    const checkPermissions = async () => {
      setCheckingPermissions(true);
      try {
        const [notifStatus, locStatus] = await Promise.all([
          getNotificationPermissionStatus(),
          getLocationPermissionStatus(),
        ]);
        setNotificationPermissionStatus(notifStatus.status);
        setLocationPermissionStatus(locStatus.status);
      } catch (error) {
        console.error('İzin durumları kontrol edilirken hata:', error);
      } finally {
        setCheckingPermissions(false);
      }
    };

    checkPermissions();
  }, []);

  const handleThemeChange = async (mode: 'light' | 'dark' | 'auto') => {
    await setThemeMode(mode);
  };

  // Location değiştiğinde state'leri güncelle
  useEffect(() => {
    if (location) {
      setIsAutoLocation(location.isAuto);
      if (!location.isAuto && location.city) {
        const parsed = parseSavedLocation(location.city);
        setCity(parsed.city);
        setDistrict(parsed.district);
      }
    }
  }, [location]);

  // İl seçildiğinde ilçeleri yükle
  useEffect(() => {
    if (city) {
      const districts = getDistrictsByCity(city);
      setAvailableDistricts(districts);
    }
  }, [city]);

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setDistrict(''); // İl değiştiğinde ilçeyi sıfırla
    setShowCityModal(false);
  };

  const handleDistrictSelect = (selectedDistrict: string) => {
    setDistrict(selectedDistrict);
    setShowDistrictModal(false);
  };

  const handleSaveLocation = async () => {
    if (!isAutoLocation) {
      if (!city.trim()) {
        Alert.alert(t('common.error'), t('settings.location.selectCityError'));
        return;
      }
    }

    setLoading(true);
    try {
      if (isAutoLocation) {
        // Otomatik konum için izin kontrolü
        const hasPermission = await requestLocationPermission(true, t);
        if (!hasPermission) {
          setLoading(false);
          return;
        }
        await setAutoLocation();
        // İzin durumunu güncelle
        const locStatus = await getLocationPermissionStatus();
        setLocationPermissionStatus(locStatus.status);
      } else {
        // İlçe varsa il ile birlikte gönder, yoksa sadece il
        const cityName = district ? `${city} - ${district}` : city;
        const locationData: LocationData = {
          city: cityName,
          country: 'Türkiye',
          isAuto: false,
        };
        await updateLocation(locationData);
      }
      Alert.alert(t('common.success'), t('settings.location.success'));
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.location.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNotificationPermission = async () => {
    setCheckingPermissions(true);
    try {
      const granted = await requestNotificationPermissions(true, t);
      if (granted) {
        const status = await getNotificationPermissionStatus();
        setNotificationPermissionStatus(status.status);
      }
    } catch (error) {
      console.error('Bildirim izni istenirken hata:', error);
    } finally {
      setCheckingPermissions(false);
    }
  };

  const handleRequestLocationPermission = async () => {
    setCheckingPermissions(true);
    try {
      const granted = await requestLocationPermission(true, t);
      if (granted) {
        const status = await getLocationPermissionStatus();
        setLocationPermissionStatus(status.status);
      }
    } catch (error) {
      console.error('Konum izni istenirken hata:', error);
    } finally {
      setCheckingPermissions(false);
    }
  };

  const handleSaveNotifications = async () => {
    // Ref'lerdeki güncel değerleri al
    const fajrMinutes = parseInt(fajrMinutesRef.current) || 0;
    const maghribMinutes = parseInt(maghribMinutesRef.current) || 0;
    
    const settings: NotificationSettings = {
      enabled: notificationsEnabled,
      fajr: {
        enabled: fajrEnabled,
        beforeMinutes: fajrMinutes,
      },
      maghrib: {
        enabled: maghribEnabled,
        beforeMinutes: maghribMinutes,
      },
    };

    try {
      await updateNotificationSettings(settings);
      // State'leri güncelle
      setFajrBeforeMinutes(fajrMinutes.toString());
      setMaghribBeforeMinutes(maghribMinutes.toString());
      Alert.alert(t('common.success'), t('settings.notifications.success'));
      // Interstitial reklam göster
      setTimeout(() => showAd(), 500);
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.notifications.error'));
    }
  };

  const handleTestNotification = async () => {
    if (!prayerTimes?.timings) {
      Alert.alert(
        t('common.error'),
        t('settings.notifications.testErrorNoTimes')
      );
      return;
    }

    const hasPermission = await requestNotificationPermissions(true, t);
    if (!hasPermission) {
      return;
    }

    const success = await sendTestNotification(prayerTimes.timings, notificationSettings);
    if (success) {
      Alert.alert(
        t('common.success'),
        t('settings.notifications.testSent')
      );
    } else {
      Alert.alert(
        t('common.error'),
        t('settings.notifications.testError')
      );
    }
  };

  const SettingSection: React.FC<{ 
    title: string; 
    children: React.ReactNode;
    badge?: React.ReactNode;
  }> = ({
    title,
    children,
    badge,
  }) => (
    <View style={[styles.section, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
          {title}
        </Text>
        {badge}
      </View>
      {children}
    </View>
  );

  const SettingRow: React.FC<{
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }> = ({ label, value, onValueChange, disabled = false }) => (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#767577', true: '#FF9800' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
    >
      {/* Tema Ayarları */}
      <SettingSection title={t('settings.theme.title')}>
        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: isLightMode
                  ? (isDark ? '#2a2a2a' : '#f0f0f0')
                  : 'transparent',
                borderColor: isLightMode ? '#FF9800' : (isDark ? '#444444' : '#cccccc'),
              },
            ]}
            onPress={() => handleThemeChange('light')}
          >
            <Ionicons
              name="sunny"
              size={24}
              color={isLightMode ? '#FF9800' : (isDark ? '#666666' : '#999999')}
            />
            <Text
              style={[
                styles.themeOptionText,
                {
                  color: isLightMode
                    ? (isDark ? '#ffffff' : '#000000')
                    : (isDark ? '#666666' : '#999999'),
                  fontWeight: isLightMode ? '600' : '400',
                },
              ]}
            >
              {t('settings.theme.light')}
            </Text>
            {isLightMode && (
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" style={styles.checkIcon} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: isDarkMode
                  ? (isDark ? '#2a2a2a' : '#f0f0f0')
                  : 'transparent',
                borderColor: isDarkMode ? '#FF9800' : (isDark ? '#444444' : '#cccccc'),
              },
            ]}
            onPress={() => handleThemeChange('dark')}
          >
            <Ionicons
              name="moon"
              size={24}
              color={isDarkMode ? '#FF9800' : (isDark ? '#666666' : '#999999')}
            />
            <Text
              style={[
                styles.themeOptionText,
                {
                  color: isDarkMode
                    ? (isDark ? '#ffffff' : '#000000')
                    : (isDark ? '#666666' : '#999999'),
                  fontWeight: isDarkMode ? '600' : '400',
                },
              ]}
            >
              {t('settings.theme.dark')}
            </Text>
            {isDarkMode && (
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" style={styles.checkIcon} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: isAutoMode
                  ? (isDark ? '#2a2a2a' : '#f0f0f0')
                  : 'transparent',
                borderColor: isAutoMode ? '#FF9800' : (isDark ? '#444444' : '#cccccc'),
              },
            ]}
            onPress={() => handleThemeChange('auto')}
          >
            <Ionicons
              name="phone-portrait"
              size={24}
              color={isAutoMode ? '#FF9800' : (isDark ? '#666666' : '#999999')}
            />
            <Text
              style={[
                styles.themeOptionText,
                {
                  color: isAutoMode
                    ? (isDark ? '#ffffff' : '#000000')
                    : (isDark ? '#666666' : '#999999'),
                  fontWeight: isAutoMode ? '600' : '400',
                },
              ]}
            >
              {t('settings.theme.auto')}
            </Text>
            {isAutoMode && (
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        </View>
      </SettingSection>

      {/* Dil Ayarları */}
      <SettingSection title={t('settings.language.title')}>
        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: currentLanguage === 'tr'
                  ? (isDark ? '#2a2a2a' : '#f0f0f0')
                  : 'transparent',
                borderColor: currentLanguage === 'tr' ? '#FF9800' : (isDark ? '#444444' : '#cccccc'),
              },
            ]}
            onPress={() => setLanguage('tr')}
          >
            <Ionicons
              name="language"
              size={24}
              color={currentLanguage === 'tr' ? '#FF9800' : (isDark ? '#666666' : '#999999')}
            />
            <Text
              style={[
                styles.themeOptionText,
                {
                  color: currentLanguage === 'tr'
                    ? (isDark ? '#ffffff' : '#000000')
                    : (isDark ? '#666666' : '#999999'),
                  fontWeight: currentLanguage === 'tr' ? '600' : '400',
                },
              ]}
            >
              {t('settings.language.turkish')}
            </Text>
            {currentLanguage === 'tr' && (
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" style={styles.checkIcon} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: currentLanguage === 'en'
                  ? (isDark ? '#2a2a2a' : '#f0f0f0')
                  : 'transparent',
                borderColor: currentLanguage === 'en' ? '#FF9800' : (isDark ? '#444444' : '#cccccc'),
              },
            ]}
            onPress={() => setLanguage('en')}
          >
            <Ionicons
              name="language"
              size={24}
              color={currentLanguage === 'en' ? '#FF9800' : (isDark ? '#666666' : '#999999')}
            />
            <Text
              style={[
                styles.themeOptionText,
                {
                  color: currentLanguage === 'en'
                    ? (isDark ? '#ffffff' : '#000000')
                    : (isDark ? '#666666' : '#999999'),
                  fontWeight: currentLanguage === 'en' ? '600' : '400',
                },
              ]}
            >
              {t('settings.language.english')}
            </Text>
            {currentLanguage === 'en' && (
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" style={styles.checkIcon} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: currentLanguage === 'ar'
                  ? (isDark ? '#2a2a2a' : '#f0f0f0')
                  : 'transparent',
                borderColor: currentLanguage === 'ar' ? '#FF9800' : (isDark ? '#444444' : '#cccccc'),
              },
            ]}
            onPress={() => setLanguage('ar')}
          >
            <Ionicons
              name="language"
              size={24}
              color={currentLanguage === 'ar' ? '#FF9800' : (isDark ? '#666666' : '#999999')}
            />
            <Text
              style={[
                styles.themeOptionText,
                {
                  color: currentLanguage === 'ar'
                    ? (isDark ? '#ffffff' : '#000000')
                    : (isDark ? '#666666' : '#999999'),
                  fontWeight: currentLanguage === 'ar' ? '600' : '400',
                },
              ]}
            >
              {t('settings.language.arabic')}
            </Text>
            {currentLanguage === 'ar' && (
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        </View>
      </SettingSection>

      {/* Konum Ayarları */}
      <SettingSection 
        title={t('settings.location.title')}
        badge={
          isAutoLocation ? (
            <TouchableOpacity
              style={styles.permissionBadge}
              onPress={locationPermissionStatus !== 'granted' ? handleRequestLocationPermission : undefined}
              disabled={checkingPermissions || locationPermissionStatus === 'granted'}
            >
              <Ionicons
                name={locationPermissionStatus === 'granted' ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={locationPermissionStatus === 'granted' ? '#4CAF50' : '#f44336'}
              />
            </TouchableOpacity>
          ) : null
        }
      >
        <SettingRow
          label={t('settings.location.auto')}
          value={isAutoLocation}
          onValueChange={setIsAutoLocation}
        />

        {!isAutoLocation && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('settings.location.city')}
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                {
                  backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
                  borderColor: isDark ? '#444444' : '#cccccc',
                },
              ]}
              onPress={() => setShowCityModal(true)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  {
                    color: city ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#666666' : '#999999'),
                  },
                ]}
              >
                {city || t('settings.location.selectCityPlaceholder')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={isDark ? '#666666' : '#999999'} />
            </TouchableOpacity>
          </View>
        )}

        {!isAutoLocation && city && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('settings.location.districtOptional')}
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                {
                  backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
                  borderColor: isDark ? '#444444' : '#cccccc',
                },
              ]}
              onPress={() => setShowDistrictModal(true)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  {
                    color: district ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#666666' : '#999999'),
                  },
                ]}
              >
                {district || t('settings.location.selectDistrictOptional')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={isDark ? '#666666' : '#999999'} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: '#FF9800' }]}
          onPress={handleSaveLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('settings.location.saveLocation')}</Text>
          )}
        </TouchableOpacity>

        {location && (
          <View style={styles.currentLocation}>
            <Ionicons name="location" size={16} color="#FF9800" />
            <Text style={[styles.currentLocationText, { color: isDark ? '#cccccc' : '#666666' }]}>
              {t('settings.location.current')} {location.city}, {location.country}
            </Text>
          </View>
        )}
      </SettingSection>

      {/* Bildirim Ayarları */}
      <SettingSection 
        title={t('settings.notifications.title')}
        badge={
          <TouchableOpacity
            style={styles.permissionBadge}
            onPress={notificationPermissionStatus !== 'granted' ? handleRequestNotificationPermission : undefined}
            disabled={checkingPermissions || notificationPermissionStatus === 'granted'}
          >
            <Ionicons
              name={notificationPermissionStatus === 'granted' ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={notificationPermissionStatus === 'granted' ? '#4CAF50' : '#f44336'}
            />
          </TouchableOpacity>
        }
      >
        <SettingRow
          label={t('settings.notifications.enabled')}
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />

        {notificationsEnabled && (
          <>
            <View style={styles.divider} />

            <Text style={[styles.subsectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('settings.notifications.sahur.title')}
            </Text>
            <SettingRow
              label={t('settings.notifications.sahur.enabled')}
              value={fajrEnabled}
              onValueChange={setFajrEnabled}
              disabled={!notificationsEnabled}
            />
            {fajrEnabled && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {t('settings.notifications.sahur.beforeMinutes')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      borderColor: isDark ? '#444444' : '#cccccc',
                    },
                  ]}
                  defaultValue={fajrBeforeMinutes}
                  onChangeText={(text) => {
                    fajrMinutesRef.current = text.replace(/[^0-9]/g, '');
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#666666' : '#999999'}
                  blurOnSubmit={true}
                  returnKeyType="done"
                  maxLength={3}
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                />
              </View>
            )}

            <View style={styles.divider} />

            <Text style={[styles.subsectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('settings.notifications.iftar.title')}
            </Text>
            <SettingRow
              label={t('settings.notifications.iftar.enabled')}
              value={maghribEnabled}
              onValueChange={setMaghribEnabled}
              disabled={!notificationsEnabled}
            />
            {maghribEnabled && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {t('settings.notifications.iftar.beforeMinutes')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      borderColor: isDark ? '#444444' : '#cccccc',
                    },
                  ]}
                  defaultValue={maghribBeforeMinutes}
                  onChangeText={(text) => {
                    maghribMinutesRef.current = text.replace(/[^0-9]/g, '');
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#666666' : '#999999'}
                  blurOnSubmit={true}
                  returnKeyType="done"
                  maxLength={3}
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#FF9800', marginTop: 16 }]}
              onPress={handleSaveNotifications}
            >
              <Text style={styles.saveButtonText}>{t('settings.notifications.save')}</Text>
            </TouchableOpacity>
          </>
        )}
      </SettingSection>

      {/* Test Bildirimi */}
      <SettingSection title={t('settings.notifications.test.title')}>
        <Text style={[styles.testNotificationDescription, { color: isDark ? '#cccccc' : '#666666' }]}>
          {t('settings.notifications.test.description')}
        </Text>
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#FF9800' }]}
          onPress={handleTestNotification}
        >
          <Ionicons name="notifications-outline" size={20} color="#ffffff" />
          <Text style={styles.testButtonText}>{t('settings.notifications.test.send')}</Text>
        </TouchableOpacity>
      </SettingSection>

      {/* Hakkında Bölümü */}
      <SettingSection title={t('settings.about.title') || 'Hakkında'}>
        <TouchableOpacity
          style={styles.aboutRow}
          onPress={() => {
            // Privacy Policy linkini buraya ekleyin
            Linking.openURL('https://poludev.com/iftaranekadarkaldi/privacy-policy');
          }}
        >
          <View style={styles.aboutRowContent}>
            <Ionicons name="shield-checkmark-outline" size={20} color={isDark ? '#ffffff' : '#000000'} />
            <Text style={[styles.aboutRowText, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('settings.about.privacyPolicy') || 'Gizlilik Politikası'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#666666' : '#999999'} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.aboutRow}>
          <View style={styles.aboutRowContent}>
            <Ionicons name="information-circle-outline" size={20} color={isDark ? '#ffffff' : '#000000'} />
            <Text style={[styles.aboutRowText, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('settings.about.version') || 'Versiyon'}
            </Text>
          </View>
          <Text style={[styles.versionText, { color: isDark ? '#666666' : '#999999' }]}>
            {Constants.expoConfig?.version || '1.0.0'}
          </Text>
        </View>

        <View style={styles.aboutRow}>
          <View style={styles.aboutRowContent}>
            <Ionicons name="code-outline" size={20} color={isDark ? '#ffffff' : '#000000'} />
            <Text style={[styles.aboutRowText, { color: isDark ? '#ffffff' : '#000000' }]}>
              {t('settings.about.build') || 'Build'}
            </Text>
          </View>
          <Text style={[styles.versionText, { color: isDark ? '#666666' : '#999999' }]}>
            {Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1'}
          </Text>
        </View>
      </SettingSection>

      {/* İl Seçim Modal */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                {t('settings.location.selectCity')}
              </Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getAllCities()}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor: city === item ? (isDark ? '#2a2a2a' : '#f0f0f0') : 'transparent',
                    },
                  ]}
                  onPress={() => handleCitySelect(item)}
                >
                  <Text style={[styles.modalItemText, { color: isDark ? '#ffffff' : '#000000' }]}>
                    {item}
                  </Text>
                  {city === item && (
                    <Ionicons name="checkmark" size={20} color="#FF9800" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* İlçe Seçim Modal */}
      <Modal
        visible={showDistrictModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                {t('settings.location.selectDistrict')}
              </Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor: district === item ? (isDark ? '#2a2a2a' : '#f0f0f0') : 'transparent',
                    },
                  ]}
                  onPress={() => handleDistrictSelect(item)}
                >
                  <Text style={[styles.modalItemText, { color: isDark ? '#ffffff' : '#000000' }]}>
                    {item}
                  </Text>
                  {district === item && (
                    <Ionicons name="checkmark" size={20} color="#FF9800" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      
      {/* Banner Reklam */}
      <AdBanner style={{ marginTop: 20, marginBottom: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  permissionBadge: {
    padding: 4,
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  inputContainer: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  currentLocationText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#cccccc',
    marginVertical: 16,
    opacity: 0.3,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    position: 'relative',
  },
  themeOptionText: {
    fontSize: 16,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
  permissionStatusContainer: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  permissionStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  permissionStatusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    marginTop: 6,
  },
  permissionButtonText: {
    color: '#FF9800',
    fontSize: 13,
    fontWeight: '600',
  },
  permissionInfoText: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  testNotificationDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aboutRowText: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

