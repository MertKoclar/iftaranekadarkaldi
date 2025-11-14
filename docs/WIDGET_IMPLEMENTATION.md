# Widget Desteği Implementasyon Rehberi

Bu dokümantasyon, iOS ve Android widget desteğinin nasıl ekleneceğini açıklar.

## 📋 Genel Bakış

Widget desteği için native modül geliştirmesi gereklidir. Expo managed workflow'da widget desteği bulunmadığı için, `expo-dev-client` kullanarak custom native code yazılmalıdır.

## 🛠️ Gereksinimler

1. **expo-dev-client**: Custom native code için
2. **iOS WidgetKit Extension**: iOS widget'ları için
3. **Android App Widget**: Android widget'ları için
4. **App Groups (iOS) / SharedPreferences (Android)**: Veri paylaşımı için

## 📱 iOS Widget Implementasyonu

### 1. expo-dev-client Kurulumu

```bash
npx expo install expo-dev-client
npx expo prebuild
```

### 2. WidgetKit Extension Oluşturma

Xcode'da:
1. File > New > Target
2. "Widget Extension" seçin
3. Extension adı: `PrayerTimesWidget`
4. Language: Swift
5. Include Configuration Intent: Hayır (basit widget için)

### 3. App Groups Yapılandırması

1. Ana uygulama ve widget extension için App Groups ekleyin
2. Group ID: `group.com.iftaranekadarkaldi.widget`
3. Her iki target'a da aynı App Group'u ekleyin

### 4. Widget Veri Paylaşımı

`ios/PrayerTimesWidget/PrayerTimesWidget.swift`:

```swift
import WidgetKit
import SwiftUI

struct PrayerTimesWidget: Widget {
    let kind: String = "PrayerTimesWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerTimesProvider()) { entry in
            PrayerTimesWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Namaz Vakitleri")
        .description("İftar ve Sahur vakitlerine kalan süreyi gösterir.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct PrayerTimesEntry: TimelineEntry {
    let date: Date
    let nextPrayer: String
    let countdown: String
    let location: String
}

struct PrayerTimesProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerTimesEntry {
        PrayerTimesEntry(
            date: Date(),
            nextPrayer: "İftar",
            countdown: "02:30:15",
            location: "İstanbul, Türkiye"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerTimesEntry) -> ()) {
        let entry = loadWidgetData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerTimesEntry>) -> ()) {
        var entries: [PrayerTimesEntry] = []
        let currentDate = Date()
        
        // Her dakika güncelle
        for minuteOffset in 0..<60 {
            guard let entryDate = Calendar.current.date(byAdding: .minute, value: minuteOffset, to: currentDate) else {
                continue
            }
            let entry = loadWidgetData(for: entryDate)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
    
    private func loadWidgetData(for date: Date = Date()) -> PrayerTimesEntry {
        // App Group'dan veri oku
        if let sharedDefaults = UserDefaults(suiteName: "group.com.iftaranekadarkaldi.widget"),
           let data = sharedDefaults.data(forKey: "widget_prayer_times_data"),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            
            let nextPrayer = json["nextPrayer"] as? [String: Any]
            let countdown = json["countdown"] as? [String: Any]
            let location = json["location"] as? [String: Any]
            
            let nextPrayerName = nextPrayer?["name"] as? String ?? "İftar"
            let hours = countdown?["hours"] as? Int ?? 0
            let minutes = countdown?["minutes"] as? Int ?? 0
            let seconds = countdown?["seconds"] as? Int ?? 0
            let countdownString = String(format: "%02d:%02d:%02d", hours, minutes, seconds)
            let locationString = "\(location?["city"] as? String ?? ""), \(location?["country"] as? String ?? "")"
            
            return PrayerTimesEntry(
                date: date,
                nextPrayer: nextPrayerName,
                countdown: countdownString,
                location: locationString
            )
        }
        
        return PrayerTimesEntry(
            date: date,
            nextPrayer: "İftar",
            countdown: "00:00:00",
            location: "Konum yok"
        )
    }
}

struct PrayerTimesWidgetEntryView: View {
    var entry: PrayerTimesProvider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.nextPrayer)
                .font(.headline)
                .foregroundColor(.orange)
            
            Text(entry.countdown)
                .font(.system(size: 32, weight: .bold, design: .monospaced))
                .foregroundColor(.primary)
            
            Text(entry.location)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}
```

