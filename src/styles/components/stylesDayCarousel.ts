import { StyleSheet, Dimensions, Platform } from 'react-native';

export const stylesDayCarousel = () => {
  const { width } = Dimensions.get('window');
  // Consider "mobile" for both native and web if width <= 600
  const isWebSmall = Platform.OS === "web" && width <= 600;
  const isMobile = Platform.OS !== "web" && width <= 600;
  const isSmallScreen = isMobile || isWebSmall;
  // Reduce card width for small screens (mobile or web emulation)
  const CARD_WIDTH = isSmallScreen
    ? Math.max(Math.min(width * 0.55, 320), 110)
    : Math.max(Math.min(width * 0.32, 260), 120);
  const CARD_HEIGHT = isSmallScreen ? CARD_WIDTH * 1.15 : CARD_WIDTH * 0.85;

  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 0,
    },
    cardsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      marginHorizontal: 8,
      padding: 14,
      backgroundColor: '#fff',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignItems: 'center',
      justifyContent: isSmallScreen ? 'center' : 'flex-start',
      // @ts-ignore
      transitionProperty: 'box-shadow, transform',
      // @ts-ignore
      transitionDuration: '200ms',
      // @ts-ignore
      transitionTimingFunction: 'ease-in-out',
    },
    cardHover: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 8,
      // @ts-ignore
      transform: [{ scale: 1.04 }],
      zIndex: 2,
    },
    dayTitle: {
      fontSize: Math.max(Math.min(width * 0.045, 22), 14),
      fontWeight: '600',
      marginBottom: 12,
      color: '#333',
      textAlign: 'center',
    },
    medicationText: {
      fontSize: Math.max(Math.min(width * 0.04, 17), 12),
      color: '#555',
      textAlign: 'center',
    },
    emptyMedication: {
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    arrowButton: {
      padding: 12,
    },
  });
};
