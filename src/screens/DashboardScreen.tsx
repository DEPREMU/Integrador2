import React from "react";
import { useModal } from "@context/ModalContext";
import { View, Text } from "react-native";
import HeaderComponent from "@components/common/Header";
import { useLanguage } from "@context/LanguageContext";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "@context/UserContext";
import stylesDashboardScreen from "@styles/screens/stylesDashboardScreen";
import { interpolateMessage } from "@utils";
import { RootStackParamList } from "@navigation/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PatientCarousel, { Patient } from "@components/Dashboard/PatientCarousel";

type DashboardNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

/**
 * DashboardScreen component displays the main dashboard UI, including:
 * - A header
 * - A greeting message (localized)
 * - A placeholder for the user image
 * - A horizontal carousel of patient cards and an add-patient button
 *
 * It uses context for language translations and modal management.
 *
 * @component
 * @returns {JSX.Element} The rendered dashboard screen.
 *
 * @example
 * <DashboardScreen />
 */
const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavProp>();
  const { translations } = useLanguage();
  const { openModal, closeModal } = useModal();
  const { stylesDashboardScreen: styles } = stylesDashboardScreen();
  const { userData } = useUserContext();

  return (
    <View style={styles.container}>
      <HeaderComponent />
      <Text style={styles.greeting}>
        {interpolateMessage(translations.greeting, [
          userData?.name || translations.dearUser,
        ])}
      </Text>
      <View style={styles.userImagePlaceholder} />
      <PatientCarousel
        data={data}
        styles={styles}
        translations={{
          addPatient: translations.addPatient,
          addPatientForm: translations.addPatientForm,
          close: translations.close,
        }}
        openModal={openModal}
        closeModal={closeModal}
      />
    </View>
  );
};

export default DashboardScreen;

const data: Patient[] = [
  {
    id: "1",
    name: "Juan Pérez",
    photo: "https://via.placeholder.com/80",
    pills: ["A", "B", "C"],
  },
  {
    id: "2",
    name: "María López",
    photo: "https://via.placeholder.com/80",
    pills: ["D", "E", "F"],
  },
  {
    id: "add",
    name: "Add Patient",
    photo: "",
    pills: [],
  },
];
