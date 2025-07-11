import { useResponsiveLayout } from "@context/LayoutContext";
import { StyleSheet } from "react-native";

export const useStylesDayCarousel = () => {
  const { isPhone, isWeb, width } = useResponsiveLayout();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 0,
    },
    cardsRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      width: 300,
      height: 300,
      marginHorizontal: 8,
      padding: 14,
      backgroundColor: "#fff",
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignItems: "center",
      justifyContent: isPhone ? "center" : "flex-start",
    },
    cardHover: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 8,
      transform: [{ scale: 1.04 }],
      zIndex: 2,
    },
    dayTitle: {
      fontSize: isWeb ? 24 : 20,
      fontWeight: "600",
      marginBottom: 12,
      color: "#333",
      textAlign: "center",
    },
    medicationText: {
      fontSize: isWeb ? 18 : 16,
      color: "#555",
      textAlign: "center",
    },
    emptyMedication: {
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    arrowButton: {
      padding: 12,
    },
    moreMedicationsText: {
      color: "#00a69d",
      marginTop: 5,
      textAlign: "center",
    },
    closeButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: "#00a69d",
      borderRadius: 8,
      textAlign: "center",
    },
  });

  const customStyles = StyleSheet.create({
    modal: {
      backgroundColor: "#fff",
      borderRadius: 24,
      paddingVertical: 36,
      paddingHorizontal: 32,
      alignItems: "center",
      elevation: 50,
      zIndex: 1000,
      shadowColor: "#00a69d",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      borderWidth: 2,
      borderColor: "#00a69d",
    },
    title: {
      color: "#00a69d",
      fontWeight: "bold",
      fontSize: 24,
      marginBottom: 18,
      letterSpacing: 0.5,
      textShadowColor: "#b2f7ef",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    body: {
      alignItems: "center",
      marginBottom: 18,
    },
    buttons: {
      justifyContent: "center",
      width: "100%",
      marginTop: 12,
    },
    overlay: {
      zIndex: 999,
      elevation: 49,
    },
    messageText: {},
  });

  return { styles, customStyles, width, isPhone, isWeb };
};
