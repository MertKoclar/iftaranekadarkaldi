# AdMob Reklam Entegrasyonu

Bu dokümantasyon, uygulamaya AdMob reklamlarının nasıl eklendiğini ve yapılandırıldığını açıklar.

## 📋 Ön Gereksinimler

1. **Google AdMob Hesabı**: [AdMob](https://admob.google.com/) hesabınız olmalı
2. **expo-dev-client**: Native modül desteği için (✅ Zaten kurulu)
3. **Native Build**: `expo prebuild` çalıştırılmış olmalı

## 🚀 Kurulum Adımları

### 1. Paket Kurulumu

Paket zaten kurulmuş durumda:
```bash
npm install react-native-google-mobile-ads
```

### 2. AdMob Hesabından App ID ve Ad Unit ID'leri Alma

1. [AdMob Console](https://apps.admob.com/)'a giriş yapın
2. **Apps** sekmesine gidin ve yeni bir uygulama ekleyin (veya mevcut uygulamayı seçin)
3. **App ID**'yi kopyalayın (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)
4. **Ad units** sekmesine gidin ve yeni bir **Banner** ad unit oluşturun
5. **Ad Unit ID**'yi kopyalayın (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

### 3. app.json Yapılandırması

`app.json` dosyasında AdMob plugin'i zaten eklenmiş durumda. **Test ID'leri** yerine kendi **gerçek ID'lerinizi** ekleyin:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX", // Android App ID
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"      // iOS App ID
        }
      ]
    ]
  }
}
```

### 4. Ad Unit ID'lerini Güncelleme

`components/AdBanner.tsx` dosyasında test ID'leri yerine gerçek Ad Unit ID'lerinizi ekleyin:

```typescript
const adUnitId = __DEV__
  ? TestIds.BANNER // Development'ta test ID kullanılır
  : Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // iOS Ad Unit ID
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Android Ad Unit ID
    }) || TestIds.BANNER;
```

### 5. Native Build Oluşturma

Native modül eklendiği için `expo prebuild` çalıştırmanız gerekiyor:

```bash
npx expo prebuild --clean
```

### 6. Build ve Test

#### Android
```bash
npx expo run:android
```

#### iOS
```bash
npx expo run:ios
```

## 📱 Reklam Türleri

### Banner Reklam

Banner reklamlar ana sayfada gösterilir. `AdBanner` komponenti kullanılır:

```tsx
import { AdBanner } from '../components/AdBanner';

<AdBanner style={styles.adBanner} />
```

### Banner Boyutları

Farklı banner boyutları kullanılabilir:

```tsx
import { BannerAdSize } from 'react-native-google-mobile-ads';

<AdBanner size={BannerAdSize.LARGE_BANNER} />
<AdBanner size={BannerAdSize.MEDIUM_RECTANGLE} />
<AdBanner size={BannerAdSize.FULL_BANNER} />
```

## 🔍 Test Reklamları

Development modunda (`__DEV__ === true`) otomatik olarak test reklamları gösterilir. Production build'de gerçek reklamlar gösterilir.

## ⚠️ Önemli Notlar

1. **Test ID'leri**: Development'ta test ID'leri kullanılır, production'da gerçek ID'ler gerekir
2. **App ID**: Her platform için ayrı App ID gerekir (iOS ve Android)
3. **Ad Unit ID**: Her reklam türü için ayrı Ad Unit ID gerekir
4. **Native Build**: AdMob native modül gerektirdiği için `expo prebuild` çalıştırılmalı
5. **Privacy Policy**: AdMob kullanıyorsanız, uygulamanızda privacy policy linki bulunmalı

## 📊 Reklam Performansı

AdMob Console'dan reklam performansınızı takip edebilirsiniz:
- **Impressions**: Gösterim sayısı
- **Clicks**: Tıklama sayısı
- **Revenue**: Gelir
- **eCPM**: Her 1000 gösterim başına gelir

## 🐛 Sorun Giderme

### Reklamlar Görünmüyor

1. **App ID kontrolü**: `app.json`'da doğru App ID'lerin olduğundan emin olun
2. **Ad Unit ID kontrolü**: `AdBanner.tsx`'de doğru Ad Unit ID'lerin olduğundan emin olun
3. **Native build**: `expo prebuild` çalıştırıldığından emin olun
4. **Test modu**: Development'ta test ID'leri kullanıldığından emin olun

### Build Hatası

1. **Plugin kontrolü**: `app.json`'da plugin'in doğru yapılandırıldığından emin olun
2. **Native modül**: `expo-dev-client` kurulu olduğundan emin olun
3. **Clean build**: `expo prebuild --clean` ile temiz build yapın

## 🔗 Kaynaklar

- [AdMob Dokümantasyonu](https://developers.google.com/admob)
- [react-native-google-mobile-ads](https://github.com/invertase/react-native-google-mobile-ads)
- [Expo AdMob Plugin](https://docs.expo.dev/versions/latest/sdk/ads-admob/)


