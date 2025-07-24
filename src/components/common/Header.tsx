import Menu from "@components/common/Menu";
import React, { useState } from "react";
import burger from "@hooks/components/Burger";
import { View, Text, Image } from "react-native";
import { APP_ICON, APP_NAME } from "@utils";
import { useStylesHeaderComponent } from "@styles/components/stylesHeaderComponent";

/**
 * HeaderComponent renders a header bar with a menu toggle button, app icon, and app name.
 * It manages the visibility of the Menu component internally.
 *
 * @returns {JSX.Element} The header component UI.
 *
 * @example
 * <HeaderComponent />
 */
const HeaderComponent: React.FC = () => {
  const styles = useStylesHeaderComponent();
  const [showLanguageSelector, setShowLanguageSelector] =
    useState<boolean>(false);

  const {
    burgerComponent,
    toggleMenu,
    isOpen: menuVisible,
  } = burger(setShowLanguageSelector);

  return (
    <View style={styles.container}>
      {burgerComponent}

      <Menu
        visible={menuVisible}
        onClose={toggleMenu}
        setShowLanguageSelector={setShowLanguageSelector}
        showLanguageSelector={showLanguageSelector}
      />

      <Image source={APP_ICON} style={styles.iconImage} />

      <Text style={styles.title}>{APP_NAME}</Text>
    </View>
  );
};

export default HeaderComponent;
