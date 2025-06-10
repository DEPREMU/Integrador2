import React from "react";
import PatientCard from "@components/Dashboard/PatientCard";
import { ADD_ICON } from "@utils";
import ButtonComponent from "@components/common/Button";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@navigation/navigationTypes";
import { View, FlatList, Image } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

/**
 * Patient type definition.
 * @typedef {Object} Patient
 * @property {string} id - Unique identifier for the patient.
 * @property {string} name - Patient's name.
 * @property {string} photo - URL of the patient's photo.
 * @property {string[]} pills - List of pills/tags associated with the patient.
 */
export type Patient = {
  id: string;
  name: string;
  photo: string;
  pills: string[];
};

type NavProp = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

/**
 * Props for the PatientCarousel component.
 * @typedef {Object} PatientCarouselProps
 * @property {Patient[]} data - Array of patient objects, including a special 'add' item.
 * @property {any} styles - Styles object for customizing the carousel and its elements.
 * @property {Object} translations - Object containing translation strings.
 * @property {string} translations.AddPatient - Label for the add patient button/modal.
 * @property {string} translations.AddPatientForm - Content for the add patient modal.
 * @property {string} translations.CloseModal - Label for the close modal button.
 * @property {(title: string, body: React.ReactNode, buttons: React.ReactNode) => void} openModal - Function to open the modal.
 * @property {() => void} closeModal - Function to close the modal.
 */
interface PatientCarouselProps {
  data: Patient[];
  styles: any;
  translations: {
    addPatient: string;
    addPatientForm: string;
    close: string;
  };
  openModal: (
    title: string,
    body: React.ReactNode,
    buttons: React.ReactNode
  ) => void;
  closeModal: () => void;
}

/**
 * PatientCarousel component displays a horizontal list of PatientCards and an add-patient button.
 * When the add button is pressed, it opens a modal for adding a new patient.
 *
 * @component
 * @param {PatientCarouselProps} props - Props for the PatientCarousel.
 * @returns {JSX.Element} The rendered patient carousel.
 *
 * @example
 * <PatientCarousel
 *   data={patients}
 *   styles={styles}
 *   translations={{
 *     AddPatient: "Add Patient",
 *     AddPatientForm: "Form goes here",
 *     CloseModal: "Close"
 *   }}
 *   openModal={openModal}
 *   closeModal={closeModal}
 * />
 */
const PatientCarousel: React.FC<PatientCarouselProps> = ({
  data,
  styles,
  openModal,
  closeModal,
  translations,
}) => {
  const navigation = useNavigation<NavProp>();

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
                handlePress={() =>
                  openModal(
                    translations.addPatient,
                    translations.addPatientForm,
                    <ButtonComponent
                      label={translations.close}
                      handlePress={closeModal}
                      customStyles={{
                        button: styles.closeButton,
                        textButton: styles.closeText,
                      }}
                    />
                  )
                }
                customStyles={{ button: styles.addButton, textButton: {} }}
                children={
                  <Image
                    source={ADD_ICON}
                    style={{ width: 32, height: 32, tintColor: "#fff" }}
                  />
                }
              />
            </View>
          );

        return (
          <PatientCard
            name={item.name}
            photoUrl={item.photo}
            pills={item.pills}
            onPress={() => navigation.replace("Login")}
            style={{ marginRight: 15 }}
          />
        );
      }}
    />
  );
};

export default PatientCarousel;
