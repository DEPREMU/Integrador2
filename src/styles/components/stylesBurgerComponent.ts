import { useResponsiveLayout } from "@context/LayoutContext";
import { StatusBar, StyleSheet } from "react-native";

export const stylesBurger = () => {
  const { height, width, isPhone } = useResponsiveLayout();
  const widthLine = isPhone ? 50 : 55;

  const styles = StyleSheet.create({
    button: {
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      cursor: undefined,
    },
    iconContainer: {
      width: widthLine,
      height: 40,
      position: "relative",
    },
    line: {
      position: "absolute",
      height: 6,
      width: widthLine,
      backgroundColor: "white",
      borderRadius: 9,
      left: 0,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
      height: height + (StatusBar?.currentHeight || 0),
      width,
      cursor: "auto",
    },
  });

  return { styles, widthLine };
};
