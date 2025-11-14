module.exports = {
  expo: {
    name: "İftara Ne Kadar Kaldı?",
    slug: "iftaranekadarkaldi",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "iftaranekadarkaldi",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    plugins: [
      "expo-router",
      "expo-dev-client",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Uygulamanın konumunuza erişmesine izin verin."
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#ffffff",
          sounds: []
        }
      ],
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: "ca-app-pub-6641198704450637~9015459823",
          iosAppId: "ca-app-pub-6641198704450637~4192601889"
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            buildFeatures: {
              buildConfig: true
            },
            enableProguardInReleaseBuilds: false
          }
        }
      ],
      "./plugins/withNativeModules"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.poludev.iftaranekadarkaldi",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Uygulamanın namaz vakitlerini gösterebilmesi için konumunuza erişmesi gerekiyor.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Uygulamanın namaz vakitlerini gösterebilmesi için konumunuza erişmesi gerekiyor."
      }
    },
    android: {
      package: "com.poludev.iftaranekadarkaldi",
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#FF9800"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "RECEIVE_BOOT_COMPLETED",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      "eas": {
        "projectId": "48c138e1-276a-43d0-af72-8d056c7cf689"
      }
    }
  }
};

