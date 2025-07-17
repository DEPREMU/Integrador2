import {
  saveData,
  loadData,
  logError,
  KEYS_STORAGE,
  stringifyData,
  reasonNotification,
  handleCancelNotification,
} from "@utils";
import { View } from "react-native";
import { useLanguage } from "@context/LanguageContext";
import HeaderComponent from "@components/common/Header";
import { Text, Switch } from "react-native-paper";
import useStylesSettings from "@styles/screens/stylesSettingsScreen";
import { Notifications } from "@types";
import { useUserContext } from "@context/UserContext";
import { useBackgroundTask } from "@context/BackgroundTaskContext";
import UserSettingsComponent from "@components/common/UserSettingsComponent";
import React, { useState, useEffect } from "react";

interface SettingsProps {}

/**
 * Settings screen component for managing user preferences and notification settings.
 *
 * This component provides a comprehensive interface for users to:
 * - Toggle notification settings with automatic save functionality
 * - Manage notification preferences using the app's notification system format
 * - Access user-specific profile settings when authenticated
 * - Configure app-wide settings with real-time updates
 *
 * Features:
 * - Loads existing notification configurations on component mount
 * - Automatically saves changes when notification toggle is switched
 * - Uses the proper Notifications format (Record<ReasonNotification, Notification | null>)
 * - Integrates with the app's notification system for consistency
 * - Provides immediate feedback and error handling
 * - Supports multi-language interface through translation system
 * - Conditionally shows UserSettingsComponent for authenticated users
 * - Handles notification clearing when disabled and preservation when enabled
 *
 * Notification Management:
 * - When enabled: Preserves existing notification configurations
 * - When disabled: Clears all scheduled notifications by setting them to null
 * - Supports notification types: "Initial Notification", "Medication Reminder"
 * - Uses JSON format compatible with expo-notifications system
 * - Handles both local storage and notification scheduling
 *
 * Platform Compatibility:
 * - Works on mobile devices (iOS/Android) with full notification support
 * - Gracefully handles web environment where expo-notifications may be limited
 * - Provides consistent UI across all platforms
 *
 * @component
 * @returns {React.ReactElement} The rendered Settings screen with notification toggle and user settings.
 *
 * @example
 * // Basic usage in navigation stack
 * <Settings />
 *
 * @example
 * // Usage with navigation
 * navigation.navigate('Settings');
 */
const Settings: React.FC<SettingsProps> = () => {
  const { isLoggedIn } = useUserContext();
  const { styles } = useStylesSettings();
  const { t } = useLanguage();
  const { addTaskQueue } = useBackgroundTask();

  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const hasEnabledNotifications = await loadData<boolean>(
          KEYS_STORAGE.NOTIFICATIONS_ENABLED,
        );

        setNotificationsEnabled(hasEnabledNotifications);
      } catch (error) {
        console.warn("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const func = async () => {
      try {
        if (notificationsEnabled)
          return await saveData(KEYS_STORAGE.NOTIFICATIONS_ENABLED, true);
        const notificationsData = await loadData<Notifications>(
          KEYS_STORAGE.NOTIFICATIONS_STORAGE,
          (n) => n ?? ({} as Notifications),
        );

        reasonNotification.forEach(async (reason) => {
          await handleCancelNotification(notificationsData, reason, false);
          notificationsData[reason] = null;
        });
        await Promise.all([
          saveData(KEYS_STORAGE.NOTIFICATIONS_ENABLED, notificationsEnabled),
          saveData(
            KEYS_STORAGE.NOTIFICATIONS_STORAGE,
            stringifyData(notificationsData),
          ),
        ]);
      } catch (error) {
        logError("Error saving settings:", error);
      }
    };

    addTaskQueue(func);
  }, [notificationsEnabled, addTaskQueue]);

  return (
    <>
      <HeaderComponent />
      <View style={styles.container}>
        <Text style={styles.title}>{t("settings")}</Text>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>{t("enableNotifications")}</Text>
          <Switch
            color="#7cced4"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        {isLoggedIn && <UserSettingsComponent />}
      </View>
    </>
  );
};

export default Settings;
