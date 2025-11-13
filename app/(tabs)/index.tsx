import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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

// Loading Skeleton Component
const LoadingSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      <View style={styles.skeletonContainer}>
        {/* Location Skeleton */}
        <Animated.View
          style={[
            styles.skeletonBox,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
              opacity,
              width: 200,
              height: 20,
              marginTop: 16,
              marginBottom: 24,
            },
          ]}
        />

        {/* Date Skeleton */}
        <Animated.View
          style={[
            styles.skeletonBox,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
              opacity,
              width: 250,
              height: 24,
              marginBottom: 32,
            },
          ]}
        />

        {/* Main Prayer Container Skeleton */}
        <Animated.View
          style={[
            styles.skeletonBox,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
              opacity,
              width: '90%',
              height: 280,
              borderRadius: 16,
              marginBottom: 24,
            },
          ]}
        />

        {/* Prayer Times Container Skeleton */}
        <Animated.View
          style={[
            styles.skeletonBox,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
              opacity,
              width: '90%',
              height: 300,
              borderRadius: 12,
            },
          ]}
        />
      </View>
    </View>
  );
};


const PrayerTimeRow: React.FC<{ label: string; time: string; isHighlighted?: boolean }> = ({
  label,
  time,
  isHighlighted = false,
}) => {
  const { isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isHighlighted) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 100,
          friction: 7,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 7,
        }),
      ]).start();
    }
  }, [isHighlighted]);

  return (
    <Animated.View
      style={[
        styles.prayerRow,
        {
          transform: [{ scale: scaleAnim }],
        },
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
    </Animated.View>
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
    totalSeconds: number;
  } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{
    type: 'fajr' | 'maghrib' | null;
    time: Date;
    name: string;
  } | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const secondsSlideAnim = useRef(new Animated.Value(0)).current;
  const minutesSlideAnim = useRef(new Animated.Value(0)).current;
  const hoursSlideAnim = useRef(new Animated.Value(0)).current;

  // Fade in animation on mount
  useEffect(() => {
    if (prayerTimes) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [prayerTimes]);

  // Previous values to detect changes
  const prevSeconds = useRef<number | null>(null);
  const prevMinutes = useRef<number | null>(null);
  const prevHours = useRef<number | null>(null);

  // Countdown slide down animation for seconds - only when value changes
  useEffect(() => {
    if (countdown && prevSeconds.current !== null && prevSeconds.current !== countdown.seconds) {
      // Reset and animate - start from top (-10) and slide down to center (0)
      secondsSlideAnim.setValue(-10);
      Animated.timing(secondsSlideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
    prevSeconds.current = countdown?.seconds ?? null;
  }, [countdown?.seconds]);

  // Countdown slide down animation for minutes - only when value changes
  useEffect(() => {
    if (countdown && prevMinutes.current !== null && prevMinutes.current !== countdown.minutes) {
      minutesSlideAnim.setValue(-10);
      Animated.timing(minutesSlideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
    prevMinutes.current = countdown?.minutes ?? null;
  }, [countdown?.minutes]);

  // Countdown slide down animation for hours - only when value changes
  useEffect(() => {
    if (countdown && prevHours.current !== null && prevHours.current !== countdown.hours) {
      hoursSlideAnim.setValue(-10);
      Animated.timing(hoursSlideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
    prevHours.current = countdown?.hours ?? null;
  }, [countdown?.hours]);

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
          totalSeconds: countdownData.totalSeconds,
        });

        // Haptic feedback when minute changes
        if (countdownData.seconds === 0 && countdownData.minutes !== countdown?.minutes) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Eğer süre dolduysa, vakitleri yenile
        if (countdownData.totalSeconds <= 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          refreshPrayerTimes();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes, refreshPrayerTimes, countdown?.minutes]);

  const formatCountdown = () => {
    if (!countdown) return '00:00:00';
    return `${String(countdown.hours).padStart(2, '0')}:${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`;
  };

  // Animated countdown component
  const AnimatedCountdownDigit: React.FC<{ value: number; animValue: Animated.Value }> = ({ value, animValue }) => {
    const { isDark } = useTheme();
    const opacity = animValue.interpolate({
      inputRange: [-10, 0],
      outputRange: [0.7, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.countdownDigitContainer}>
        <Animated.Text
          style={[
            styles.countdownText,
            {
              color: isDark ? '#ffffff' : '#000000',
              transform: [{ translateY: animValue }],
              opacity: opacity,
            },
          ]}
        >
          {String(value).padStart(2, '0')}
        </Animated.Text>
      </View>
    );
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await refreshPrayerTimes();
  };


  if (loading && !prayerTimes) {
    return <LoadingSkeleton isDark={isDark} />;
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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            refreshPrayerTimes();
          }}
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
  const progressColor = isFajrNext ? '#2196F3' : '#FF9800';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          backgroundColor: isDark ? '#000000' : '#ffffff',
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#ffffff' : '#000000'}
            colors={['#FF9800']}
            progressBackgroundColor={isDark ? '#1a1a1a' : '#ffffff'}
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
        </View>

        {/* Ana Vakit Gösterimi */}
        <View
          style={[
            styles.mainPrayerContainer,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
              borderColor: progressColor,
            },
          ]}
        >
          <Text style={[styles.mainPrayerLabel, { color: isDark ? '#cccccc' : '#666666' }]}>
            {isFajrNext ? t('home.sahur') : t('home.iftar')} {t('home.remainingTime')}
          </Text>
          <View style={styles.countdownContainer}>
            {countdown ? (
              <>
                <AnimatedCountdownDigit value={countdown.hours} animValue={hoursSlideAnim} />
                <Text style={[styles.countdownSeparator, { color: isDark ? '#ffffff' : '#000000' }]}>:</Text>
                <AnimatedCountdownDigit value={countdown.minutes} animValue={minutesSlideAnim} />
                <Text style={[styles.countdownSeparator, { color: isDark ? '#ffffff' : '#000000' }]}>:</Text>
                <AnimatedCountdownDigit value={countdown.seconds} animValue={secondsSlideAnim} />
              </>
            ) : (
              <Text style={[styles.countdownText, { color: isDark ? '#ffffff' : '#000000' }]}>00:00:00</Text>
            )}
          </View>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  skeletonBox: {
    borderRadius: 8,
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
    padding: 24,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  countdownDigitContainer: {
    height: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
    lineHeight: 50,
  },
  countdownSeparator: {
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginHorizontal: 4,
  },
  nextPrayerTime: {
    fontSize: 18,
    fontWeight: '500',
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
