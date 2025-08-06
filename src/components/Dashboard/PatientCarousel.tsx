// /src/components/Dashboard/PatientCarousel.tsx
import React from "react";
import PatientCard from "@components/Dashboard/PatientCard";
import { ADD_ICON } from "@utils";
import ButtonComponent from "@components/common/Button";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@navigation/navigationTypes";
import { View, FlatList, Image, ActivityIndicator } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

/**
 * Patient type definition for the carousel component.
 * @typedef {Object} Patient
 * @property {string} id - Unique identifier for the patient
 * @property {string} name - Patient's name
 * @property {string} photo - URL of the patient's photo
 * @property {string[]} pills - List of pills/tags associated with the patient
 * @property {string} description - Patient's description or medical notes
 */
export type Patient = {
  id: string;
  name: string;
  photo: string;
  pills: string[];
  description: string;
};

/**
 * Type definition for navigation prop used in the carousel.
 * @typedef {Object} NavProp
 */
type NavProp = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

/**
 * Available style keys for the PatientCarousel component.
 * @typedef {string} stylesPatientCarousel
 */
export type stylesPatientCarousel =
  | "listContent"
  | "addCard"
  | "addButton"
  | "image"
  | "closeButton"
  | "closeText"
  | "marginRight";

/**
 * Props interface for the PatientCarousel component.
 * @interface PatientCarouselProps
 * @property {Patient[]} data - Array of patient objects, including a special 'add' item
 * @property {Record<stylesPatientCarousel, object>} styles - Styles object for customizing the carousel and its elements
 * @property {Object} translations - Object containing translation strings
 * @property {string} translations.addPatient - Label for the add patient button/modal
 * @property {string} translations.addPatientForm - Content for the add patient modal
 * @property {string} translations.close - Label for the close modal button
 * @property {() => void} openModal - Function to open the modal
 * @property {() => void} closeModal - Function to close the modal
 * @property {(patientId: string) => void} [onDeletePatient] - Optional callback for deleting a patient
 * @property {(patientId: string) => void} [onEditPatient] - Optional callback for editing a patient
 * @property {boolean} [loading] - Optional loading state flag
 */
interface PatientCarouselProps {
  data: Patient[];
  styles: Record<stylesPatientCarousel, object>;
  translations: {
    addPatient: string;
    addPatientForm: string;
    close: string;
  };
  openModal: () => void;
  closeModal: () => void;
  onDeletePatient?: (patientId: string) => void;
  onEditPatient?: (patientId: string) => void;
  loading?: boolean;
}

/**
 * PatientCarousel component displays a horizontal list of PatientCards and an add-patient button.
 * When the add button is pressed, it opens a modal for adding a new patient.
 *
 * Features:
 * - Horizontal scrollable list of patient cards
 * - Add new patient button with icon
 * - Loading state with spinner
 * - Navigation to patient details screen
 * - Edit and delete patient functionality
 * - Responsive design with custom styling
 *
 * @component
 * @param {PatientCarouselProps} props - Props for the PatientCarousel
 * @param {Patient[]} props.data - Array of patient objects to display
 * @param {Record<stylesPatientCarousel, object>} props.styles - Styles object for customization
 * @param {Object} props.translations - Translation strings for UI text
 * @param {() => void} props.openModal - Function to open the add patient modal
 * @param {() => void} props.closeModal - Function to close the modal
 * @param {(patientId: string) => void} [props.onDeletePatient] - Optional delete callback
 * @param {(patientId: string) => void} [props.onEditPatient] - Optional edit callback
 * @param {boolean} [props.loading] - Loading state flag
 * @returns {JSX.Element} The rendered patient carousel
 *
 * @example
 * <PatientCarousel
 *   data={patients}
 *   styles={styles}
 *   translations={{
 *     addPatient: "Add Patient",
 *     addPatientForm: "Form goes here",
 *     close: "Close"
 *   }}
 *   openModal={openModal}
 *   closeModal={closeModal}
 *   onDeletePatient={handleDelete}
 *   onEditPatient={handleEdit}
 *   loading={false}
 * />
 */
const PatientCarousel: React.FC<PatientCarouselProps> = ({
  data,
  styles,
  openModal,
  closeModal,
  translations,
  onDeletePatient,
  onEditPatient,
  loading = false,
}) => {
  const navigation = useNavigation<NavProp>();

  if (loading) {
    return (
      <View style={[styles.listContent, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00a69d" />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        if (item.id === "add")
          return (
            <View style={styles.addCard}>
              <ButtonComponent
                touchableOpacity
                handlePress={openModal}
                customStyles={{ button: styles.addButton, textButton: {} }}
                children={<Image source={ADD_ICON} style={styles.image} />}
              />
            </View>
          );

        return (
          <PatientCard
            name={item.name}
            photoUrl={item.photo}
            pills={item.pills}
            description={item.description}
            onPress={() => navigation.navigate("Patient", { patientId: item.id })}
            onDelete={onDeletePatient ? () => onDeletePatient(item.id) : undefined}
            onEdit={onEditPatient ? () => onEditPatient(item.id) : undefined}
            style={{ marginRight: 15 }}
          />
        );
      }}
    />
  );
};

export default PatientCarousel;
