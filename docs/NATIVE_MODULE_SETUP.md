# Native Modül Kurulum Rehberi

Bu rehber, widget desteği için native modüllerin nasıl kurulacağını açıklar.

## 📋 Ön Gereksinimler

1. **expo-dev-client** kurulu olmalı (✅ Tamamlandı)
2. **Xcode** (iOS için) veya **Android Studio** (Android için) kurulu olmalı
3. Native proje klasörleri oluşturulmalı (`expo prebuild`)

## 🚀 Kurulum Adımları

### 1. Native Proje Klasörlerini Oluştur

```bash
npx expo prebuild
```

Bu komut `ios/` ve `android/` klasörlerini oluşturur.

### 2. iOS Kurulumu

#### a) Widget Extension Oluştur

1. Xcode'da `ios/iftaranekadarkaldi.xcworkspace` dosyasını aç
2. File > New > Target
3. "Widget Extension" seçin
4. Product Name: `PrayerTimesWidget`
5. Language: Swift
6. Include Configuration Intent: Hayır

#### b) App Groups Yapılandırması

1. Ana uygulama target'ını seç (iftaranekadarkaldi)
2. Signing & Capabilities sekmesine git
3. "+ Capability" butonuna tıkla
4. "App Groups" seç
5. Group ID: `group.com.iftaranekadarkaldi.widget`
6. Aynı işlemi `PrayerTimesWidget` extension için de yap

#### c) Native Modül Dosyalarını Kopyala

1. `native-modules/ios/WidgetDataManager.swift` dosyasını `ios/iftaranekadarkaldi/` klasörüne kopyala
2. `native-modules/ios/WidgetDataManager.m` dosyasını `ios/iftaranekadarkaldi/` klasörüne kopyala
3. `native-modules/ios/PrayerTimesWidget/PrayerTimesWidget.swift` dosyasını `ios/PrayerTimesWidget/` klasörüne kopyala
4. `native-modules/ios/PrayerTimesWidget/PrayerTimesWidgetBundle.swift` dosyasını `ios/PrayerTimesWidget/` klasörüne kopyala

#### d) Bridging Header (Gerekirse)

Eğer Swift ve Objective-C karışımı kullanıyorsanız, bridging header oluşturun:

1. Xcode'da File > New > File
2. Header File seç
3. Adı: `iftaranekadarkaldi-Bridging-Header.h`
4. İçeriği:
```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
```

5. Build Settings'te "Objective-C Bridging Header" ayarını ekle: `$(SRCROOT)/iftaranekadarkaldi-Bridging-Header.h`

#### e) WidgetKit Framework Ekleme

1. `PrayerTimesWidget` target'ını seç
2. Build Phases sekmesine git
3. Link Binary With Libraries'e tıkla
4. "+" butonuna tıkla
5. `WidgetKit.framework` ekle

### 3. Android Kurulumu

#### a) Native Modül Dosyalarını Kopyala

1. `native-modules/android/WidgetDataManagerModule.kt` dosyasını `android/app/src/main/java/com/iftaranekadarkaldi/` klasörüne kopyala
2. `native-modules/android/WidgetDataManagerPackage.kt` dosyasını `android/app/src/main/java/com/iftaranekadarkaldi/` klasörüne kopyala
3. `native-modules/android/PrayerTimesWidgetProvider.kt` dosyasını `android/app/src/main/java/com/iftaranekadarkaldi/` klasörüne kopyala

#### b) Layout ve Resource Dosyalarını Kopyala

1. `native-modules/android/res/layout/prayer_times_widget.xml` dosyasını `android/app/src/main/res/layout/` klasörüne kopyala
2. `native-modules/android/res/xml/prayer_times_widget_info.xml` dosyasını `android/app/src/main/res/xml/` klasörüne kopyala
3. `native-modules/android/res/values/strings.xml` dosyasını `android/app/src/main/res/values/` klasörüne kopyala (veya mevcut strings.xml'e ekle)

#### c) MainApplication.java/kt'ye Package Ekleme

`android/app/src/main/java/com/iftaranekadarkaldi/MainApplication.kt` (veya `.java`) dosyasını aç ve `getPackages()` metoduna ekle:

```kotlin
import com.iftaranekadarkaldi.WidgetDataManagerPackage

override fun getPackages(): List<ReactPackage> {
    return listOf(
        MainReactPackage(),
        WidgetDataManagerPackage() // Bu satırı ekle
    )
}
```

#### d) AndroidManifest.xml'e Widget Ekleme

`android/app/src/main/AndroidManifest.xml` dosyasına ekle:

```xml
<receiver android:name=".PrayerTimesWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/prayer_times_widget_info" />
</receiver>
```

### 4. Build ve Test

#### iOS

```bash
npx expo run:ios
```

#### Android

```bash
npx expo run:android
```

## 🔍 Sorun Giderme

### iOS

1. **App Group bulunamadı hatası**: Xcode'da App Groups yapılandırmasını kontrol edin
2. **Widget görünmüyor**: Widget extension'ın doğru target'ta olduğundan emin olun
3. **Native modül bulunamadı**: Bridging header'ı kontrol edin

### Android

1. **Widget görünmüyor**: AndroidManifest.xml'de receiver'ın doğru tanımlandığından emin olun
2. **Native modül bulunamadı**: MainApplication'da package'ın eklendiğinden emin olun
3. **Layout hatası**: Layout dosyasının doğru klasörde olduğundan emin olun

## 📝 Notlar

- Native modüller sadece development build'de çalışır (expo-dev-client)
- Production build için `eas build` kullanılmalı
- Widget'lar her platform için ayrı implement edilmelidir

