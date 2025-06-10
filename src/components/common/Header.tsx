import Menu from "@components/common/Menu";
import burger from "@components/common/Burger";
import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { APP_ICON, APP_NAME } from "@utils";
import { stylesHeaderComponent } from "@styles/components/stylesHeaderComponent";

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

  const closeMenu = () => setMenuVisible(false);

  const { burgerComponent, toggleMenu } = burger(
    () => setMenuVisible((prev) => !prev),
    closeMenu
  );

  return (
    <View style={styles.container}>
      {burgerComponent}

      <Menu visible={menuVisible} onClose={toggleMenu} />

      <Image source={APP_ICON}  style={styles.iconImage} />

      <Text style={styles.title}>{APP_NAME}</Text>
    </View>
  );
};

export default HeaderComponent;
