/**
 * Returns responsive styles for the PatientScreen component.
 * Adjusts layout and button width for mobile and small web screens.
 *
 * @returns {object} StyleSheet object for PatientScreen
 */
import { StyleSheet, Dimensions, Platform } from 'react-native';

export const stylesPatientScreen = () => {
  const { width } = Dimensions.get('window');
  const isWebSmall = Platform.OS === "web" && width <= 600;
  const isMobile = Platform.OS !== "web" && width <= 600;
  const cardWidth = (isMobile || isWebSmall) ? width * 0.45 : 150;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ecebea',
    },
    patientInfo: {
      padding: 16,
      paddingTop: 8,
    },
    patientName: {
      fontSize: 18,
      fontWeight: '600',
    },
    patientDescription: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    buttonContainer: {
      paddingHorizontal: 0,
      marginBottom: (isMobile || isWebSmall) ? 0 : 10,
      alignItems: 'center',
    },
    button: {
      paddingVertical: (isMobile || isWebSmall) ? 10 : 14,
      backgroundColor: '#00a69d',
      borderRadius: 6,
      maxWidth: (isMobile || isWebSmall) ? undefined : 220,
      width: (isMobile || isWebSmall) ? cardWidth : 180,
      alignSelf: 'center',
      marginBottom: (isMobile || isWebSmall) ? 0 : 8,
    },
    buttonText: {
      fontSize: 14,
      color: 'white',
      textAlign: 'center',
    },
  });
};