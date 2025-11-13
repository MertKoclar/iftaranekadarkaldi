import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { useTheme } from '../../context/ThemeContext';
import { calculateCountdown, formatGregorianDate, formatPrayerTime, getNextPrayer } from '../../utils/dateUtils';

const PrayerTimeRow: React.FC<{ label: string; time: string; isHighlighted?: boolean }> = ({
  label,
  time,
  isHighlighted = false,
}) => {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.prayerRow,
        isHighlighted && {
          backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
          borderLeftWidth: 4,
          borderLeftColor: '#FF9800',
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
  const { isDark } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const {
    prayerTimes,
    location,
    loading,
    error,
    isOffline,
    isRetrying,
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
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#000000' }]}>
          {t('home.loadingTimes')}
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
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
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
          {/* Konum Bilgisi ve Offline Göstergesi */}
          {location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#FF9800" />
              <Text style={[styles.locationText, { color: isDark ? '#cccccc' : '#666666' }]}>
                {location.city}, {location.country}
              </Text>
              {isOffline && (
                <View style={styles.offlineIndicator}>
                  <Ionicons name="cloud-offline" size={16} color="#f44336" />
                  <Text style={[styles.offlineText, { color: '#f44336' }]}>
                    {t('common.offline')}
                  </Text>
                </View>
              )}
              {isRetrying && (
                <View style={styles.retryIndicator}>
                  <ActivityIndicator size="small" color="#FF9800" />
                  <Text style={[styles.retryText, { color: isDark ? '#cccccc' : '#666666' }]}>
                    {t('common.retrying')}
                  </Text>
                </View>
              )}
            </View>
          )}

      {/* Tarih Bilgisi */}
      <View style={styles.dateContainer}>
        <Text style={[styles.gregorianDate, { color: isDark ? '#ffffff' : '#000000' }]}>
          {formatGregorianDate(new Date(), currentLanguage)}
        </Text>
        {/* 
        <Text style={[styles.hijriDate, { color: isDark ? '#cccccc' : '#666666' }]}>
          {formatHijriDate(date.hijri)}
        </Text>
        */}
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
          {isFajrNext ? t('home.sahur') : t('home.iftar')} {t('home.remainingTime')}
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
          {t('home.prayerTimes')}
        </Text>

        <PrayerTimeRow
          label={t('home.imsakSahur')}
          time={timings.Fajr}
          isHighlighted={nextPrayer?.type === 'fajr'}
        />
        <PrayerTimeRow label={t('home.sunrise')} time={timings.Sunrise} />
        <PrayerTimeRow label={t('home.dhuhr')} time={timings.Dhuhr} />
        <PrayerTimeRow label={t('home.asr')} time={timings.Asr} />
        <PrayerTimeRow
          label={t('home.maghribIftar')}
          time={timings.Maghrib}
          isHighlighted={nextPrayer?.type === 'maghrib'}
        />
        <PrayerTimeRow label={t('home.isha')} time={timings.Isha} />
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
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
    backgroundColor: '#FF9800',
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
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  offlineText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  retryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  retryText: {
    marginLeft: 8,
    fontSize: 12,
  },
});

