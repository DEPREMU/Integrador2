import { log } from "@utils";
import { View } from "react-native";
import { useModal } from "@context/ModalContext";
import { useLanguage } from "@context/LanguageContext";
import ButtonComponent from "@components/common/Button";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "@/context/UserContext";
import React, { useState } from "react";
import { RootStackParamList } from "@/navigation/navigationTypes";
import { useStylesMenuComponent } from "@styles/components/stylesMenuComponent";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { languagesNames, LanguagesSupported } from "@utils";

interface MenuProps {
  /**
   * Controls the visibility of the menu.
   */
  visible: boolean;

  /**
   * Callback function invoked to close the menu.
   */
  onClose: () => void;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

/**
 * Menu component that displays a simple menu with buttons.
 *
 * Features:
 * - Shows two main options: "Login" and "Languages".
 * - When "Languages" is pressed, it shows two language options: "Español" and "English".
 * - Clicking outside the menu closes it and resets the language selector view.
 * - Selecting any option closes the menu.
 *
 * @param {MenuProps} props - Props for the Menu component.
 * @param {boolean} props.visible - Whether the menu is visible.
 * @param {() => void} props.onClose - Function to call to close the menu.
 * @returns {JSX.Element | null} The rendered menu or null if not visible.
 *
 * @example
 * <Menu visible={true} onClose={() => log("Menu closed")} />
 */
const Menu: React.FC<MenuProps> = ({ visible, onClose }) => {
  const styles = useStylesMenuComponent();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { language, translations, setLanguage } = useLanguage();
  const { isLoggedIn, logout } = useUserContext();
  const { openModal, closeModal } = useModal();

  const [showLanguageSelector, setShowLanguageSelector] =
    useState<boolean>(false);

  if (!visible) return null;

  const handlePress = (option: "Language" | "Login" | "Settings") => {
    if (option === "Language") {
      setShowLanguageSelector(true);
    } else if (option === "Login") {
      navigation.replace("Login");
      setShowLanguageSelector(false);
    } else if (option === "Settings") {
      navigation.replace("Settings");
      setShowLanguageSelector(false);
    }
  };

  const selectLanguage = async (language: LanguagesSupported) => {
    log("Language selected:", language);
    onClose();
    setLanguage(language);
    setShowLanguageSelector(false);
  };

  const handlePressLogout = async () => {
    await logout((message) => {
      log(message);
      openModal(
        translations.successLogout,
        translations.successLogoutMessage,
        <ButtonComponent label={translations.close} handlePress={closeModal} />,
      );
    });
  };

  return (
    <>
      <View style={styles.menu}>
        {!showLanguageSelector && (
          <>
            {!isLoggedIn && (
              <ButtonComponent
                handlePress={() => handlePress("Login")}
                label={translations.login}
                touchableOpacity
                replaceStyles={{
                  button: styles.button,
                  textButton: styles.textButton,
                }}
              />
            )}
            {isLoggedIn && (
              <ButtonComponent
                handlePress={handlePressLogout}
                label={translations.logOut}
                touchableOpacity
                replaceStyles={{
                  button: styles.button,
                  textButton: styles.textButton,
                }}
              />
            )}
            <ButtonComponent
              handlePress={() => handlePress("Language")}
              label={translations.languages}
              touchableOpacity
              replaceStyles={{
                button: styles.button,
                textButton: styles.textButton,
              }}
            />
            <ButtonComponent
              handlePress={() => handlePress("Settings")}
              label={t("settings")}
              touchableOpacity
              replaceStyles={{
                button: styles.button,
                textButton: styles.textButton,
              }}
            />
          </>
        )}
        {showLanguageSelector && (
          <>
            {Object.entries(languagesNames).map(([lang, langName]) => {
              if (lang === language) return null;
              return (
                <ButtonComponent
                  key={lang}
                  handlePress={() => selectLanguage(lang as LanguagesSupported)}
                  label={langName}
                  touchableOpacity
                  replaceStyles={{
                    button: styles.button,
                    textButton: styles.textButton,
                  }}
                />
              );
            })}
          </>
        )}
      </View>
    </>
  );
};

export default Menu;
