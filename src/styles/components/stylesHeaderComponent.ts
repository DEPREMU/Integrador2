import { useResponsiveLayout } from "@/context/LayoutContext";
import { StyleSheet } from "react-native";

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
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#ecebea",
    },
    iconImage: {
      width: 50,
      height: 50,
    },
  });
};
