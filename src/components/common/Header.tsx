import Menu from "@components/common/Menu";
import React from "react";
import burger from "@hooks/components/Burger";
import { View, Text, Image } from "react-native";
import { APP_ICON, APP_NAME } from "@utils";
import { stylesHeaderComponent } from "@styles/components/stylesHeaderComponent";

/**
 * Header renders a header bar with a menu toggle button, app icon, and app name.
 * It manages the visibility of the Menu component internally.
 *
 * @returns {JSX.Element} The header component UI.
 *
 * @example
 * <Header />
 */
const Header: React.FC = () => {
  const styles = stylesHeaderComponent();

  const { burgerComponent, toggleMenu, isOpen: menuVisible } = burger();

  return (
    <View style={styles.container}>
      {burgerComponent}

      <Menu visible={menuVisible} onClose={toggleMenu} />

      <Image source={APP_ICON} style={styles.iconImage} />

      <Text style={styles.title}>{APP_NAME}</Text>
    </View>
  );
};

export default Header;
