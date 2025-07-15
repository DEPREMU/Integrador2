import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

/**
 * Generates styles for the HomeScreen component, adapting layout based on device type.
 * It utilizes the responsive layout context to ensure consistent styling across different devices.
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
  });

  return {
    stylesHomeScreen,
    height,
    width,
  };
};

export default useStylesHomeScreen;
