import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

const useStylesSettings = () => {
  const { isPhone, isTablet, isWeb } = useResponsiveLayout();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: isPhone ? 20 : isTablet ? 40 : 60,
      backgroundColor: "#f9f9f9",
    },
    title: {
      fontSize: isPhone ? 28 : isTablet ? 32 : 36,
      fontWeight: "700",
      marginBottom: 20,
      color: "#222",
      textAlign: "center",
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: "#444",
    },
    input: {
      height: 44,
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 20,
      backgroundColor: "#fff",
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 25,
    },
    saveButton: {
      backgroundColor: "#21aae1",
      paddingVertical: 14,
      borderRadius: 8,
      marginTop: 10,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
    },
    logoutButton: {
      backgroundColor: "#FF3B30",
      paddingVertical: 14,
      borderRadius: 8,
      marginTop: 20,
    },
    logoutButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
    },
    languageButton: {
      backgroundColor: "#34C759",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    languageButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
  });

  return { styles, isPhone, isTablet, isWeb };
};
export default useStylesSettings;
