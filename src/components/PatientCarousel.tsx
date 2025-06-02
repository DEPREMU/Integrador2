import React from 'react';
import { View, FlatList, Image, Text, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PatientCard from '@components/PatientCard';
import ButtonComponent from '@components/Button';
import { RootStackParamList } from '@navigation/navigationTypes';
import { ADD_ICON } from '@/utils';

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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

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
    AddPatient: string;
    AddPatientForm: string;
    CloseModal: string;
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
export default function PatientCarousel({
  data,
  styles,
  translations,
  openModal,
  closeModal,
}: PatientCarouselProps) {
  const navigation = useNavigation<NavProp>();

  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) =>
        item.id === 'add' ? (
          <View style={styles.addCard}>
            <ButtonComponent
              touchableOpacity
              handlePress={() =>
                openModal(
                  translations.AddPatient,
                  <Text>{translations.AddPatientForm}</Text>,
                  <ButtonComponent
                    label={translations.CloseModal}
                    handlePress={closeModal}
                    customStyles={{
                      button:styles.closeButton,
                      textButton: styles.closeText
                    }}
                  />
                )
              }
              customStyles={{ button: styles.addButton, textButton: {} }}
            >
              <Image
                source={ADD_ICON}
                style={{ width: 32, height: 32, tintColor: '#fff' }}
              />
            </ButtonComponent>
          </View>
        ) : (
          <PatientCard
            name={item.name}
            photoUrl={item.photo}
            pills={item.pills}
            onPress={() => navigation.replace('Login')}
            style={{ marginRight: 15 }}
          />
        )
      }
    />
  );
}
