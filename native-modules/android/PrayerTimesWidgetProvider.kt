package com.poludev.iftaranekadarkaldi

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
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
        
        // Her güncellemede bir sonraki güncellemeyi planla
        if (appWidgetIds.isNotEmpty()) {
            WidgetUpdateService.scheduleNextUpdate(context)
        }
    }

    override fun onEnabled(context: Context) {
        // İlk widget eklendiğinde - periyodik güncellemeyi başlat
        WidgetUpdateService.scheduleUpdates(context)
    }

    override fun onDisabled(context: Context) {
        // Son widget kaldırıldığında - periyodik güncellemeyi durdur
        WidgetUpdateService.cancelUpdates(context)
    }
    
    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: android.os.Bundle
    ) {
        // Widget görünür olduğunda güncelle
        updateAppWidget(context, appWidgetManager, appWidgetId)
        // Bir sonraki güncellemeyi planla
        WidgetUpdateService.scheduleNextUpdate(context)
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        // Widget görünür olduğunda veya herhangi bir değişiklik olduğunda güncelle
        if (intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE ||
            intent.action == AppWidgetManager.ACTION_APPWIDGET_ENABLED ||
            intent.action == AppWidgetManager.ACTION_APPWIDGET_OPTIONS_CHANGED) {
            val widgetManager = AppWidgetManager.getInstance(context)
            val componentName = android.content.ComponentName(context, PrayerTimesWidgetProvider::class.java)
            val widgetIds = widgetManager.getAppWidgetIds(componentName)
            
            if (widgetIds.isNotEmpty()) {
                // Bir sonraki güncellemeyi planla
                WidgetUpdateService.scheduleNextUpdate(context)
            }
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        // Widget boyutuna göre layout seç
        val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
        val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
        val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT)
        
        // 2x2 widget için: ~110dp x ~110dp (yaklaşık 220px x 220px)
        // 4x2 widget için: ~250dp x ~110dp (yaklaşık 500px x 220px)
        val isCompact = minWidth < 400 // 2x2 widget
        
        val layoutId = if (isCompact) {
            R.layout.prayer_times_widget_2x2
        } else {
            R.layout.prayer_times_widget_4x2
        }
        
        // Layout dosyasını yükle
        val views = RemoteViews(context.packageName, layoutId)
        
        // Widget'a tıklanınca uygulamayı aç
        val intent = android.content.Intent(context, com.poludev.iftaranekadarkaldi.MainActivity::class.java)
        intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP
        val pendingIntent = android.app.PendingIntent.getActivity(
            context,
            0,
            intent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)
        
        // SharedPreferences'tan veri oku
        val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
        val jsonString = prefs.getString("widget_prayer_times_data", null)

        if (jsonString != null) {
            try {
                val json = JSONObject(jsonString)
                val nextPrayer = json.optJSONObject("nextPrayer")
                val location = json.optJSONObject("location")
                
                val nextPrayerName = nextPrayer?.optString("name") ?: "İftar"
                val nextPrayerTimeStr = nextPrayer?.optString("time") ?: ""
                
                // Countdown'ı hesapla (güncel zaman ile)
                val countdownString = if (nextPrayerTimeStr.isNotEmpty()) {
                    try {
                        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                        sdf.timeZone = TimeZone.getTimeZone("UTC")
                        val nextPrayerTime = sdf.parse(nextPrayerTimeStr)
                        val now = Date()
                        
                        if (nextPrayerTime != null && nextPrayerTime.after(now)) {
                            val diff = nextPrayerTime.time - now.time
                            val hours = (diff / (1000 * 60 * 60)).toInt()
                            val minutes = ((diff % (1000 * 60 * 60)) / (1000 * 60)).toInt()
                            val seconds = ((diff % (1000 * 60)) / 1000).toInt()
                            String.format("%02d:%02d:%02d", hours, minutes, seconds)
                        } else {
                            "00:00:00"
                        }
                    } catch (e: Exception) {
                        val countdown = json.optJSONObject("countdown")
                        val hours = countdown?.optInt("hours") ?: 0
                        val minutes = countdown?.optInt("minutes") ?: 0
                        val seconds = countdown?.optInt("seconds") ?: 0
                        String.format("%02d:%02d:%02d", hours, minutes, seconds)
                    }
                } else {
                    val countdown = json.optJSONObject("countdown")
                    val hours = countdown?.optInt("hours") ?: 0
                    val minutes = countdown?.optInt("minutes") ?: 0
                    val seconds = countdown?.optInt("seconds") ?: 0
                    String.format("%02d:%02d:%02d", hours, minutes, seconds)
                }
                
                // Next prayer time'ı formatla
                val nextPrayerTimeFormatted = if (nextPrayerTimeStr.isNotEmpty()) {
                    try {
                        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                        sdf.timeZone = TimeZone.getTimeZone("UTC")
                        val nextPrayerTime = sdf.parse(nextPrayerTimeStr)
                        if (nextPrayerTime != null) {
                            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                            timeFormat.timeZone = TimeZone.getDefault()
                            timeFormat.format(nextPrayerTime)
                        } else {
                            ""
                        }
                    } catch (e: Exception) {
                        ""
                    }
                } else {
                    ""
                }
                
                val city = location?.optString("city") ?: ""
                val country = location?.optString("country") ?: ""
                val locationString = if (city.isNotEmpty() && country.isNotEmpty()) {
                    if (city.length > 18) {
                        city.substring(0, 18) + "..."
                    } else {
                        city
                    }
                } else {
                    "Konum yok"
                }
                
                views.setTextViewText(R.id.next_prayer, nextPrayerName)
                views.setTextViewText(R.id.countdown, countdownString)
                views.setTextViewText(R.id.location, locationString)
                views.setTextViewText(R.id.next_prayer_time, nextPrayerTimeFormatted)
                
            } catch (e: Exception) {
                e.printStackTrace()
                views.setTextViewText(R.id.next_prayer, "İftar")
                views.setTextViewText(R.id.countdown, "00:00:00")
                views.setTextViewText(R.id.location, "Veri yok")
                views.setTextViewText(R.id.next_prayer_time, "")
            }
        } else {
            views.setTextViewText(R.id.next_prayer, "İftar")
            views.setTextViewText(R.id.countdown, "00:00:00")
            views.setTextViewText(R.id.location, "Veri yok")
            views.setTextViewText(R.id.next_prayer_time, "")
        }
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
