import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

export const useStylesScheduleMedication = () => {
  const { isPhone, isWeb, width, height } = useResponsiveLayout();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ecebea",
      padding: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: "#ecebea",
    },
    header: {
      marginBottom: 20,
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#00a69d",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: "#00a69d",
      marginBottom: 12,
    },
    patientSelector: {
      marginBottom: 12,
    },
    patientLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#21aae1",
      marginBottom: 8,
    },
    patientButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    patientButton: {
      backgroundColor: "#7cced4",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    selectedPatient: {
      backgroundColor: "#00a69d",
    },
    patientButtonText: {
      color: "#00a69d",
      fontWeight: "500",
    },
    selectedPatientText: {
      color: "white",
      fontWeight: "600",
    },
    patientInfo: {
      backgroundColor: "#ecebea",
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    patientDetail: {
      fontSize: 14,
      color: "#21aae1",
      marginBottom: 4,
    },
    formContainer: {
      backgroundColor: "#fff",
      borderRadius: 16,
      flex: 1,
      padding: 16,
      marginBottom: 20,
      shadowColor: "#00a69d",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    formContent: {
      flex: 1,
      paddingBottom: 20,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontWeight: "600",
      marginBottom: 10,
      color: "#00a69d",
      fontSize: 16,
    },
    medicationScroll: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      flex: 1,
    },
    medicationButtons: {
      flexDirection: "row",
      gap: 12,
    },
    medButton: {
      backgroundColor: "#ecebea",
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
      minWidth: 100,
      alignItems: "center",
    },
    selectedMedButton: {
      backgroundColor: "#00a69d",
      padding: 10,
      borderRadius: 12,
    },
    medButtonText: {
      color: "#00a69d",
      fontWeight: "500",
    },
    selectedMedText: {
      color: "white",
      fontWeight: "600",
    },
    doseContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 16,
    },
    doseInputGroup: {
      flex: 1,
    },
    dosageTypeGroup: {
      flex: 1,
    },
    input: {
      width: "100%",
      fontSize: 14,
      backgroundColor: "#ecebea",
    },
    medicationText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#00a69d",
      marginBottom: 8,
    },
    dosageButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 4,
    },
    dosageButton: {
      backgroundColor: "#ecebea",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
    },
    selectedDosageButton: {
      backgroundColor: "#00a69d",
    },
    dosageButtonText: {
      color: "#00a69d",
      fontSize: 14,
    },
    selectedDosageText: {
      color: "white",
      fontWeight: "600",
      fontSize: 14,
    },
    daysContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    dayButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#ecebea",
      justifyContent: "center",
      alignItems: "center",
    },
    selectedDay: {
      backgroundColor: "#00a69d",
    },
    dayButtonText: {
      color: "#21aae1",
      fontWeight: "500",
    },
    selectedDayText: {
      color: "white",
      fontWeight: "700",
    },
    timeButton: {
      borderWidth: 1,
      borderColor: "#7cced4",
      borderRadius: 12,
      padding: 16,
      backgroundColor: "#ecebea",
    },
    timeButtonText: {
      fontSize: 16,
      color: "#00a69d",
      textAlign: "center",
    },
    addButton: {
      backgroundColor: "#00a69d",
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
      shadowColor: "#00a69d",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    addButtonText: {
      color: "white",
      fontWeight: "700",
      fontSize: 16,
    },
    schedulesContainer: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      flex: 1 / 3,
      shadowColor: "#00a69d",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    schedulesContent: {
      flex: 1,
      paddingBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
      color: "#00a69d",
    },
    scheduleList: {
      paddingBottom: 20,
    },
    scheduleItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#7cced4",
      alignItems: "center",
    },
    scheduleInfo: {
      flex: 1,
      marginRight: 12,
    },
    medName: {
      fontWeight: "600",
      fontSize: 17,
      marginBottom: 6,
      color: "#00a69d",
    },
    doseText: {
      fontSize: 15,
      color: "#21aae1",
    },
    daysIndicator: {
      flexDirection: "row",
      minWidth: 160,
      justifyContent: "space-between",
    },
    dayIndicator: {
      fontSize: 15,
      color: "#60c4b4",
      fontWeight: "600",
    },
    activeDayIndicator: {
      color: "#00a69d",
    },
    deleteButton: {
      backgroundColor: "#fce8e6",
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
    },
    deleteButtonText: {
      color: "#d93025",
      fontSize: 18,
      fontWeight: "bold",
    },
    clearMedicationButton: {
      backgroundColor: "#fce8e6",
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 16,
    },
    selectedMedication: {
      backgroundColor: "#00a69d",
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 16,
      justifyContent: "center",
      flexDirection: "column",
      gap: 8,
    },
    clearMedicationChildren: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-evenly",
      gap: 8,
    },
    clearMedicationText: {
      color: "white",
      fontWeight: "600",
      fontSize: 16,
    },
    urgencyButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 4,
    },
    urgencyButton: {
      backgroundColor: "#ecebea",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
    },
    selectedUrgencyButton: {
      backgroundColor: "#00a69d",
    },
    urgencyButtonText: {
      color: "#00a69d",
      fontSize: 14,
    },
    selectedUrgencyText: {
      color: "white",
      fontWeight: "600",
      fontSize: 14,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 18,
      color: "#60c4b4",
      fontWeight: "500",
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: "#21aae1",
      textAlign: "center",
    },
  });

  return {
    styles,
    isPhone,
    isWeb,
    width,
    height,
  };
};
