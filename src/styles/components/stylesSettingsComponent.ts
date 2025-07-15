import { StyleSheet, Platform } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

const useStylesSettings = () => {
  const { isPhone, isTablet, isWeb } = useResponsiveLayout();

  const primaryColor = "#60c4b4";
  const backgroundColor = "#ecebea";
  const textColor = "#222";
  const borderColor = "#ccc";
  const placeholderColor = "#888";
  const buttonTextColor = "#fff";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: isPhone ? 20 : isTablet ? 40 : 60,
      backgroundColor,
    },
    title: {
      fontSize: isPhone ? 24 : isTablet ? 28 : 32,
      fontWeight: "700",
      marginBottom: 20,
      color: textColor,
      textAlign: "center",
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: textColor,
    },
    input: {
      borderWidth: 1,
      borderColor,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === "ios" ? 12 : 8,
      marginBottom: 15,
      fontSize: 16,
      backgroundColor: "#fafafa",
      color: textColor,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    roleContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
    },
    roleButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor,
      backgroundColor: "#eee",
    },
    roleButtonSelected: {
      backgroundColor: primaryColor,
      borderColor: primaryColor,
    },
    roleButtonText: {
      fontSize: 16,
      color: textColor,
    },
    roleButtonTextSelected: {
      color: buttonTextColor,
      fontWeight: "700",
    },
    imageContainer: {
      alignItems: "center",
      marginBottom: 25,
    },
    image: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 10,
    },
    imagePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "#ddd",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    imagePlaceholderText: {
      color: placeholderColor,
      fontSize: 14,
    },
    button: {
      backgroundColor: "#21aae1",
      padding: 10,
      borderRadius: 5,
      marginVertical: 10,
    },
    textButton: {
      color: "#FFFFFF",
      fontSize: 16,
      textAlign: "center",
      fontWeight: "bold",
    },
  });

  return { styles, isPhone, isTablet, isWeb };
};

export default useStylesSettings;
