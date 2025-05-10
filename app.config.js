export default {
  expo: {
    name: "Integrador2",
    slug: "Integrador2",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon-512.jpg",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/icon-512.jpg",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon-512.jpg",
        backgroundColor: "#000000",
      },
      package: "com.integrador2.app",
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "NOTIFICATIONS",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "FOREGROUND_SERVICE",
      ],
    },
    plugins: [
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
    ],
    web: {
      favicon: "./assets/icon-512.jpg",
    },
  },
};
