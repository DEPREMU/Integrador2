import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

/**
 * Custom hook that returns responsive styles for the PatientScreen component.
 * Adjusts layout and button width for mobile and small web screens.
 *
 * @returns {object} StyleSheet object for PatientScreen
 */
export const useStylesPatientScreen = () => {
  const { isPhone } = useResponsiveLayout();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ecebea",
    },
    patientInfo: {
      padding: 16,
      paddingTop: 8,
    },
    patientName: {
      fontSize: 18,
      fontWeight: "600",
    },
    patientDescription: {
      fontSize: 14,
      color: "#666",
      marginTop: 4,
    },
    buttonContainer: {
      paddingHorizontal: 0,
      marginBottom: isPhone ? 0 : 10,
      alignItems: "center",
    },
    button: {
      paddingVertical: isPhone ? 10 : 14,
      backgroundColor: "#00a69d",
      borderRadius: 6,
      maxWidth: isPhone ? undefined : 220,
      width: isPhone ? 200 : 180,
      alignSelf: "center",
      marginBottom: isPhone ? 0 : 8,
    },
    buttonText: {
      fontSize: 14,
      color: "white",
      textAlign: "center",
    },
  });

  return styles;
};
