import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Ad Unit IDs - Production'da gerçek ID'ler kullanılır
// Not: Production build'de __DEV__ false olur, bu yüzden gerçek ID'ler kullanılır
const adUnitId = Platform.select({
  ios: __DEV__ ? TestIds.BANNER : 'ca-app-pub-6641198704450637/6020688876', // iOS Banner Ad Unit ID
  android: __DEV__ ? TestIds.BANNER : 'ca-app-pub-6641198704450637/7702378159', // Android Banner Ad Unit ID
  default: TestIds.BANNER
});

interface AdBannerProps {
  size?: BannerAdSize;
  style?: any;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.BANNER,
  style 
}) => {
  const [adError, setAdError] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {!adError && (
        <BannerAd
          unitId={adUnitId}
          size={size}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            console.log('Ad loaded successfully');
          }}
          onAdFailedToLoad={(error) => {
            console.error('Ad failed to load:', error);
            console.error('Ad Unit ID:', adUnitId);
            setAdError(true);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

