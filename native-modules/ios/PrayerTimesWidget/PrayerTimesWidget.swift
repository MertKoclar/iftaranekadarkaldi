//
//  PrayerTimesWidget.swift
//  PrayerTimesWidget
//
//  iOS Widget Extension - Namaz vakitleri widget'ı
//

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
        
        // Her dakika güncelle (60 dakika için)
        for minuteOffset in 0..<60 {
            guard let entryDate = Calendar.current.date(byAdding: .minute, value: minuteOffset, to: currentDate) else {
                continue
            }
            let entry = loadWidgetData(for: entryDate)
            entries.append(entry)
        }

        // Timeline'ı oluştur ve 1 saat sonra yeniden yükle
        let timeline = Timeline(entries: entries, policy: .after(Calendar.current.date(byAdding: .hour, value: 1, to: currentDate) ?? currentDate))
        completion(timeline)
    }
    
    private func loadWidgetData(for date: Date = Date()) -> PrayerTimesEntry {
        // App Group'dan veri oku
        let appGroupIdentifier = "group.com.iftaranekadarkaldi.widget"
        
        guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier),
              let data = sharedDefaults.data(forKey: "widget_prayer_times_data"),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return PrayerTimesEntry(
                date: date,
                nextPrayer: "İftar",
                countdown: "00:00:00",
                location: "Veri yok"
            )
        }
        
        let nextPrayer = json["nextPrayer"] as? [String: Any]
        let countdown = json["countdown"] as? [String: Any]
        let location = json["location"] as? [String: Any]
        
        let nextPrayerName = nextPrayer?["name"] as? String ?? "İftar"
        
        // Countdown'ı hesapla (veri tarihine göre)
        let hours = countdown?["hours"] as? Int ?? 0
        let minutes = countdown?["minutes"] as? Int ?? 0
        let seconds = countdown?["seconds"] as? Int ?? 0
        let countdownString = String(format: "%02d:%02d:%02d", hours, minutes, seconds)
        
        let city = location?["city"] as? String ?? ""
        let country = location?["country"] as? String ?? ""
        let locationString = !city.isEmpty && !country.isEmpty ? "\(city), \(country)" : "Konum yok"
        
        return PrayerTimesEntry(
            date: date,
            nextPrayer: nextPrayerName,
            countdown: countdownString,
            location: locationString
        )
    }
}

struct PrayerTimesWidgetEntryView: View {
    var entry: PrayerTimesProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

struct SmallWidgetView: View {
    var entry: PrayerTimesProvider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.nextPrayer)
                .font(.headline)
                .foregroundColor(.orange)
            
            Text(entry.countdown)
                .font(.system(size: 28, weight: .bold, design: .monospaced))
                .foregroundColor(.primary)
            
            Text(entry.location)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(1)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    }
}

struct MediumWidgetView: View {
    var entry: PrayerTimesProvider.Entry

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text(entry.nextPrayer)
                    .font(.headline)
                    .foregroundColor(.orange)
                
                Text(entry.countdown)
                    .font(.system(size: 36, weight: .bold, design: .monospaced))
                    .foregroundColor(.primary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(entry.location)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.trailing)
            }
        }
        .padding()
    }
}

#Preview(as: .systemSmall) {
    PrayerTimesWidget()
} timeline: {
    PrayerTimesEntry(
        date: Date(),
        nextPrayer: "İftar",
        countdown: "02:30:15",
        location: "İstanbul, Türkiye"
    )
}

