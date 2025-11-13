import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, endOfYear, format, isSameDay, subWeeks } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { useTheme } from '../../context/ThemeContext';
import { getPrayerTimesByCity, getPrayerTimesByCoordinates } from '../../services/api';
import { PrayerTimesData } from '../../types';
import { formatPrayerTime } from '../../utils/dateUtils';

interface DayPrayerTimes {
  date: Date;
  data: PrayerTimesData | null;
  loading: boolean;
  error: string | null;
}

const CACHE_KEY_PREFIX = '@prayer_times_cache_';
const CACHE_EXPIRY_DAYS = 7; // Cache 7 gün geçerli

// Cache key oluştur
const getCacheKey = (locationKey: string, dateString: string): string => {
  return `${CACHE_KEY_PREFIX}${locationKey}_${dateString}`;
};

// Location için unique key oluştur
const getLocationKey = (location: { city: string; country: string; latitude?: number; longitude?: number; isAuto: boolean }): string => {
  if (location.isAuto && location.latitude && location.longitude) {
    return `auto_${location.latitude.toFixed(4)}_${location.longitude.toFixed(4)}`;
  }
  return `manual_${location.city}_${location.country}`;
};

// Cache'den oku
const getCachedPrayerTimes = async (cacheKey: string): Promise<PrayerTimesData | null> => {
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 gün
      
      if (now - timestamp < expiryTime) {
        return data;
      } else {
        // Expired cache'i sil
        await AsyncStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.error('Cache okuma hatası:', error);
  }
  return null;
};

// Cache'e kaydet
const setCachedPrayerTimes = async (cacheKey: string, data: PrayerTimesData): Promise<void> => {
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Cache kaydetme hatası:', error);
  }
};

