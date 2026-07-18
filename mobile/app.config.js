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
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.fitrapido.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
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
          color: "#c8921a"
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
        projectId: "c2166955-d2b7-4832-be31-d36ef521afda"
      },
      // Expor variáveis de ambiente para o app
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3001"
    }
  }
};




