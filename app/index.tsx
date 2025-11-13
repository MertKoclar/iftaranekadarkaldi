import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { getNextPrayer, calculateCountdown, formatPrayerTime, formatHijriDate, formatGregorianDate } from '../utils/dateUtils';
import { PrayerTime } from '../types';
import { Ionicons } from '@expo/vector-icons';

const PrayerTimeRow: React.FC<{ label: string; time: string; isHighlighted?: boolean }> = ({
  label,
  time,
  isHighlighted = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.prayerRow,
        isHighlighted && {
          backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
          borderLeftWidth: 4,
          borderLeftColor: '#4CAF50',
        },
      ]}
    >
      <Text style={[styles.prayerLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.prayerTime,
          { color: isDark ? '#ffffff' : '#000000' },
          isHighlighted && { fontWeight: 'bold', fontSize: 18 },
        ]}
      >
        {formatPrayerTime(time)}
      </Text>
    </View>
  );
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const {
    prayerTimes,
    location,
    loading,
    error,
    refreshPrayerTimes,
  } = usePrayerTimes();

  const [countdown, setCountdown] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{
    type: 'fajr' | 'maghrib' | null;
    time: Date;
    name: string;
  } | null>(null);

  // Geri sayım güncellemesi
  useEffect(() => {
    if (!prayerTimes?.timings) return;

    const next = getNextPrayer(prayerTimes.timings);
    setNextPrayer(next);

    const interval = setInterval(() => {
      if (next) {
        const countdownData = calculateCountdown(next.time);
        setCountdown({
          hours: countdownData.hours,
          minutes: countdownData.minutes,
          seconds: countdownData.seconds,
        });

        // Eğer süre dolduysa, vakitleri yenile
        if (countdownData.totalSeconds <= 0) {
          refreshPrayerTimes();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes, refreshPrayerTimes]);

  const formatCountdown = () => {
    if (!countdown) return '00:00:00';
    return `${String(countdown.hours).padStart(2, '0')}:${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`;
  };

  if (loading && !prayerTimes) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#000000' }]}>
          Vakitler yükleniyor...
        </Text>
      </View>
    );
  }

  if (error && !prayerTimes) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
        <Ionicons name="alert-circle" size={64} color="#f44336" />
        <Text style={[styles.errorText, { color: isDark ? '#ffffff' : '#000000' }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={refreshPrayerTimes}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!prayerTimes) {
    return null;
  }

  const { timings, date } = prayerTimes;
  const isFajrNext = nextPrayer?.type === 'fajr';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refreshPrayerTimes}
          tintColor={isDark ? '#ffffff' : '#000000'}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color={isDark ? '#ffffff' : '#000000'} />
        </TouchableOpacity>
      </View>

      {/* Konum Bilgisi */}
      {location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#4CAF50" />
          <Text style={[styles.locationText, { color: isDark ? '#cccccc' : '#666666' }]}>
            {location.city}, {location.country}
          </Text>
        </View>
      )}

      {/* Tarih Bilgisi */}
      <View style={styles.dateContainer}>
        <Text style={[styles.gregorianDate, { color: isDark ? '#ffffff' : '#000000' }]}>
          {formatGregorianDate(new Date())}
        </Text>
        <Text style={[styles.hijriDate, { color: isDark ? '#cccccc' : '#666666' }]}>
          {formatHijriDate(date.hijri)}
        </Text>
      </View>

      {/* Ana Vakit Gösterimi */}
      <View
        style={[
          styles.mainPrayerContainer,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderColor: isFajrNext ? '#2196F3' : '#FF9800',
          },
        ]}
      >
        <Text style={[styles.mainPrayerLabel, { color: isDark ? '#cccccc' : '#666666' }]}>
          {isFajrNext ? 'Sahur' : 'İftar'} Vakti
        </Text>
        <Text style={[styles.countdownText, { color: isDark ? '#ffffff' : '#000000' }]}>
          {formatCountdown()}
        </Text>
        <Text style={[styles.nextPrayerTime, { color: isDark ? '#cccccc' : '#666666' }]}>
          {nextPrayer ? formatPrayerTime(timings[isFajrNext ? 'Fajr' : 'Maghrib']) : '--:--'}
        </Text>
      </View>

      {/* Namaz Vakitleri Tablosu */}
      <View
        style={[
          styles.prayerTimesContainer,
          { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
          Namaz Vakitleri
        </Text>

        <PrayerTimeRow
          label="İmsak (Sahur)"
          time={timings.Fajr}
          isHighlighted={nextPrayer?.type === 'fajr'}
        />
        <PrayerTimeRow label="Güneş" time={timings.Sunrise} />
        <PrayerTimeRow label="Öğle" time={timings.Dhuhr} />
        <PrayerTimeRow label="İkindi" time={timings.Asr} />
        <PrayerTimeRow
          label="Akşam (İftar)"
          time={timings.Maghrib}
          isHighlighted={nextPrayer?.type === 'maghrib'}
        />
        <PrayerTimeRow label="Yatsı" time={timings.Isha} />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  settingsButton: {
    padding: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  gregorianDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  hijriDate: {
    fontSize: 16,
  },
  mainPrayerContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainPrayerLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  nextPrayerTime: {
    fontSize: 18,
  },
  prayerTimesContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  prayerLabel: {
    fontSize: 16,
  },
  prayerTime: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#f44336',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorBannerText: {
    color: '#ffffff',
    textAlign: 'center',
  },
});
