import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays, format, isPast, isToday, parse } from 'date-fns';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AdBanner } from '../../components/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getUpcomingReligiousDays, ReligiousDay, religiousDays } from '../../data/religiousDays';
import { getDateLocale } from '../../utils/dateUtils';

const ReligiousDayCard: React.FC<{ day: ReligiousDay; isToday: boolean }> = ({ day, isToday }) => {
  const { isDark } = useTheme();
  const { t, currentLanguage } = useLanguage();
  
  const dayDate = parse(day.gregorianDate, 'yyyy-MM-dd', new Date());
  const daysUntil = differenceInCalendarDays(dayDate, new Date());
  const isPastDate = isPast(dayDate) && !isToday;
  
  const getTypeIcon = () => {
    switch (day.type) {
      case 'ramadan':
        return 'moon';
      case 'eid':
        return 'star';
      default:
        return 'calendar';
    }
  };

  const getTypeColor = () => {
    switch (day.type) {
      case 'ramadan':
        return '#2196F3';
      case 'eid':
        return '#FF9800';
      default:
        return '#9C27B0';
    }
  };

  const formatHijriDate = () => {
    const monthNames = {
      tr: ['Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 
           'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'],
      en: ['Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani',
           'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'],
      ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
           'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
    };
    
    const monthName = monthNames[currentLanguage as keyof typeof monthNames]?.[day.hijriDate.month - 1] || 
                      monthNames.tr[day.hijriDate.month - 1];
    
    return `${day.hijriDate.day} ${monthName} ${day.hijriDate.year}`;
  };

  return (
    <View
      style={[
        styles.dayCard,
        {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          borderLeftColor: getTypeColor(),
          borderLeftWidth: 4,
        },
        isToday && {
          backgroundColor: isDark ? '#2a1a0a' : '#fff3e0',
        },
        isPastDate && {
          opacity: 0.6,
        },
      ]}
    >
      <View style={styles.dayCardHeader}>
        <View style={styles.dayCardTitleRow}>
          <Ionicons name={getTypeIcon()} size={24} color={getTypeColor()} />
          <Text style={[styles.dayName, { color: isDark ? '#ffffff' : '#000000' }]}>
            {day.name[currentLanguage as keyof typeof day.name] || day.name.tr}
          </Text>
        </View>
        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>{t('common.today')}</Text>
          </View>
        )}
      </View>

      <View style={styles.dayCardContent}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={isDark ? '#cccccc' : '#666666'} />
          <Text style={[styles.dateText, { color: isDark ? '#cccccc' : '#666666' }]}>
            {format(dayDate, 'd MMMM yyyy EEEE', { locale: getDateLocale(currentLanguage) })}
          </Text>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar" size={16} color={isDark ? '#cccccc' : '#666666'} />
          <Text style={[styles.dateText, { color: isDark ? '#cccccc' : '#666666' }]}>
            {formatHijriDate()}
          </Text>
        </View>

        {day.description && (
          <Text style={[styles.description, { color: isDark ? '#aaaaaa' : '#666666' }]}>
            {day.description[currentLanguage as keyof typeof day.description] || day.description.tr}
          </Text>
        )}

        <View style={styles.daysUntilContainer}>
          <Ionicons 
            name={isPastDate ? "time" : "time-outline"} 
            size={16} 
            color={isPastDate ? (isDark ? '#666666' : '#999999') : getTypeColor()} 
          />
          <Text style={[
            styles.daysUntil, 
            { 
              color: isPastDate 
                ? (isDark ? '#666666' : '#999999') 
                : getTypeColor() 
            }
          ]}>
            {daysUntil === 0
              ? t('religiousDays.today')
              : daysUntil === 1
              ? t('religiousDays.tomorrow')
              : daysUntil > 1
              ? `${daysUntil} ${t('religiousDays.daysLeft')}`
              : `${Math.abs(daysUntil)} ${t('religiousDays.daysAgo')}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function ReligiousDaysScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const allDays = useMemo(() => {
    const upcoming = getUpcomingReligiousDays();
    // Eğer yaklaşan gün yoksa veya çok azsa, tüm günleri göster
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDays = upcoming.filter(day => {
      const dayDate = new Date(day.gregorianDate);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate >= today;
    });
    
    // Eğer gelecek gün yoksa veya çok azsa, tüm günleri göster
    if (futureDays.length === 0 || futureDays.length < 3) {
      // Tüm dini günleri tarihe göre sırala
      return [...religiousDays].sort((a: ReligiousDay, b: ReligiousDay) => {
        const dateA = new Date(a.gregorianDate);
        const dateB = new Date(b.gregorianDate);
        return dateA.getTime() - dateB.getTime();
      });
    }
    
    return upcoming;
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingCount = allDays.filter(day => {
    const dayDate = new Date(day.gregorianDate);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate >= today;
  }).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
          {upcomingCount > 0 ? t('religiousDays.upcoming') : t('religiousDays.allDays')}
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? '#cccccc' : '#666666' }]}>
          {upcomingCount > 0 
            ? `${upcomingCount} ${t('religiousDays.daysCount')}`
            : t('religiousDays.showingAll')}
        </Text>
      </View>

      {allDays.length === 0 ? (
        <View style={[styles.emptyContainer, styles.centerContent]}>
          <Ionicons name="calendar-outline" size={64} color={isDark ? '#666666' : '#999999'} />
          <Text style={[styles.emptyText, { color: isDark ? '#ffffff' : '#000000' }]}>
            {t('religiousDays.noUpcoming')}
          </Text>
        </View>
      ) : (
        allDays.map((day) => {
          const dayDate = parse(day.gregorianDate, 'yyyy-MM-dd', new Date());
          return (
            <ReligiousDayCard
              key={day.id}
              day={day}
              isToday={isToday(dayDate)}
            />
          );
        })
      )}
      
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  dayCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
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
  dayCardContent: {
    gap: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  daysUntilContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  daysUntil: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    minHeight: 400,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

