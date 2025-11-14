//
//  WidgetDataManager.swift
//  iftaranekadarkaldi
//
//  Widget verilerini App Groups üzerinden paylaşmak için native modül
//

import Foundation
import React

@objc(WidgetDataManager)
class WidgetDataManager: NSObject {
  
  // App Group identifier - Xcode'da App Groups yapılandırması yapıldıktan sonra güncellenmeli
  private let appGroupIdentifier = "group.com.iftaranekadarkaldi.widget"
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func updateWidgetData(_ dataJson: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
      reject("ERROR", "App Group bulunamadı. Lütfen Xcode'da App Groups yapılandırmasını kontrol edin.", nil)
      return
    }
    
    // JSON string'i Data'ya çevir
    guard let data = dataJson.data(using: .utf8) else {
      reject("ERROR", "JSON verisi geçersiz", nil)
      return
    }
    
    // App Group'a kaydet
    sharedDefaults.set(data, forKey: "widget_prayer_times_data")
    sharedDefaults.synchronize()
    
    // Widget'ı güncellemek için WidgetKit'i tetikle
    #if canImport(WidgetKit)
    if #available(iOS 14.0, *) {
      WidgetKit.WidgetCenter.shared.reloadAllTimelines()
    }
    #endif
    
    resolve(true)
  }
  
  @objc
  func getWidgetData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
      reject("ERROR", "App Group bulunamadı", nil)
      return
    }
    
    guard let data = sharedDefaults.data(forKey: "widget_prayer_times_data"),
          let jsonString = String(data: data, encoding: .utf8) else {
      resolve(nil)
      return
    }
    
    resolve(jsonString)
  }
}

