import { StyleSheet } from "react-native";

/**
 * Styles for the modal footer buttons (Cancel, Save).
 * Designed to match primary/secondary UI conventions.
 */
export const useStylesPatientModalButtons = () => {
  return StyleSheet.create({
    footerContainer: {
      marginTop: 10,
      width: "100%",
    },
    cancel: {
      width: "100%",
      backgroundColor: "#e0e0e0",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    cancelText: {
      color: "#2c3e50",
      fontWeight: "600",
      fontSize: 16,
    },
  });
};
