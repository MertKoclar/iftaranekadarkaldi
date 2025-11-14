package com.iftaranekadarkaldi

import android.content.Context
import android.content.SharedPreferences
import android.appwidget.AppWidgetManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

/**
 * Widget verilerini SharedPreferences üzerinden paylaşmak için native modül
 */
class WidgetDataManagerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val PREFS_NAME = "widget_data"
    private val WIDGET_DATA_KEY = "widget_prayer_times_data"

    override fun getName(): String {
        return "WidgetDataManager"
    }

    @ReactMethod
    fun updateWidgetData(dataJson: String, promise: Promise) {
        try {
            val prefs: SharedPreferences = reactApplicationContext
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            
            val editor = prefs.edit()
            editor.putString(WIDGET_DATA_KEY, dataJson)
            editor.apply()
            
            // Widget'ları güncelle
            updateAllWidgets()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Widget verisi güncellenirken hata: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getWidgetData(promise: Promise) {
        try {
            val prefs: SharedPreferences = reactApplicationContext
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            
            val data = prefs.getString(WIDGET_DATA_KEY, null)
            promise.resolve(data)
        } catch (e: Exception) {
            promise.reject("ERROR", "Widget verisi okunurken hata: ${e.message}", e)
        }
    }

    private fun updateAllWidgets() {
        try {
            val context = reactApplicationContext
            val widgetManager = AppWidgetManager.getInstance(context)
            val widgetIds = widgetManager.getAppWidgetIds(
                android.content.ComponentName(context, PrayerTimesWidgetProvider::class.java)
            )
            
            if (widgetIds.isNotEmpty()) {
                // Widget provider'ı güncelle
                val intent = android.content.Intent(context, PrayerTimesWidgetProvider::class.java)
                intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
                context.sendBroadcast(intent)
            }
        } catch (e: Exception) {
            // Widget güncelleme hatası - sessizce devam et
            e.printStackTrace()
        }
    }
}

