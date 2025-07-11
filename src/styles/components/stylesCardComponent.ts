import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@/context/LayoutContext";

/**
 * Generates dynamic styles for the Card component based on the device layout.
 * Uses responsive layout context to adapt styles for phone or web environments.
 *
 * @returns {import('react-native').StyleSheet.NamedStyles<any>} The styles object for the Card component.
 *
 * @example
 * const styles = useStylesCardComponent();
 * <View style={styles.card}>...</View>
 */
export const useStylesCardComponent = () => {
  const { isPhone } = useResponsiveLayout();

  return StyleSheet.create({
    card: {
      backgroundColor: "#60c4b4",
      borderRadius: 16,
      padding: 16,
      marginVertical: 10,
      marginHorizontal: isPhone ? 10 : 20,
      width: isPhone ? "80%" : 800,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "flex-start",
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    textContainer: {
      flex: 1,
      justifyContent: "flex-start",
    },
    title: {
      fontSize: isPhone ? 18 : 22,
      fontWeight: "bold",
      marginBottom: 4,
      color: "#fff",
    },
    description: {
      fontSize: isPhone ? 14 : 16,
      color: "#f0f0f0",
      flexShrink: 1,
    },
  });
};
