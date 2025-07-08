import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Text, Switch } from "react-native-paper";
import { useLanguage } from "@context/LanguageContext";
import { useUserContext } from "@context/UserContext";
import ButtonComponent from "@components/common/Button";
import { saveData, loadData, KEYS_STORAGE } from "@utils";
import HeaderComponent from "@components/common/Header";
import useStylesSettings from "@/styles/screens/stylesSettingsScreen";
import UserSettingsComponent from "@/components/common/UserSettingsComponent";

interface SettingsProps {}

/**
 * Settings screen component for managing user preferences.
 *
 * This component allows users to:
 * - Toggle notification settings.
 * - Save their preferences to local storage.
 * - Change language settings.
 * - Access user-specific settings if logged in.
 *
 * It loads saved settings on mount and provides a UI for updating them.
 *
 * @component
 * @returns {React.ReactElement} The rendered Settings screen.
 */
const Settings: React.FC<SettingsProps> = () => {
  const { isLoggedIn } = useUserContext();
  const { styles } = useStylesSettings();
  const { translations } = useLanguage();

  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notif = await loadData<boolean>(KEYS_STORAGE.NOTIFICATIONS);

        if (notif !== null) setNotificationsEnabled(notif);
      } catch (error) {
        console.warn("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      await saveData(KEYS_STORAGE.NOTIFICATIONS, notificationsEnabled);
    } catch (error) {}
  };

  return (
    <>
      <HeaderComponent />
      <View style={styles.container}>
        <Text style={styles.title}>{translations.settings}</Text>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>{translations.enableNotifications}</Text>
          <Switch
            color="#7cced4"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        <ButtonComponent
          label={translations.save}
          handlePress={saveSettings}
          touchableOpacity
          customStyles={{
            button: styles.saveButton,
            textButton: styles.saveButtonText,
          }}
        />
        {isLoggedIn && <UserSettingsComponent />}
      </View>
    </>
  );
};

export default Settings;
