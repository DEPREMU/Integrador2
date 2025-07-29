import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

/**
 * Generates styles for the HomeScreen component, adapting layout based on device type.
 * It utilizes the responsive layout context to ensure consistent styling across different devices.
 * Includes styles for image container, footer components (web-only), and main layout elements.
 *
 * @returns {{ stylesHomeScreen: import('react-native').NamedStyles<any>, height: number, width: number }}
 *          An object containing the stylesheet for the HomeScreen, the screen height, and the screen width.
 *
 * @example
 * const { stylesHomeScreen, height, width } = stylesHomeScreen();
 * <View style={stylesHomeScreen.viewContainer}>...</View>
 */
const useStylesHomeScreen = () => {
  const { height, width, isPhone, isTablet } = useResponsiveLayout();

  const stylesHomeScreen = StyleSheet.create({
    viewContainer: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      width: "100%",
    },
    image: {
      width: isPhone ? 200 : isTablet ? 300 : 300,
      height: isPhone ? 300 : 300,
      marginRight: 12,
      marginTop: 4,
      resizeMode: "contain",
      justifyContent: "center",
    },
    imageContainer: {
      alignItems: "center",
      marginVertical: 20,
    },
    footerContainer: {
      backgroundColor: "#f5f5f5",
      padding: 20,
      marginTop: 30,
      borderTopWidth: 1,
      borderTopColor: "#e0e0e0",
      alignItems: "center",
    },
    footerTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 5,
    },
    footerDescription: {
      fontSize: 14,
      color: "#666",
      textAlign: "center",
    },
    footerCopyright: {
      fontSize: 12,
      color: "#999",
      marginTop: 10,
    },
  });

  return {
    stylesHomeScreen,
    height,
    width,
  };
};

export default useStylesHomeScreen;
