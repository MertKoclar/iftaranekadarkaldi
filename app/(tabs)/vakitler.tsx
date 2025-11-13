import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPrayerTime, formatGregorianDate, formatHijriDate } from '../../utils/dateUtils';
import { PrayerTimesData } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, endOfYear, subWeeks, isSameDay } from 'date-fns';
import { getPrayerTimesByCoordinates, getPrayerTimesByCity } from '../../services/api';

interface DayPrayerTimes {
  date: Date;
  data: PrayerTimesData | null;
  loading: boolean;
  error: string | null;
}

export default function PrayerTimesScreen() {
  const { isDark } = useTheme();
  const { location, prayerTimes: currentPrayerTimes } = usePrayerTimes();
  
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

  // Vakitleri yükle (lazy loading - sadece görünen ve yakın tarihleri yükle)
  useEffect(() => {
    const loadPrayerTimes = async () => {
      if (!location) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
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

      // İlk batch'i yükle
      for (let i = startIndex; i < endIndex; i++) {
        const date = dates[i];
        const dateString = format(date, 'yyyy-MM-dd');

        // Loading state'i ayarla
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

    for (let i = startIndex; i < endIndex && i < dates.length; i++) {
      // Eğer zaten yüklenmişse atla
      if (prayerTimesList[i]?.data || prayerTimesList[i]?.loading) continue;

      const date = dates[i];
      const dateString = format(date, 'yyyy-MM-dd');

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

  const PrayerTimeCard: React.FC<{ dayData: DayPrayerTimes }> = ({ dayData }) => {
    const { date, data, loading, error } = dayData;
    const isToday = isSameDay(date, new Date());
    const isPast = date < new Date() && !isToday;

    if (loading) {
      return (
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
              borderColor: isDark ? '#333333' : '#e0e0e0',
            },
          ]}
        >
          <ActivityIndicator size="small" color="#FF9800" />
        </View>
      );
    }

    if (error || !data) {
      return (
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
              borderColor: isDark ? '#333333' : '#e0e0e0',
            },
          ]}
        >
          <Text style={[styles.errorText, { color: isDark ? '#f44336' : '#d32f2f' }]}>
            {error || 'Veri yüklenemedi'}
          </Text>
        </View>
      );
    }

    const { timings, date: dateInfo } = data;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderColor: isToday ? '#FF9800' : isDark ? '#333333' : '#e0e0e0',
            borderWidth: isToday ? 2 : 1,
            opacity: isPast ? 0.6 : 1,
          },
        ]}
      >
        {/* Tarih Başlığı */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.dateText, { color: isDark ? '#ffffff' : '#000000' }]}>
              {formatGregorianDate(date)}
            </Text>
            <Text style={[styles.hijriText, { color: isDark ? '#cccccc' : '#666666' }]}>
              {formatHijriDate(dateInfo.hijri)}
            </Text>
          </View>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Bugün</Text>
            </View>
          )}
        </View>

        {/* Vakitler */}
        <View style={styles.prayerTimesGrid}>
          <View style={styles.prayerTimeItem}>
            <Text style={[styles.prayerLabel, { color: isDark ? '#cccccc' : '#666666' }]}>
              İmsak
            </Text>
            <Text style={[styles.prayerTime, { color: isDark ? '#ffffff' : '#000000' }]}>
              {formatPrayerTime(timings.Fajr)}
            </Text>
          </View>

          <View style={styles.prayerTimeItem}>
            <Text style={[styles.prayerLabel, { color: isDark ? '#cccccc' : '#666666' }]}>
              Güneş
            </Text>
            <Text style={[styles.prayerTime, { color: isDark ? '#ffffff' : '#000000' }]}>
              {formatPrayerTime(timings.Sunrise)}
            </Text>
          </View>

          <View style={styles.prayerTimeItem}>
            <Text style={[styles.prayerLabel, { color: isDark ? '#cccccc' : '#666666' }]}>
              Öğle
            </Text>
            <Text style={[styles.prayerTime, { color: isDark ? '#ffffff' : '#000000' }]}>
              {formatPrayerTime(timings.Dhuhr)}
            </Text>
          </View>

          <View style={styles.prayerTimeItem}>
            <Text style={[styles.prayerLabel, { color: isDark ? '#cccccc' : '#666666' }]}>
              İkindi
            </Text>
            <Text style={[styles.prayerTime, { color: isDark ? '#ffffff' : '#000000' }]}>
              {formatPrayerTime(timings.Asr)}
            </Text>
          </View>

          <View style={styles.prayerTimeItem}>
            <Text style={[styles.prayerLabel, { color: isDark ? '#cccccc' : '#666666' }]}>
              Akşam
            </Text>
            <Text style={[styles.prayerTime, { color: isDark ? '#ffffff' : '#000000' }]}>
              {formatPrayerTime(timings.Maghrib)}
            </Text>
          </View>

          <View style={styles.prayerTimeItem}>
            <Text style={[styles.prayerLabel, { color: isDark ? '#cccccc' : '#666666' }]}>
              Yatsı
            </Text>
            <Text style={[styles.prayerTime, { color: isDark ? '#ffffff' : '#000000' }]}>
              {formatPrayerTime(timings.Isha)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!location) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
        <Ionicons name="location-outline" size={64} color={isDark ? '#666666' : '#999999'} />
        <Text style={[styles.emptyText, { color: isDark ? '#ffffff' : '#000000' }]}>
          Konum ayarlanmamış
        </Text>
        <Text style={[styles.emptySubtext, { color: isDark ? '#cccccc' : '#666666' }]}>
          Lütfen ayarlardan konum seçin
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
        <Text style={[styles.infoText, { color: isDark ? '#cccccc' : '#666666' }]}>
          {prayerTimesList.length} gün
        </Text>
      </View>

      {loading && prayerTimesList.length === 0 ? (
        <View style={[styles.centerContent, { flex: 1 }]}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#000000' }]}>
            Vakitler yükleniyor...
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          {prayerTimesList.map((dayData, index) => (
            <PrayerTimeCard key={index} dayData={dayData} />
          ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  infoText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hijriText: {
    fontSize: 13,
  },
  todayBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  prayerTimeItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  prayerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
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

