import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

/**
 * Custom hook that provides responsive styles for the Dashboard screen,
 * adapting layout and element sizes based on device type (phone, tablet or web).
 *
 * @returns {Object} An object containing the styles and device dimensions.
 * @property {object} stylesDashboardScreen - StyleSheet object with all styles for the Dashboard screen.
 * @property {number} height - Device screen height.
 * @property {number} width - Device screen width.
 *
 * @example
 * const { stylesDashboardScreen, height, width } = stylesDashboardScreen();
 * <View style={stylesDashboardScreen.container}>...</View>
 */
const useStylesDashboardScreen = () => {
  const { height, width, isPhone, isTablet } = useResponsiveLayout();

  const userImgSize = isPhone ? 100 : isTablet ? 100 : 100;

  const stylesDashboardScreen = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ecebea",
      alignContent: "center",
    },
    headerPlaceholder: {
      height: 60,
      backgroundColor: "#00a69d",
      justifyContent: "center",
      alignItems: "center",
    },
    headerText: {
      color: "#fff",
    },
    greeting: {
      fontSize: isPhone ? 25 : 25,
      fontWeight: "600",
      marginTop: isPhone ? 20 : 20,
      marginBottom: isPhone ? 25 : 10,
      marginLeft: 10,
    },
    userImagePlaceholder: {
      width: userImgSize,
      height: userImgSize,
      borderRadius: userImgSize / 2,
      backgroundColor: "#ecebea",
      borderWidth: 1,
      borderColor: "#ccc",
      alignSelf: "center",
      marginBottom: 16,
    },
    userImage: {
      width: userImgSize,
      height: userImgSize,
      borderRadius: userImgSize / 2,
      alignSelf: "center",
      marginBottom: 15,
    },
    listContent: {
      alignItems: "center",
      paddingHorizontal: isPhone ? 25 : 32,
      height: isPhone ? 500 : 350,
    },
    addCard: {
      height: 260,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
      paddingHorizontal: 20,
    },
    addButton: {
      height: 60,
      width: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#21aae1",
    },
    pressed: {
      opacity: 0.7,
    },
    iconWrapper: {
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
    },
    closeButton: {
      backgroundColor: "#21aae1",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      marginLeft: 8,
    },
    closeText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    image: { width: 32, height: 32, tintColor: "#fff" },
    marginRight: { marginRight: 15 },
  });

  return {
    stylesDashboardScreen,
    height,
    width,
  };
};

export default useStylesDashboardScreen;
