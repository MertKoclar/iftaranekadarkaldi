import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const ONBOARDING_STORAGE_KEY = '@onboarding_completed';

interface OnboardingSlide {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  descriptionKey: string;
  color: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    icon: 'time-outline',
    titleKey: 'onboarding.slide1.title',
    descriptionKey: 'onboarding.slide1.description',
    color: '#FF9800',
  },
  {
    icon: 'notifications-outline',
    titleKey: 'onboarding.slide2.title',
    descriptionKey: 'onboarding.slide2.description',
    color: '#4CAF50',
  },
  {
    icon: 'calendar-outline',
    titleKey: 'onboarding.slide3.title',
    descriptionKey: 'onboarding.slide3.description',
    color: '#2196F3',
  },
  {
    icon: 'phone-portrait-outline',
    titleKey: 'onboarding.slide4.title',
    descriptionKey: 'onboarding.slide4.description',
    color: '#9C27B0',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      // Ana sayfaya yönlendir - segments değiştiğinde _layout.tsx state'i güncelleyecek
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Onboarding kaydetme hatası:', error);
      // Hata olsa bile ana sayfaya yönlendir
      router.replace('/(tabs)');
    }
  };

  const handleNext = () => {
    if (currentPage < onboardingSlides.length - 1) {
      const nextPage = currentPage + 1;
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
      setCurrentPage(nextPage);
    } else {
      handleSkip();
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    if (page >= 0 && page < onboardingSlides.length) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor:
                  index === currentPage
                    ? onboardingSlides[currentPage].color
                    : isDark
                    ? '#444'
                    : '#ccc',
                width: index === currentPage ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#ffffff' },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
      >
        {onboardingSlides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: `${slide.color}20` },
                ]}
              >
                <Ionicons
                  name={slide.icon}
                  size={80}
                  color={slide.color}
                />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? '#ffffff' : '#000000' },
                ]}
              >
                {t(slide.titleKey)}
              </Text>
              <Text
                style={[
                  styles.description,
                  { color: isDark ? '#aaaaaa' : '#666666' },
                ]}
              >
                {t(slide.descriptionKey)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {renderPagination()}

        <View style={styles.buttonContainer}>
          {currentPage < onboardingSlides.length - 1 ? (
            <>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
              >
                <Text
                  style={[
                    styles.skipButtonText,
                    { color: isDark ? '#aaaaaa' : '#666666' },
                  ]}
                >
                  {t('common.skip')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  { backgroundColor: onboardingSlides[currentPage].color },
                ]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {t('common.next')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.startButton,
                {
                  backgroundColor: onboardingSlides[currentPage].color,
                  width: '100%',
                },
              ]}
              onPress={handleSkip}
            >
              <Text style={styles.startButtonText}>
                {t('common.start')}
              </Text>
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 120,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

