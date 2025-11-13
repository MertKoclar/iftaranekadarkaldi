import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { useTheme } from '../../context/ThemeContext';
import { LocationData, NotificationSettings } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const {
    location,
    notificationSettings,
    updateLocation,
    setAutoLocation,
    updateNotificationSettings,
  } = usePrayerTimes();

  const [isAutoLocation, setIsAutoLocation] = useState(location?.isAuto ?? true);
  const [city, setCity] = useState(location?.city || '');
  const [country, setCountry] = useState(location?.country || '');
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(notificationSettings.enabled);
  const [fajrEnabled, setFajrEnabled] = useState(notificationSettings.fajr.enabled);
  const [fajrBeforeMinutes, setFajrBeforeMinutes] = useState(notificationSettings.fajr.beforeMinutes.toString());
  const [maghribEnabled, setMaghribEnabled] = useState(notificationSettings.maghrib.enabled);
  const [maghribBeforeMinutes, setMaghribBeforeMinutes] = useState(notificationSettings.maghrib.beforeMinutes.toString());

  // Tema modu state'lerini güncelle
  const [isLightMode, setIsLightMode] = useState(themeMode === 'light');
  const [isDarkMode, setIsDarkMode] = useState(themeMode === 'dark');
  const [isAutoMode, setIsAutoMode] = useState(themeMode === 'auto');

  useEffect(() => {
    setIsLightMode(themeMode === 'light');
    setIsDarkMode(themeMode === 'dark');
    setIsAutoMode(themeMode === 'auto');
  }, [themeMode]);

  const handleThemeChange = async (mode: 'light' | 'dark' | 'auto') => {
    await setThemeMode(mode);
  };

  const handleSaveLocation = async () => {
    if (!isAutoLocation) {
      if (!city.trim() || !country.trim()) {
        Alert.alert('Hata', 'Lütfen şehir ve ülke bilgilerini girin.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isAutoLocation) {
        await setAutoLocation();
      } else {
        const locationData: LocationData = {
          city: city.trim(),
          country: country.trim(),
          isAuto: false,
        };
        await updateLocation(locationData);
      }
      Alert.alert('Başarılı', 'Konum ayarları kaydedildi.');
    } catch (error) {
      Alert.alert('Hata', 'Konum ayarları kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    const settings: NotificationSettings = {
      enabled: notificationsEnabled,
      fajr: {
        enabled: fajrEnabled,
        beforeMinutes: parseInt(fajrBeforeMinutes) || 0,
      },
      maghrib: {
        enabled: maghribEnabled,
        beforeMinutes: parseInt(maghribBeforeMinutes) || 0,
      },
    };

    try {
      await updateNotificationSettings(settings);
      Alert.alert('Başarılı', 'Bildirim ayarları kaydedildi.');
    } catch (error) {
      Alert.alert('Hata', 'Bildirim ayarları kaydedilirken bir hata oluştu.');
    }
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <View style={[styles.section, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
        {title}
      </Text>
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
    >
      {/* Tema Ayarları */}
      <SettingSection title="Tema Ayarları">
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
              Açık
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
              Koyu
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
              Otomatik
            </Text>
            {isAutoMode && (
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        </View>
      </SettingSection>

      {/* Konum Ayarları */}
      <SettingSection title="Konum Ayarları">
        <SettingRow
          label="Otomatik Konum"
          value={isAutoLocation}
          onValueChange={setIsAutoLocation}
        />

        {!isAutoLocation && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
              Şehir
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
              value={city}
              onChangeText={setCity}
              placeholder="Örn: İstanbul"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
            />
          </View>
        )}

        {!isAutoLocation && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
              Ülke
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
              value={country}
              onChangeText={setCountry}
              placeholder="Örn: Türkiye"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
            />
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
            <Text style={styles.saveButtonText}>Konum Ayarlarını Kaydet</Text>
          )}
        </TouchableOpacity>

        {location && (
          <View style={styles.currentLocation}>
            <Ionicons name="location" size={16} color="#FF9800" />
            <Text style={[styles.currentLocationText, { color: isDark ? '#cccccc' : '#666666' }]}>
              Mevcut: {location.city}, {location.country}
            </Text>
          </View>
        )}
      </SettingSection>

      {/* Bildirim Ayarları */}
      <SettingSection title="Bildirim Ayarları">
        <SettingRow
          label="Bildirimleri Aç"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />

        {notificationsEnabled && (
          <>
            <View style={styles.divider} />

            <Text style={[styles.subsectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              Sahur (İmsak) Bildirimi
            </Text>
            <SettingRow
              label="Sahur bildirimi gönder"
              value={fajrEnabled}
              onValueChange={setFajrEnabled}
              disabled={!notificationsEnabled}
            />
            {fajrEnabled && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                  Kaç dakika önce bildir? (0 = vakit geldiğinde)
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
                  value={fajrBeforeMinutes}
                  onChangeText={setFajrBeforeMinutes}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#666666' : '#999999'}
                />
              </View>
            )}

            <View style={styles.divider} />

            <Text style={[styles.subsectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              İftar (Akşam) Bildirimi
            </Text>
            <SettingRow
              label="İftar bildirimi gönder"
              value={maghribEnabled}
              onValueChange={setMaghribEnabled}
              disabled={!notificationsEnabled}
            />
            {maghribEnabled && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                  Kaç dakika önce bildir? (0 = vakit geldiğinde)
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
                  value={maghribBeforeMinutes}
                  onChangeText={setMaghribBeforeMinutes}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#666666' : '#999999'}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#FF9800', marginTop: 16 }]}
              onPress={handleSaveNotifications}
            >
              <Text style={styles.saveButtonText}>Bildirim Ayarlarını Kaydet</Text>
            </TouchableOpacity>
          </>
        )}
      </SettingSection>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
});

