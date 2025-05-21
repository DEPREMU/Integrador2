import { stylesHeaderComponent } from "@/styles/components/stylesHeaderComponent";
import { APP_ICON, APP_NAME } from "@/utils";
import Menu from "./Menu";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  TouchableOpacity,
} from "react-native";

interface HeaderComponentProps {
  title?: string;
  onOptionSelect?: (option: string) => void;
}

/**
 * A reusable header component for mobile applications.
 *
 * @param {HeaderComponentProps} props - The properties for the header component.
 * @param {string} props.title - The main title text to display in the header. Optional.
 * @param {React.FC} props.Children - A React component to render next to the title (e.g., icon, button). Optional.
 * @param {object} props.customStyles - Optional custom styles for container and title.
 *
 * @returns {JSX.Element} A styled header component with optional title and child elements.
 */
const HeaderComponent: React.FC<HeaderComponentProps> = ({
  title,
  onOptionSelect,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const closeMenu = () => setMenuVisible(false);

  const handleSelect = (option: string) => {
    onOptionSelect?.(option);
  };

  const styles = stylesHeaderComponent();

  return (
    <View style={[styles.container]}>
      <TouchableOpacity onPress={toggleMenu}>
        <FontAwesome name="bars" size={23} color="#ecebea" />
      </TouchableOpacity>

      <Menu visible={menuVisible} onClose={closeMenu} onSelect={handleSelect} />

      <Image source={APP_ICON} style={styles.iconImage} />

      <Text style={[styles.title]}>{APP_NAME}</Text>
    </View>
  );
};

export default HeaderComponent;
