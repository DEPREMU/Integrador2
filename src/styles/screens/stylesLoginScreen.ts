import { useResponsiveLayout } from "@/context/LayoutContext";
import { StyleSheet } from "react-native";

export const stylesLoginScreen = () => {
  const { height, isPhone, isWeb } = useResponsiveLayout();

  return StyleSheet.create({
    viewContainer: {
      flex: 1,
      justifyContent: "space-between", 
      alignItems: "center",
      width: "100%"
    },
  });
};
