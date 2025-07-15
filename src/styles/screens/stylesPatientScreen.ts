import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";
import { useMemo } from "react";

/**
 * Returns responsive styles for the PatientScreen component.
 * Adjusts layout and button width for mobile and small web screens.
 *
 * @returns {object} StyleSheet object for PatientScreen
 */
export const stylesPatientScreen = () => {
  const { isPhone, width, height, isWeb } = useResponsiveLayout();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ecebea",
    },
    contentContainer: {
      flex: 1,
      maxWidth: 800,
      alignSelf: "center",
      width: "100%",
    },
    patientInfo: {
      padding: isPhone ? 20 : 24,
      paddingTop: 16,
      marginBottom: isPhone ? 12 : 16,
      backgroundColor: "#fff",
      marginHorizontal: 16,
      borderRadius: 20,
      shadowColor: "#00a69d",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: "rgba(0, 166, 157, 0.08)",
    },
    patientName: {
      fontSize: isPhone ? 22 : 24,
      fontWeight: "800",
      color: "#00a69d",
      textAlign: "center",
      textShadowColor: "rgba(0, 166, 157, 0.2)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
      letterSpacing: 0.5,
    },
    patientDescription: {
      fontSize: isPhone ? 14 : 15,
      color: "#21aae1",
      marginTop: 6,
      marginBottom: isPhone ? 8 : 4,
      textAlign: "center",
      lineHeight: 20,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingTop: isPhone ? 8 : 4,
      marginBottom: isPhone ? 16 : 10,
      alignItems: "center",
      flexDirection: isPhone ? "column" : "row",
      justifyContent: "center",
      gap: isPhone ? 12 : 16,
      maxWidth: 600,
      alignSelf: "center",
      width: "100%",
    },
    button: {
      paddingVertical: 0,
      paddingHorizontal: isPhone ? 20 : 24,
      backgroundColor: "#00a69d",
      borderRadius: 16,
      width: isPhone ? "90%" : 240,
      maxWidth: isPhone ? 350 : 280,
      height: isPhone ? 60 : 54,
      alignSelf: "center",
      shadowColor: "#00a69d",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: isPhone ? 16 : 15,
      color: "white",
      textAlign: "center",
      fontWeight: "700",
      letterSpacing: 0.5,
      flexShrink: 1,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    buttonIcon: {
      marginRight: 8,
      flexShrink: 0,
    },
  }), [isPhone]);

  return styles;
};
