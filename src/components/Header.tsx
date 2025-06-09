import { stylesHeaderComponent } from "@styles/components/stylesHeaderComponent";
import { APP_ICON, APP_NAME, MENU_ICON } from "@utils";
import Menu from "@components/Menu";
import React, { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";

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
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const styles = stylesHeaderComponent();

  const toggleMenu = () => setMenuVisible((prev) => !prev);
  const closeMenu = () => setMenuVisible(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleMenu}>
        <Image source={MENU_ICON} style={styles.iconImage} />
      </Pressable>

      <Menu visible={menuVisible} onClose={closeMenu} />

      <Image source={APP_ICON} style={styles.iconImage} />

      <Text style={styles.title}>{APP_NAME}</Text>
    </View>
  );
};

export default HeaderComponent;
