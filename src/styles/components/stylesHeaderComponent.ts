import { useResponsiveLayout } from "@/context/LayoutContext";
import { StyleSheet } from "react-native";

/**
 * Generates styles for the Header component.
 * Uses responsive layout context to adapt styles if needed.
 *
 * @returns {import('react-native').NamedStyles<any>} The styles object for the Header component.
 *
 * @example
 * const styles = stylesHeaderComponent();
 * <View style={styles.container}>...</View>
 */
export const stylesHeaderComponent = () => {
  const { isPhone, isWeb } = useResponsiveLayout();

  return StyleSheet.create({
    container: {
      backgroundColor: "#00a69d",
      paddingVertical: 15,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: "#ddd",
      width: "100%",
      zIndex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#ecebea",
    },
    iconImage: {
      width: 40,
      height: 40,
    },
  });
};
