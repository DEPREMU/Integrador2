/* eslint-disable indent */
import React from "react";
import { log } from "@utils";
import { View } from "react-native";
import { useModal } from "@context/ModalContext";
import { useLanguage } from "@context/LanguageContext";
import ButtonComponent from "@components/common/Button";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserContext } from "@/context/UserContext";
import {
  RootStackParamList,
  ScreensAvailable,
} from "@/navigation/navigationTypes";
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

  /**
   * State setter to control the visibility of the language selector.
   */
  setShowLanguageSelector: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * Indicates whether the language selector is currently shown.
   */
  showLanguageSelector: boolean;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

const buttonsIsLoggedIn = ["Home", "Dashboard", "Settings", "Chatbot"] as const;

/**
 * Menu component that displays a navigation menu with smart screen detection.
 *
 * Features:
 * - Shows navigation options based on user authentication status
 * - Intelligently hides the current screen option to prevent redundant navigation
 * - Supports language switching with dynamic language selector
 * - Handles user logout with confirmation modal
 * - Uses conditional rendering for authenticated and non-authenticated states
 * - Auto-closes menu after navigation or language selection
 *
 * Navigation Options (when logged in):
 * - Home: Navigate to home screen (hidden when currently on Home)
 * - Dashboard: Navigate to dashboard (hidden when currently on Dashboard)
 * - Settings: Navigate to settings (hidden when currently on Settings)
 * - Languages: Toggle language selector
 * - Logout: Sign out user with confirmation
 *
 * Navigation Options (when not logged in):
 * - Login: Navigate to login screen
 * - Languages: Toggle language selector
 *
 * @param {MenuProps} props - Props for the Menu component.
 * @param {boolean} props.visible - Whether the menu is visible.
 * @param {() => void} props.onClose - Function to call to close the menu.
 * @returns {JSX.Element | null} The rendered menu or null if not visible.
 *
 * @example
 * // Basic usage
 * <Menu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
 *
 * @example
 * // With state management
 * const [menuVisible, setMenuVisible] = useState(false);
 * <Menu
 *   visible={menuVisible}
 *   onClose={() => setMenuVisible(false)}
 * />
 */
const Menu: React.FC<MenuProps> = ({
  visible,
  onClose,
  setShowLanguageSelector,
  showLanguageSelector,
}) => {
  const route = useRoute();
  const styles = useStylesMenuComponent();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isLoggedIn, logout } = useUserContext();
  const { openModal, closeModal } = useModal();
  const { language, t, changeLanguage } = useLanguage();
  const currentScreen = route.name as ScreensAvailable;

  if (!visible) return null;

  /**
   * Handles navigation and menu actions.
   * @param option - The menu option selected by the user
   */
  const handlePress = (option: ScreensAvailable | "Language") => {
    switch (option) {
      case "Language":
        setShowLanguageSelector((prev) => !prev);
        return;
      case "Login":
      case "Settings":
      case "Home":
      case "Dashboard":
      case "Chatbot":
        if (currentScreen === option) return;
        navigation.replace(option);
        break;
    }
    setShowLanguageSelector(false);
  };

  /**
   * Handles language selection and closes the menu.
   * @param language - The language code to switch to
   */
  const selectLanguage = async (language: LanguagesSupported) => {
    log("Language selected:", language);
    onClose();
    setShowLanguageSelector(false);
    await changeLanguage(language);
  };

  /**
   * Handles user logout with confirmation modal.
   * Shows success message after logout completion.
   */
  const handlePressLogout = async () => {
    await logout((message) => {
      log(message);
      navigation.replace("Home");
      openModal(
        t("successLogout"),
        t("successLogoutMessage"),
        <ButtonComponent label={t("close")} handlePress={closeModal} />,
      );
    });
  };

  return (
    <>
      <View style={styles.menu}>
        {!showLanguageSelector && (
          <>
            {isLoggedIn &&
              buttonsIsLoggedIn.map((screen) => {
                if (currentScreen === screen) return null;
                return (
                  <ButtonComponent
                    handlePress={() => handlePress(screen)}
                    label={t(screen.toLowerCase() as keyof typeof t)}
                    touchableOpacity
                    replaceStyles={{
                      button: styles.button,
                      textButton: styles.textButton,
                    }}
                  />
                );
              })}
            <ButtonComponent
              handlePress={() => handlePress("Language")}
              label={t("languages")}
              touchableOpacity
              replaceStyles={{
                button: styles.button,
                textButton: styles.textButton,
              }}
            />
            <ButtonComponent
              handlePress={
                isLoggedIn ? handlePressLogout : () => handlePress("Login")
              }
              label={t(isLoggedIn ? "logOut" : "login")}
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