export default function PrayerTimesScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { location } = usePrayerTimes();
  
  const [prayerTimesList, setPrayerTimesList] = useState<DayPrayerTimes[]>([]);
  const [loading, setLoading] = useState(true);

  // 1 hafta öncesinden yıl sonuna kadar olan tarihleri oluştur
  const dates = useMemo(() => {
    const today = new Date();
    const startDate = subWeeks(today, 1);
    const endDate = endOfYear(today);
    const datesList: Date[] = [];
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      datesList.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return datesList;
  }, []);

  // Vakitleri yükle (lazy loading - cache öncelikli)
  useEffect(() => {
    const loadPrayerTimes = async () => {
      if (!location) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const locationKey = getLocationKey(location);
      
      // İlk olarak tüm tarihler için boş liste oluştur
      const timesList: DayPrayerTimes[] = dates.map(date => ({
        date,
        data: null,
        loading: false,
        error: null,
      }));

      setPrayerTimesList(timesList);

      // İlk 30 günü hemen yükle (bugün dahil önceki 7 gün + sonraki 23 gün)
      const todayIndex = dates.findIndex(d => isSameDay(d, new Date()));
      const startIndex = Math.max(0, todayIndex - 7);
      const endIndex = Math.min(dates.length, todayIndex + 30);

      // İlk batch'i yükle (cache'den önce kontrol et)
      for (let i = startIndex; i < endIndex; i++) {
        const date = dates[i];
        const dateString = format(date, 'yyyy-MM-dd');
        const cacheKey = getCacheKey(locationKey, dateString);

        // Önce cache'den kontrol et
        const cachedData = await getCachedPrayerTimes(cacheKey);
        
        if (cachedData) {
          // Cache'den bulundu, direkt kullan
          setPrayerTimesList(prev => {
            const updated = [...prev];
            updated[i] = {
              ...updated[i],
              data: cachedData,
              loading: false,
            };
            return updated;
          });
          continue;
        }

        // Cache'de yok, API'den çek
        setPrayerTimesList(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            loading: true,
          };
          return updated;
        });

        try {
          let data: PrayerTimesData;

          if (location.isAuto && location.latitude && location.longitude) {
            data = await getPrayerTimesByCoordinates(
              location.latitude,
              location.longitude,
              2, // method
              dateString
            );
          } else {
            // İl ve ilçe bilgisini ayır
            let cityName = location.city;
            let districtName: string | undefined = undefined;
            
            if (location.city.includes(' - ')) {
              const parts = location.city.split(' - ');
              cityName = parts[0];
              districtName = parts[1];
            }

            data = await getPrayerTimesByCity(
              cityName,
              location.country,
              2,
              dateString,
              districtName
            );
          }

          // Cache'e kaydet
          await setCachedPrayerTimes(cacheKey, data);

          setPrayerTimesList(prev => {
            const updated = [...prev];
            updated[i] = {
              ...updated[i],
              data,
              loading: false,
            };
            return updated;
          });
        } catch (error) {
          setPrayerTimesList(prev => {
            const updated = [...prev];
            updated[i] = {
              ...updated[i],
              data: null,
              loading: false,
              error: error instanceof Error ? error.message : 'Hata oluştu',
            };
            return updated;
          });
        }

        // API rate limit'i için küçük bir gecikme
        if (i < endIndex - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      setLoading(false);
    };

    loadPrayerTimes();
  }, [location, dates]);

  // Scroll sırasında görünen tarihleri yükle (lazy loading)
  const scrollViewRef = useRef<ScrollView>(null);
  const [loadedRanges, setLoadedRanges] = useState<Set<number>>(new Set());

  const loadDateRange = async (startIndex: number, endIndex: number) => {
    if (!location) return;

    if (loadedRanges.has(startIndex)) return;

    setLoadedRanges(prev => {
      const newSet = new Set(prev);
      newSet.add(startIndex);
      return newSet;
    });

    const locationKey = getLocationKey(location);

    for (let i = startIndex; i < endIndex && i < dates.length; i++) {
      // Eğer zaten yüklenmişse atla
      if (prayerTimesList[i]?.data || prayerTimesList[i]?.loading) continue;

      const date = dates[i];
      const dateString = format(date, 'yyyy-MM-dd');
      const cacheKey = getCacheKey(locationKey, dateString);

      // Önce cache'den kontrol et
      const cachedData = await getCachedPrayerTimes(cacheKey);
      
      if (cachedData) {
        setPrayerTimesList(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            data: cachedData,
            loading: false,
          };
          return updated;
        });
        continue;
      }

      setPrayerTimesList(prev => {
        const updated = [...prev];
        if (!updated[i] || !updated[i].data) {
          updated[i] = {
            ...updated[i],
            loading: true,
          };
        }
        return updated;
      });

      try {
        let data: PrayerTimesData;

        if (location.isAuto && location.latitude && location.longitude) {
          data = await getPrayerTimesByCoordinates(
            location.latitude,
            location.longitude,
            2,
            dateString
          );
        } else {
          let cityName = location.city;
          let districtName: string | undefined = undefined;
          
          if (location.city.includes(' - ')) {
            const parts = location.city.split(' - ');
            cityName = parts[0];
            districtName = parts[1];
          }

          data = await getPrayerTimesByCity(
            cityName,
            location.country,
            2,
            dateString,
            districtName
          );
        }

        // Cache'e kaydet
        await setCachedPrayerTimes(cacheKey, data);

        setPrayerTimesList(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            data,
            loading: false,
          };
          return updated;
        });
      } catch (error) {
        setPrayerTimesList(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Hata oluştu',
          };
          return updated;
        });
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPercentage = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    const visibleStartIndex = Math.floor(scrollPercentage * dates.length);
    const visibleEndIndex = Math.min(dates.length, visibleStartIndex + 20);

    // Görünen alanın öncesi ve sonrasını yükle
    const loadStart = Math.max(0, visibleStartIndex - 10);
    const loadEnd = Math.min(dates.length, visibleEndIndex + 10);

    loadDateRange(loadStart, loadEnd);
  };

  // Tablo satırı render fonksiyonu
  const renderTableRow = (dayData: DayPrayerTimes, index: number) => {
    const { date, data, loading, error } = dayData;
    const isToday = isSameDay(date, new Date());
    const isPast = date < new Date() && !isToday;

    if (loading) {
      return (
        <View
          key={index}
          style={[
            styles.tableRow,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderBottomColor: isDark ? '#333333' : '#e0e0e0',
            },
          ]}
        >
          <View style={styles.tableCellDate}>
            <Text style={[styles.dateCell, { color: isDark ? '#ffffff' : '#000000' }]}>
              {format(date, 'd MMMM EEEE', { locale: tr })}
            </Text>
          </View>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.tableCell}>
              <ActivityIndicator size="small" color="#FF9800" />
            </View>
          ))}
        </View>
      );
    }

    if (error || !data) {
      return (
        <View
          key={index}
          style={[
            styles.tableRow,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderBottomColor: isDark ? '#333333' : '#e0e0e0',
            },
          ]}
        >
          <View style={styles.tableCellDate}>
            <Text style={[styles.dateCell, { color: isDark ? '#ffffff' : '#000000' }]}>
              {format(date, 'd MMMM EEEE', { locale: tr })}
            </Text>
          </View>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.tableCell}>
              <Text style={[styles.errorText, { color: isDark ? '#f44336' : '#d32f2f' }]}>-</Text>
            </View>
          ))}
        </View>
      );
    }

    const { timings } = data;

    return (
      <View
        key={index}
        style={[
          styles.tableRow,
          {
            backgroundColor: isToday
              ? isDark
                ? '#2a1a0a'
                : '#fff3e0'
              : isDark
              ? '#1a1a1a'
              : '#ffffff',
            borderBottomColor: isDark ? '#333333' : '#e0e0e0',
            borderLeftWidth: isToday ? 3 : 0,
            borderLeftColor: isToday ? '#FF9800' : 'transparent',
          },
          isPast && { opacity: 0.6 },
        ]}
      >
        <View style={styles.tableCellDate}>
          <Text style={[styles.dateCell, { color: isDark ? '#ffffff' : '#000000' }]}>
            {format(date, 'd MMMM EEEE', { locale: tr })}
          </Text>
          {isToday && (
            <Text style={[styles.todayLabel, { color: '#FF9800' }]}>{t('common.today')}</Text>
          )}
        </View>
        <View style={styles.tableCell}>
          <Text style={[styles.timeCell, { color: isDark ? '#ffffff' : '#000000' }]}>
            {formatPrayerTime(timings.Fajr)}
          </Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={[styles.timeCell, { color: isDark ? '#ffffff' : '#000000' }]}>
            {formatPrayerTime(timings.Sunrise)}
          </Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={[styles.timeCell, { color: isDark ? '#ffffff' : '#000000' }]}>
            {formatPrayerTime(timings.Dhuhr)}
          </Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={[styles.timeCell, { color: isDark ? '#ffffff' : '#000000' }]}>
            {formatPrayerTime(timings.Asr)}
          </Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={[styles.timeCell, { color: isDark ? '#ffffff' : '#000000' }]}>
            {formatPrayerTime(timings.Maghrib)}
          </Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={[styles.timeCell, { color: isDark ? '#ffffff' : '#000000' }]}>
            {formatPrayerTime(timings.Isha)}
          </Text>
        </View>
      </View>
    );
  };

  if (!location) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
        <Ionicons name="location-outline" size={64} color={isDark ? '#666666' : '#999999'} />
        <Text style={[styles.emptyText, { color: isDark ? '#ffffff' : '#000000' }]}>
          {t('times.locationNotSet')}
        </Text>
        <Text style={[styles.emptySubtext, { color: isDark ? '#cccccc' : '#666666' }]}>
          {t('times.locationNotSetDesc')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={16} color="#FF9800" />
          <Text style={[styles.locationText, { color: isDark ? '#cccccc' : '#666666' }]}>
            {location.city}, {location.country}
          </Text>
        </View>
      </View>

      {loading && prayerTimesList.length === 0 ? (
        <View style={[styles.centerContent, { flex: 1 }]}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#000000' }]}>
            {t('times.loading')}
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          {/* Tablo Başlığı */}
          <View
            style={[
              styles.tableHeader,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                borderBottomColor: isDark ? '#333333' : '#e0e0e0',
              },
            ]}
          >
              <View style={styles.tableHeaderCellDate}>
                <Text style={[styles.headerText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {t('times.day')}
                </Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={[styles.headerText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {t('times.imsak')}
                </Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={[styles.headerText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {t('times.sunrise')}
                </Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={[styles.headerText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {t('times.dhuhr')}
                </Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={[styles.headerText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {t('times.asr')}
                </Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={[styles.headerText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {t('times.maghrib')}
                </Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={[styles.headerText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {t('times.isha')}
                </Text>
              </View>
          </View>

          {/* Tablo Satırları */}
          {prayerTimesList.map((dayData, index) => renderTableRow(dayData, index))}
        </ScrollView>
      )}
    </View>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  // Tablo Stilleri
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderCellDate: {
    flex: 2.5,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 50,
  },
  tableCellDate: {
    flex: 2.5,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCell: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'left',
    lineHeight: 16,
  },
  todayLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  timeCell: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
  },
});

