package com.iftaranekadarkaldi

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import java.util.Calendar

/**
 * Widget'ı periyodik olarak güncellemek için AlarmManager kullanır
 */
class WidgetUpdateReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        try {
            val widgetManager = AppWidgetManager.getInstance(context)
            val componentName = android.content.ComponentName(context, PrayerTimesWidgetProvider::class.java)
            val widgetIds = widgetManager.getAppWidgetIds(componentName)
            
            if (widgetIds.isNotEmpty()) {
                // Widget'ı güncelle
                PrayerTimesWidgetProvider().onUpdate(context, widgetManager, widgetIds)
                
                // Bir sonraki güncellemeyi hemen planla (1 saniye sonra)
                WidgetUpdateService.scheduleNextUpdate(context)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

/**
 * Widget güncelleme servisi - AlarmManager ile periyodik güncelleme
 */
object WidgetUpdateService {
    private const val UPDATE_INTERVAL_MS = 1000L // 1 saniye
    private const val REQUEST_CODE = 1001
    
    fun scheduleUpdates(context: Context) {
        // İlk güncellemeyi başlat
        scheduleNextUpdate(context)
    }
    
    fun scheduleNextUpdate(context: Context) {
        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, WidgetUpdateReceiver::class.java)
            intent.action = "com.iftaranekadarkaldi.WIDGET_UPDATE"
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            // Bir sonraki güncellemeyi 1 saniye sonra planla (milisaniye cinsinden)
            val triggerAtMillis = System.currentTimeMillis() + 1000L
            
            // Android 6.0+ için setExact kullan (daha güvenilir)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                try {
                    // Önce setExact dene (daha hızlı)
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                    )
                } catch (e: SecurityException) {
                    // setExact başarısız olursa setExactAndAllowWhileIdle dene
                    try {
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis,
                            pendingIntent
                        )
                    } catch (e2: Exception) {
                        // Son çare olarak set kullan
                        alarmManager.set(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis,
                            pendingIntent
                        )
                    }
                }
            } else {
                // Android 6.0 öncesi için setExact kullan
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
    
    fun cancelUpdates(context: Context) {
        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, WidgetUpdateReceiver::class.java)
            intent.action = "com.iftaranekadarkaldi.WIDGET_UPDATE"
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

