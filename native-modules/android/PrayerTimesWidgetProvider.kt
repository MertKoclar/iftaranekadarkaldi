package com.iftaranekadarkaldi

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.SharedPreferences
import android.widget.RemoteViews
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

/**
 * Android Widget Provider - Namaz vakitleri widget'ı
 */
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

    override fun onEnabled(context: Context) {
        // İlk widget eklendiğinde
    }

    override fun onDisabled(context: Context) {
        // Son widget kaldırıldığında
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        // Layout dosyasını yükle (oluşturulacak)
        val views = RemoteViews(context.packageName, R.layout.prayer_times_widget)
        
        // SharedPreferences'tan veri oku
        val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
        val jsonString = prefs.getString("widget_prayer_times_data", null)
        
        if (jsonString != null) {
            try {
                val json = JSONObject(jsonString)
                val nextPrayer = json.optJSONObject("nextPrayer")
                val countdown = json.optJSONObject("countdown")
                val location = json.optJSONObject("location")
                
                val nextPrayerName = nextPrayer?.optString("name") ?: "İftar"
                val hours = countdown?.optInt("hours") ?: 0
                val minutes = countdown?.optInt("minutes") ?: 0
                val seconds = countdown?.optInt("seconds") ?: 0
                val countdownString = String.format("%02d:%02d:%02d", hours, minutes, seconds)
                
                val city = location?.optString("city") ?: ""
                val country = location?.optString("country") ?: ""
                val locationString = if (city.isNotEmpty() && country.isNotEmpty()) {
                    "$city, $country"
                } else {
                    "Konum yok"
                }
                
                // Widget'a verileri set et
                views.setTextViewText(R.id.next_prayer, nextPrayerName)
                views.setTextViewText(R.id.countdown, countdownString)
                views.setTextViewText(R.id.location, locationString)
                
            } catch (e: Exception) {
                e.printStackTrace()
                // Hata durumunda varsayılan değerler
                views.setTextViewText(R.id.next_prayer, "İftar")
                views.setTextViewText(R.id.countdown, "00:00:00")
                views.setTextViewText(R.id.location, "Veri yok")
            }
        } else {
            // Veri yoksa varsayılan değerler
            views.setTextViewText(R.id.next_prayer, "İftar")
            views.setTextViewText(R.id.countdown, "00:00:00")
            views.setTextViewText(R.id.location, "Veri yok")
        }
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}

