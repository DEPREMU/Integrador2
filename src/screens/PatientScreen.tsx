/**
 * PatientScreen displays the patient header, patient information,
 * an "Add medication" button, and the DayCarousel component.
 * The button is styled responsively and placed above the carousel.
 *
 * @component
 * @returns {JSX.Element}
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import HeaderComponent from '../components/HeaderComponent';
import PatientHeader from '../components/PatientHeader';
import Button from '../components/Button';
import DayCarousel from '../components/DayCarousel';
import { stylesPatientScreen } from '../styles/screens/stylesPatientScreen';  
import { useLanguage } from "@/context/LanguageContext";

const PatientScreen = () => {
  const styles = stylesPatientScreen();
  const { translations } = useLanguage();

  return (
    <View style={styles.container}>
      <HeaderComponent />
      <PatientHeader />
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{translations.patientName}</Text>
        <Text style={styles.patientDescription}>{translations.patientDescription}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          label={translations.addMedication}
          handlePress={() => {}}
          replaceStyles={{
            button: styles.button,
            textButton: styles.buttonText,
          }}
          touchableOpacity
        />
      </View>
      <DayCarousel />
    </View>
  );
};

export default PatientScreen;

