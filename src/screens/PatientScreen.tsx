import React from "react";
import Button from "@components/common/Button";
import DayCarousel from "@components/PatientScreen/DayCarousel";
import { Text, View } from "react-native";
import HeaderComponent from "@components/common/Header";
import { useLanguage } from "@context/LanguageContext";
import { stylesPatientScreen } from "@styles/screens/stylesPatientScreen";

/**
 * PatientScreen displays the header, patient information,
 * an "Add medication" button, the menu, and the DayCarousel component.
 * The button is styled responsively and placed above the carousel.
 *
 * @component
 * @returns {JSX.Element}
 */
const PatientScreen: React.FC = () => {
  const styles = stylesPatientScreen();
  const { translations } = useLanguage();

  return (
    <View style={styles.container}>
      <HeaderComponent />
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{translations.patientName}</Text>
        <Text style={styles.patientDescription}>
          {translations.patientDescription}
        </Text>
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
