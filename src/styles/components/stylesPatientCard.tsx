import { useResponsiveLayout } from '@/context/LayoutContext';
import { StyleSheet } from 'react-native';

/**
 * Custom hook that returns responsive styles for the PatientCard component.
 * It adjusts card dimensions and margins based on whether the device is a phone, tablet or web.
 *
 * @returns {{ card: object; photoPlaceholder: object; photo: object; name: object; pillList: object; pill: object; pillText: object }}
 *   An object containing StyleSheet styles for PatientCard elements.
 *
 * @example
 * const styles = useStylesPatientCard();
 * <View style={styles.card}>...</View>
 */
export const useStylesPatientCard = () => {
  const { isPhone } = useResponsiveLayout();
  const cardWidth = isPhone ? 250 : 300;
  const cardHeight = isPhone ? 450 : 300;

  return StyleSheet.create({
    card: {
      width: cardWidth,
      height: cardHeight,
      backgroundColor: 'rgba(162, 221, 231, 0.8)',
      borderRadius: 12,
      padding: 20,
      marginRight: isPhone ? 20 : 35,
      justifyContent: 'space-around',
      alignItems: 'center',
      boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
      elevation: 3,
    },
    photoPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#ecebea',
      overflow: 'hidden',
      marginBottom: 12,
    },
    photo: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8,
    },
    pillList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginVertical: 8,
    },
    pill: {
      backgroundColor: '#f0f0f0',
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 4,
      margin: 4,
    },
    pillText: {
      fontSize: 12,
      color: '#333',
    },
  });
};