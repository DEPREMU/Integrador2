import { StyleSheet, Dimensions } from "react-native";

export const useStylesModalComponent = () => {
  const { width } = Dimensions.get("window");
  const isMobile = width <= 600;
  const styles = StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      flex: 1,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: "#fff",
      borderRadius: 18,
      width: isMobile ? "80%" : "50%",
      maxWidth: isMobile ? 220 : 420,
      minWidth: 120,
      paddingVertical: isMobile ? 8 : 24,
      paddingHorizontal: isMobile ? 4 : 16,
      alignItems: "center",
      justifyContent: "center",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
    },
    title: {
      marginBottom: 10,
      fontWeight: "700",
      fontSize: Math.max(Math.min(width * 0.045, 18), 13),
      color: "#222",
      textAlign: "center",
      letterSpacing: 0.2,
    },
    body: {
      marginBottom: 10,
      width: "100%",
      alignItems: "center",
    },
    buttons: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
      width: "100%",
      marginTop: 6,
    },
  });

  return { styles, width };
};
