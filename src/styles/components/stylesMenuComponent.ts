import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

/**
 * Generates styles for the Menu component.
 * Uses responsive layout context to adapt styles if needed.
 *
 * @returns {import('react-native').NamedStyles<any>} The styles object for the Menu component.
 *
 * @example
 * const styles = stylesMenuComponent();
 * <View style={styles.menu}>...</View>
 */
export const stylesMenuComponent = () => {
  const { isPhone, isWeb, width: screenWidth } = useResponsiveLayout();

  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "transparent", // Puedes poner "rgba(0,0,0,0.1)" si quieres sombra leve
      zIndex: 999, // Asegura que esté sobre otros elementos
    },
    menu: {
      position: "absolute",
      top: 55,
      left: 40,
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 6,
      paddingVertical: 5,
      width: isPhone ? 150 : 200,
      zIndex: 1000,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    textButton: {
      fontSize: isPhone? 13 : 16,
      color: "#333",
    },
  });
};