### 5. React Native'den App Group'a Veri Yazma

Native modül oluşturun: `ios/WidgetDataManager.swift` ve `ios/WidgetDataManager.m`

## 🤖 Android Widget Implementasyonu

### 1. App Widget Provider Oluşturma

`android/app/src/main/java/com/iftaranekadarkaldi/PrayerTimesWidgetProvider.kt`:

```kotlin
package com.iftaranekadarkaldi

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.SharedPreferences
import android.widget.RemoteViews
import org.json.JSONObject

class PrayerTimesWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.prayer_times_widget)
        
        // SharedPreferences'tan veri oku
        val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
        val jsonString = prefs.getString("widget_prayer_times_data", null)
        
        if (jsonString != null) {
            try {
                val json = JSONObject(jsonString)
                val nextPrayer = json.getJSONObject("nextPrayer")
                val countdown = json.getJSONObject("countdown")
                val location = json.getJSONObject("location")
                
                val nextPrayerName = nextPrayer.getString("name")
                val hours = countdown.getInt("hours")
                val minutes = countdown.getInt("minutes")
                val seconds = countdown.getInt("seconds")
                val countdownString = String.format("%02d:%02d:%02d", hours, minutes, seconds)
                val locationString = "${location.getString("city")}, ${location.getString("country")}"
                
                views.setTextViewText(R.id.next_prayer, nextPrayerName)
                views.setTextViewText(R.id.countdown, countdownString)
                views.setTextViewText(R.id.location, locationString)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
```

### 2. Widget Layout

`android/app/src/main/res/layout/prayer_times_widget.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@android:color/white">
    
    <TextView
        android:id="@+id/next_prayer"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="İftar"
        android:textColor="#FF9800"
        android:textSize="16sp"
        android:textStyle="bold"/>
    
    <TextView
        android:id="@+id/countdown"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="00:00:00"
        android:textSize="32sp"
        android:textStyle="bold"
        android:fontFamily="monospace"/>
    
    <TextView
        android:id="@+id/location"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Konum"
        android:textSize="12sp"
        android:textColor="#666666"/>
</LinearLayout>
```

### 3. AndroidManifest.xml'e Widget Ekleme

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

## 📊 Veri Paylaşımı

### iOS (App Groups)

React Native tarafında native modül oluşturup App Group'a yazmalısınız:

```typescript
// services/widgetData.ts içinde
import { NativeModules } from 'react-native';

// iOS için App Group'a yazma
if (Platform.OS === 'ios' && NativeModules.WidgetDataManager) {
  await NativeModules.WidgetDataManager.updateWidgetData(widgetData);
}
```

### Android (SharedPreferences)

Android için AsyncStorage zaten SharedPreferences kullanıyor, ancak widget için özel bir key kullanmalısınız:

```typescript
// services/widgetData.ts içinde
import { NativeModules } from 'react-native';

// Android için SharedPreferences'a yazma
if (Platform.OS === 'android' && NativeModules.WidgetDataManager) {
  await NativeModules.WidgetDataManager.updateWidgetData(widgetData);
}
```

## 🔄 Widget Güncelleme

Widget'lar otomatik olarak güncellenir:
- **iOS**: Timeline policy ile (her dakika)
- **Android**: AlarmManager ile (her dakika veya değişiklik olduğunda)

## 📝 Notlar

1. Widget'lar native kod ile yazılmalıdır (Swift/Kotlin)
2. Veri paylaşımı için App Groups (iOS) veya SharedPreferences (Android) kullanılır
3. Widget'lar sınırlı kaynaklara sahiptir, basit tutulmalıdır
4. Widget güncellemeleri sistem tarafından yönetilir

## 🚀 Sonraki Adımlar

1. `expo-dev-client` kurulumu
2. Native modül oluşturma
3. Widget extension'ları oluşturma
4. Veri paylaşım mekanizmasını test etme
5. Widget UI tasarımı

