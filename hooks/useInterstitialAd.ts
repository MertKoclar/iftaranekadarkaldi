import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

// Ad Unit IDs - Production'da gerçek ID'ler kullanılır
// Not: Production build'de __DEV__ false olur, bu yüzden gerçek ID'ler kullanılır
const adUnitId = Platform.select({
  ios: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-6641198704450637/1993813954', // iOS Interstitial Ad Unit ID
  android: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-6641198704450637/8866344065', // Android Interstitial Ad Unit ID
  default: TestIds.INTERSTITIAL
});

export const useInterstitialAd = () => {
  const [interstitialAd, setInterstitialAd] = useState<InterstitialAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Create interstitial ad instance
    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Listen for ad loaded event
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      setIsLoaded(true);
      console.log('Interstitial ad loaded');
    });

    // Listen for ad failed to load
    const unsubscribeFailed = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad failed to load:', error);
      setIsLoaded(false);
    });

    // Listen for ad closed
    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setIsLoaded(false);
      // Reload ad after it's closed
      ad.load();
    });

    // Load the ad
    ad.load();

    setInterstitialAd(ad);

    return () => {
      unsubscribeLoaded();
      unsubscribeFailed();
      unsubscribeClosed();
    };
  }, []);

  const showAd = () => {
    if (interstitialAd && isLoaded) {
      interstitialAd.show();
      return true;
    } else {
      console.log('Interstitial ad is not loaded yet');
      // Try to load if not loaded
      if (interstitialAd) {
        interstitialAd.load();
      }
      return false;
    }
  };

  return { showAd, isLoaded };
};

