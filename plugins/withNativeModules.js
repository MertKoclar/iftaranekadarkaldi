const { withDangerousMod, withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

/**
 * Expo Config Plugin to copy native module files from native-modules/ to android/ during prebuild
 */
const withNativeModules = (config) => {
  // First, copy files
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidProjectPath = config.modRequest.platformProjectRoot;
      
      // Source and destination paths
      const sourceDir = path.join(projectRoot, 'native-modules', 'android');
      const destJavaDir = path.join(androidProjectPath, 'app', 'src', 'main', 'java', 'com', 'poludev', 'iftaranekadarkaldi');
      const destResDir = path.join(androidProjectPath, 'app', 'src', 'main', 'res');
      
      // Copy Kotlin files
      const kotlinFiles = [
        'MainActivity.kt',
        'MainApplication.kt',
        'PrayerTimesWidgetProvider.kt',
        'WidgetDataManagerModule.kt',
        'WidgetDataManagerPackage.kt',
        'WidgetUpdateService.kt',
        'WidgetUpdateReceiver.kt'
      ];
      
      // Ensure destination directory exists
      if (!fs.existsSync(destJavaDir)) {
        fs.mkdirSync(destJavaDir, { recursive: true });
      }
      
      // Copy each Kotlin file
      for (const file of kotlinFiles) {
        const sourceFile = path.join(sourceDir, file);
        const destFile = path.join(destJavaDir, file);
        
        if (fs.existsSync(sourceFile)) {
          fs.copyFileSync(sourceFile, destFile);
          console.log(`Copied ${file} to ${destFile}`);
        } else {
          console.warn(`Warning: ${sourceFile} does not exist`);
        }
      }
      
      // Copy resource files
      const resSourceDir = path.join(sourceDir, 'res');
      if (fs.existsSync(resSourceDir)) {
        copyRecursiveSync(resSourceDir, destResDir);
        console.log(`Copied resources from ${resSourceDir} to ${destResDir}`);
      }
      
      return config;
    },
  ]);

  // Then, update AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = getMainApplicationOrThrow(androidManifest);

    // Add permissions
    if (!androidManifest.manifest.permission) {
      androidManifest.manifest.permission = [];
    }
    
    const permissions = [
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM'
    ];
    
    permissions.forEach(permission => {
      if (!androidManifest.manifest.permission.some(p => p.$['android:name'] === permission)) {
        androidManifest.manifest.permission.push({
          $: { 'android:name': permission }
        });
      }
    });

    // Add receivers
    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }

    // PrayerTimesWidgetProvider receiver
    const widgetProviderExists = mainApplication.receiver.some(
      r => r.$['android:name'] === '.PrayerTimesWidgetProvider'
    );
    if (!widgetProviderExists) {
      mainApplication.receiver.push({
        $: {
          'android:name': '.PrayerTimesWidgetProvider',
          'android:exported': 'true'
        },
        'intent-filter': [{
          action: [{
            $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' }
          }]
        }],
        'meta-data': [{
          $: {
            'android:name': 'android.appwidget.provider',
            'android:resource': '@xml/prayer_times_widget_info'
          }
        }]
      });
    }

    // WidgetUpdateReceiver receiver
    const updateReceiverExists = mainApplication.receiver.some(
      r => r.$['android:name'] === '.WidgetUpdateReceiver'
    );
    if (!updateReceiverExists) {
      mainApplication.receiver.push({
        $: {
          'android:name': '.WidgetUpdateReceiver',
          'android:exported': 'false'
        },
        'intent-filter': [{
          action: [{
            $: { 'android:name': 'com.poludev.iftaranekadarkaldi.WIDGET_UPDATE' }
          }]
        }]
      });
    }

    return config;
  });

  return config;
};

/**
 * Recursively copy directory
 */
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

module.exports = withNativeModules;

