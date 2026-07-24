// require('dotenv').config();

module.exports = {
  expo: {
    name: "Fit & Rápido",
    slug: "fit-rapido",
    version: "1.0.0",
    sdkVersion: "54.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0f0f0f"
    },
    updates: {
      url: "https://u.expo.dev/eeccc68a-8c18-48ee-a4f1-89c4bd5389b3"
    },

    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      runtimeVersion: {
        policy: "appVersion"
      },
      supportsTablet: true,
      bundleIdentifier: "com.fitrapido.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      runtimeVersion: "1.0.0",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0f0f0f"
      },
      package: "com.fitrapido.app"
    },
    plugins: [
      [
        "expo-notifications",
        {
          "color": "#c8921a"
        }
      ],
      "expo-apple-authentication",
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.1234567890-dummy"
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static",
            "deploymentTarget": "16.4"
          }
        }
      ]
    ],
    notification: {
      color: "#c8921a",
      iosDisplayInForeground: true,
      androidMode: "default",
      androidCollapsedTitle: "#{unread_notifications} novas notificações"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    scheme: "fitrapido",
    extra: {
      eas: {
        projectId: "eeccc68a-8c18-48ee-a4f1-89c4bd5389b3"
      },
      // Expor variáveis de ambiente para o app
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3001"
    }
  }
};




