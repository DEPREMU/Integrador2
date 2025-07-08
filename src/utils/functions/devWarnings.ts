import { Platform } from "react-native";

/**
 * Logs a development warning about expo-notifications limitations in Expo Go
 * This runs only once when the app starts
 */
export const logExpoGoWarning = (() => {
  let hasWarned = false;
  
  return () => {
    if (hasWarned) return;
    hasWarned = true;
    
    // Check if we're likely in Expo Go (this is a heuristic)
    const isExpoGo = __DEV__ && Platform.OS !== "web";
    
    if (isExpoGo) {
      console.log(
        "%c📱 Development Notice",
        "color: #ff6b6b; font-weight: bold; font-size: 14px;",
        "\n🔔 Push notifications are not available in Expo Go with SDK 53+",
        "\n✅ For full functionality, create a development build:",
        "\n   npx create-expo-app --template",
        "\n   npx expo install expo-dev-client",
        "\n   npx expo run:android or npx expo run:ios",
        "\n📖 Learn more: https://docs.expo.dev/develop/development-builds/introduction/"
      );
    }
  };
})();
