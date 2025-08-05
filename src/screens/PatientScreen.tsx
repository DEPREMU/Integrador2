import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import Header from "@components/common/Header";
import { useLanguage } from "@context/LanguageContext";
import { stylesPatientScreen } from "@styles/screens/stylesPatientScreen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation/navigationTypes";
import { useResponsiveLayout } from "@context/LayoutContext";
import { useUserContext } from "@context/UserContext";
import { usePDFReport } from "@hooks/components/usePDFReport";
import { Ionicons } from "@expo/vector-icons";
import { 
  User,
  MedicationUser, 
  ResponseGetUserMedications, 
  TypeBodyGetUserMedications,
  ResponseDeleteUserMedication,
  TypeBodyDeleteUserMedication,
  ResponseGetUserPatients
} from "@typesAPI";
import { log, getRouteAPI, fetchOptions } from "@utils";
import DayCarousel from "@components/PatientScreen/DayCarousel";

/**
 * PatientScreen displays the header, patient information,
 * and navigation buttons.
 *
 * @component
 * @returns {JSX.Element}
 */
type PatientScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Patient"
>;

const PatientScreen: React.FC = () => {
  const styles = stylesPatientScreen();
  const { translations } = useLanguage();
  const navigation = useNavigation<PatientScreenNavigationProp>();
  const { isPhone } = useResponsiveLayout();
  const { userData } = useUserContext();
  const [medications, setMedications] = useState<MedicationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const { generateMedicationReport, isGenerating } = usePDFReport();

  const loadUserMedications = async () => {
    if (!userData?.userId) {
      setLoading(false);
      return;
    }

    try {
      const response: ResponseGetUserMedications = await fetch(
        getRouteAPI("/getUserMedications"),
        fetchOptions<TypeBodyGetUserMedications>("POST", {
          userId: userData.userId,
        })
      ).then((res) => res.json());

      if (response.error) {
        console.error("Error loading medications:", response.error);
      } else {
        log("Loaded medications:", response.medications);
        setMedications(response.medications || []);
      }
    } catch (error) {
      console.error("Network error loading medications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    if (!userData?.patientUserIds || userData.patientUserIds.length === 0)
      return;

    const data: ResponseGetUserPatients = await fetch(
      getRouteAPI("/getUserPatients"),
      fetchOptions("POST", { userId: userData.userId })
    ).then((res) => res.json());

    if (data.error) {
      console.error("Error fetching patients:", data.error);
      return;
    }
    const { patients } = data;
    log(patients, "patients");
    if (patients.length === 0) return;
    setSelectedPatient(patients[0]);
  };

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      const response: ResponseDeleteUserMedication = await fetch(
        getRouteAPI("/deleteUserMedication"),
        fetchOptions<TypeBodyDeleteUserMedication>("POST", {
          medicationId: medicationId,
        })
      ).then((res) => res.json());

      if (response.success) {
        log("Medication deleted successfully");
        // Recargar los medicamentos después de eliminar
        await loadUserMedications();
      } else {
        console.error("Error deleting medication:", response.error);
        alert("Error al eliminar el medicamento. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Network error deleting medication:", error);
      alert("Error de conexión. Por favor, inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    if (userData) {
      loadPatients();
    }
    loadUserMedications();
  }, [userData?.userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      log("PatientScreen focused, reloading medications...");
      loadUserMedications();
    });

    return unsubscribe;
  }, [navigation]);

  const handleGeneratePDF = () => {
    const patientName = selectedPatient?.name || userData?.name || translations.patientName;
    const patientId = selectedPatient?.userId || userData?.userId || 'unknown';
    generateMedicationReport(medications, patientName, patientId);
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.contentContainer}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {selectedPatient?.name || userData?.name || translations.patientName}
          </Text>
          <Text style={styles.patientDescription}>
            {translations.patientDescription}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Schedule")}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="add-circle" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{translations.addMedication}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="settings" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{translations.configurePillDispenser || "Configure Pill Dispenser"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleGeneratePDF}
            activeOpacity={0.8}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>{translations.generating}</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="download" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>{translations.generateReport}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <DayCarousel 
          medications={medications} 
          loading={loading} 
          onDeleteMedication={handleDeleteMedication}
        />
      </View>
    </View>
  );
};

export default PatientScreen;
