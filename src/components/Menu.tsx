import React, { useState } from "react";
import { View, TouchableWithoutFeedback } from "react-native";
import ButtonComponent from "@components/Button";
import { stylesMenuComponent } from "@/styles/components/stylesMenuComponent";
import {
  languagesNames,
  LanguagesSupported,
  languagesSupported,
} from "@utils";
import { useLanguage } from "@context/LanguageContext";

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
 * <Menu visible={true} onClose={() => console.log("Menu closed")} />
 */
const Menu: React.FC<MenuProps> = ({ visible, onClose }) => {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const { language, setLanguage, translations } = useLanguage();

  if (!visible) return null;
  const styles = stylesMenuComponent();

  const handleClose = () => {
    setShowLanguageSelector(false);
    onClose();
  };

  /**
   * Handles pressing a menu option.
   * Shows language selector if "Language" is pressed, otherwise closes menu.
   *
   * @param {string} option - The selected menu option.
   */
  const handlePress = (option: string) => {
    if (option === "Language") {
      setShowLanguageSelector(true);
    } else {
      setShowLanguageSelector(false);
      onClose();
    }
  };

  const selectLanguage = (language: LanguagesSupported) => {
    console.log("Idioma seleccionado:", language);
    setShowLanguageSelector(false);
    setLanguage(language);
    onClose();
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.menu}>
        {!showLanguageSelector ? (
          <>
            <ButtonComponent
              handlePress={() => handlePress("Login")}
              label={translations.login}
              touchableOpacity
              replaceStyles={{
                button: styles.button,
                textButton: styles.textButton,
              }}
            />
            <ButtonComponent
              handlePress={() => handlePress("Language")}
              label={translations.languages}
              touchableOpacity
              replaceStyles={{
                button: styles.button,
                textButton: styles.textButton,
              }}
            />
          </>
        ) : (
          <>
            {Object.entries(languagesNames).map(([lang, langName]) => {
              if (lang === language) return null;
              return (
                <ButtonComponent
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
