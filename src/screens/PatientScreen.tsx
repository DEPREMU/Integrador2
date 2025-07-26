import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import HeaderComponent from "@components/common/Header";
import { useLanguage } from "@context/LanguageContext";
import { useStylesPatientScreen } from "@styles/screens/stylesPatientScreen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation/navigationTypes";
import { useResponsiveLayout } from "@context/LayoutContext";
import { useUserContext } from "@context/UserContext";
import { usePDFReport } from "@hooks/usePDFReport";
import { Ionicons } from "@expo/vector-icons";
import { UserData } from "../types/TypesUser";
import { MedicationUser } from "../types/TypesSchedule";
import { ResponseGetUserMedications, TypeBodyGetUserMedications, ResponseGetUserPatients } from "../types/index.types";
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
  const { styles } = useStylesPatientScreen();
  const { t, language } = useLanguage();
  const navigation = useNavigation<PatientScreenNavigationProp>();
  const { isPhone } = useResponsiveLayout();
  const { userData } = useUserContext();
  const [medications, setMedications] = useState<MedicationUser[]>([]);
  const [loading, setLoading] = useState(true);
const [selectedPatient, setSelectedPatient] = useState<UserData | null>(null);
  const { generateMedicationReport, isGenerating } = usePDFReport();

  const loadUserMedications = async () => {
    if (!userData?.id) {
      setLoading(false);
      return;
    }

    try {
      const response: ResponseGetUserMedications = await fetch(
        getRouteAPI("/getUserMedications"),
        fetchOptions<TypeBodyGetUserMedications>("POST", {
          userId: userData.id,
        })
      ).then((res) => res.json());

      // LOG COMPLETO DE LA RESPUESTA PARA DEPURACIÓN
      console.log("/getUserMedications response:", JSON.stringify(response, null, 2));

      if (response.error) {
        console.error("Error loading medications:", response.error);
      } else {
        log("Loaded medications:", response.medications);
        // Adaptar los datos si es necesario
        setMedications(
          (response.medications as any[]).map((med: any) => ({
            ...med,
            medicationId: med.medicationId || med.id || "",
            name: med.name || med.medication || "",
            dosage: med.dosage || "",
            startHour: med.startHour || "",
            days: med.days || [],
            grams: med.grams || 0,
            intervalHours: med.intervalHours || 0,
            stock: med.stock || 0,
            urgency: med.urgency || ""
          }))
        );
      }
    } catch (error) {
      console.error("Network error loading medications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    // Si necesitas cargar pacientes, deberías obtener los IDs de otra fuente o adaptar la lógica aquí
    // Por ahora, solo retorna si no hay userData
    if (!userData?.id) return;

    const data: ResponseGetUserPatients = await fetch(
      getRouteAPI("/getUserPatients"),
      fetchOptions("POST", { userId: userData.id })
    ).then((res) => res.json());

    if (data.error) {
      console.error("Error fetching patients:", data.error);
      return;
    }
    const { patients } = data;
    log(patients, "patients");
    if (patients.length === 0) return;
    // Adaptar los datos solo con las propiedades que existen en User
    const firstPatient = patients[0];
    setSelectedPatient({
      id: firstPatient.userId || "",
      email: "", // No existe en User, valor por defecto
      name: firstPatient.name || "",
      surname: "", // No existe en User, valor por defecto
      phone: firstPatient.phone || "",
      address: "", // No existe en User, valor por defecto
      birthdate: "" // No existe en User, valor por defecto
    });
  };

  const handleDeleteMedication = async (medicationId: string) => {
    if (!userData || !userData.id) {
      alert("No hay usuario logueado. Inicia sesión antes de borrar el medicamento.");
      return;
    }
    try {
      const response = await fetch(
        getRouteAPI("/deleteUserMedication" as any),
        fetchOptions("POST", {
          medicationId: medicationId,
          userId: userData.id
        })
      ).then((res) => res.json());

      if (response.success) {
        log("Medication deleted successfully");
        // Recargar los medicamentos después de eliminar
        await loadUserMedications();
      } else {
        console.error("Error deleting medication:", response.error);
        // ...eliminado para producción
      }
    } catch (error) {
      // ...eliminado para producción
    }
  };

  useEffect(() => {
    if (userData) {
      loadPatients();
    }
    loadUserMedications();
  }, [userData?.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      log("PatientScreen focused, reloading medications...");
      loadUserMedications();
    });

    return unsubscribe;
  }, [navigation]);

  const handleGeneratePDF = () => {
    const patientName = selectedPatient?.name || (userData as UserData)?.name || t("patientName");
    const patientId = selectedPatient?.id || (userData as UserData)?.id || 'unknown';
    generateMedicationReport(medications, patientName, patientId);
  };

  // Debug logs para depuración en tiempo real
  console.log('Selected Patient:', selectedPatient);
  console.log('User Data:', userData);
  console.log('Full userData object:', JSON.stringify(userData, null, 2));

  return (
    <View style={styles.container}>
      <HeaderComponent />
      <View style={styles.contentContainer}>
        <View style={[styles.patientInfo, {
          backgroundColor: '#fff',
          borderRadius: 20,
          shadowColor: '#00a69d',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 6,
          borderWidth: 1,
          borderColor: 'rgba(0, 166, 157, 0.08)',
          alignSelf: 'center',
          marginTop: 8,
          marginBottom: 16,
          maxWidth: 600,
          width: '100%',
          padding: 24,
        }]}> 
          <Text style={[styles.patientName, {
            fontSize: 28,
            fontWeight: '800',
            color: '#00a69d',
            textAlign: 'center',
            textShadowColor: 'rgba(0, 166, 157, 0.2)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
            letterSpacing: 0.5,
          }]}> 
            {`${t("patientName")}: ${selectedPatient?.name ?? userData?.name ?? t("noNameGiven")}`}
          </Text>
          <Text style={[styles.patientDescription, {
            fontSize: 16,
            color: '#21aae1',
            marginTop: 6,
            marginBottom: 8,
            textAlign: 'center',
            lineHeight: 20,
          }]}> 
            {t("patientDescription")}
          </Text>
        </View>
        {isPhone ? (
          <View style={{ flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%', marginBottom: 18 }}>
            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: '#00a69d',
                borderRadius: 16,
                width: '90%',
                maxWidth: 400,
                height: 54,
                shadowColor: '#00a69d',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
              }]}
              onPress={() => navigation.navigate("Schedule")}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="add-circle" size={24} color="white" style={styles.buttonIcon} />
                <Text style={[styles.buttonText, { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }]}>{t("addMedication")}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: '#00a69d',
                borderRadius: 16,
                width: '90%',
                maxWidth: 400,
                height: 54,
                shadowColor: '#00a69d',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
              }]}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.buttonContent,
                  language === "en"
                    ? { alignItems: "flex-start" }
                    : null,
                ]}
              >
                <Ionicons
                  name="settings"
                  size={24}
                  color="white"
                  style={[
                    styles.buttonIcon,
                    language === "en" ? { marginTop: 8 } : null,
                  ]}
                />
                <Text style={[styles.buttonText, { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }]}>{t("configurePillDispenser")}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: '#00a69d',
                borderRadius: 16,
                width: '90%',
                maxWidth: 400,
                height: 54,
                shadowColor: '#00a69d',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
              }]}
              onPress={handleGeneratePDF}
              activeOpacity={0.8}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }]}>{t("generating")}</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="download" size={24} color="white" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }]}>{t("generateReport")}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.buttonContainer, {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 24,
            maxWidth: 800,
            alignSelf: 'center',
            width: '100%',
            marginBottom: 24,
          }]}> 
            {/* ...existing code for desktop buttons... */}
            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: '#00a69d',
                borderRadius: 16,
                width: 240,
                maxWidth: 280,
                height: 54,
                shadowColor: '#00a69d',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
              }]}
              onPress={() => navigation.navigate("Schedule")}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="add-circle" size={24} color="white" style={styles.buttonIcon} />
                <Text style={[styles.buttonText, { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }]}>{t("addMedication")}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: '#00a69d',
                borderRadius: 16,
                width: 240,
                maxWidth: 280,
                height: 54,
                shadowColor: '#00a69d',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
              }]}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.buttonContent,
                  language === "en"
                    ? { alignItems: "flex-start" }
                    : null,
                ]}
              >
                <Ionicons
                  name="settings"
                  size={24}
                  color="white"
                  style={[
                    styles.buttonIcon,
                    language === "en" ? { marginTop: 8 } : null,
                  ]}
                />
                <Text style={[styles.buttonText, { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }]}>{t("configurePillDispenser")}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: '#00a69d',
                borderRadius: 16,
                width: 240,
                maxWidth: 280,
                height: 54,
                shadowColor: '#00a69d',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
              }]}
              onPress={handleGeneratePDF}
              activeOpacity={0.8}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }]}>{t("generating")}</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="download" size={24} color="white" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }]}>{t("generateReport")}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
        <DayCarousel 
          medications={medications as any}
          loading={loading}
          onDeleteMedication={handleDeleteMedication}
        />
      </View>
    </View>
  );
};

export default PatientScreen;
