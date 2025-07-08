import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Header from "@components/common/Header";
import { useLanguage } from "@context/LanguageContext";
import { stylesPatientScreen } from "@styles/screens/stylesPatientScreen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation/navigationTypes";
import { useResponsiveLayout } from "@context/LayoutContext";
import { useUserContext } from "@context/UserContext";
import { 
  MedicationUser, 
  ResponseGetUserMedications, 
  TypeBodyGetUserMedications 
} from "@types";
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

  useEffect(() => {
    loadUserMedications();
  }, [userData?.userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      log("PatientScreen focused, reloading medications...");
      loadUserMedications();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{translations.patientName}</Text>
        <Text style={styles.patientDescription}>
          {translations.patientDescription}
        </Text>
      </View>
      
      <View 
        style={{ 
          flexDirection: isPhone ? "column" : "row", 
          gap: 10, 
          alignItems: isPhone ? "center" : "flex-start", 
          paddingHorizontal: 16 
        }}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Schedule")}
        >
          <Text style={styles.buttonText}>{translations.addMedication}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => {}}
        >
          <Text style={styles.buttonText}>{translations.configurePillDispenser || "Configure Pill Dispenser"}</Text>
        </TouchableOpacity>
      </View>

      <DayCarousel medications={medications} loading={loading} />
    </View>
  );
};

export default PatientScreen;
