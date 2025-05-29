import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

const stylesHomeScreen = () => {
  const { height, width } = useResponsiveLayout();

  const stylesHomeScreen = StyleSheet.create({
    viewContainer: {
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
  });

  return {
    stylesHomeScreen,
    height,
    width,
  };
};

export default stylesHomeScreen;
