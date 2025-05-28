import { useResponsiveLayout } from "@context/LayoutContext";
import { StyleSheet } from "react-native";

export const useStylesModalComponent = () => {
  const { height, width } = useResponsiveLayout();
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      width: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      zIndex: 1000,
      left: 0,
      top: 0,
      height: height,
      cursor: "auto",
    },
    modal: {
      backgroundColor: "#fff",
      cursor: "auto",
      borderRadius: 8,
      width: "90%",
      maxWidth: 500,
      padding: 20,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    title: {
      marginBottom: 15,
      fontWeight: "bold",
      fontSize: 18,
    },
    body: {
      marginBottom: 15,
    },
    buttons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
  });

  return { styles, height, width };
};
