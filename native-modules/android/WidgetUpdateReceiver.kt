package com.poludev.iftaranekadarkaldi

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

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

