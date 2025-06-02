import { useResponsiveLayout } from '@/context/LayoutContext';
import { StyleSheet } from 'react-native';

export const useStylesPatientCard = () => {
  const { width, height } = useResponsiveLayout();
  const cardWidth = width * 0.6;
  const cardHeight = height * 0.4;

  return StyleSheet.create({
    card: {
      width: cardWidth,
      height: cardHeight,
      backgroundColor: 'rgba(162, 221, 231, 0.8)',
      borderRadius: 12,
      padding: 12,
      marginRight: 15,
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
      elevation: 3,
    },
    photoPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
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