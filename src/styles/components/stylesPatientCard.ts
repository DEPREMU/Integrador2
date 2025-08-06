import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

/**
 * Custom hook that returns responsive styles for the PatientCard component.
 * It adjusts card dimensions and margins based on whether the device is a phone, tablet or web.
 *
 * @returns {{ card: object; photoPlaceholder: object; photo: object; name: object; pillList: object; pill: object; pillText: object }}
 *   An object containing StyleSheet styles for PatientCard elements.
 *
 * @example
 * const styles = useStylesPatientCard();
 * <View style={styles.card}>...</View>
 */
export const useStylesPatientCard = () => {
  const { isPhone } = useResponsiveLayout();
  const cardWidth = isPhone ? 250 : 300;
  const cardHeight = isPhone ? 450 : 300;

  return StyleSheet.create({
    card: {
      width: cardWidth,
      height: cardHeight,
      backgroundColor: "rgba(162, 221, 231, 0.8)",
      borderRadius: 12,
      padding: 20,
      marginRight: isPhone ? 20 : 35,
      justifyContent: "space-around",
      alignItems: "center",
      boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
      elevation: 3,
    },
    photoPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#ecebea",
      overflow: "hidden",
      marginBottom: 12,
    },
    photo: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    name: {
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 8,
    },
    description: {
      fontSize: 12,
      color: "#666",
      textAlign: "center",
      marginBottom: 8,
      paddingHorizontal: 4,
      lineHeight: 16,
    },
    pillList: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginVertical: 8,
    },
    pill: {
      backgroundColor: "#f0f0f0",
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 4,
      margin: 4,
    },
    pillText: {
      fontSize: 12,
      color: "#333",
    },
    deleteButton: {
      position: "absolute",
      top: 5,
      right: 5,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#ff4444",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      borderWidth: 2,
      borderColor: "#fff",
    },
    editButton: {
      position: "absolute",
      top: 5,
      right: 42, // Position to the left of delete button
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#00a69d",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      borderWidth: 2,
      borderColor: "#fff",
    },
  });
};
