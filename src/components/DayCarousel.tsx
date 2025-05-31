/**
 * DayCarousel displays a horizontal carousel of days.
 * Each card shows a day's medications. Users can navigate
 * with arrows and open a modal with the full medication list
 * by clicking a card.
 *
 * Features:
 * - Responsive: shows 1 card on mobile, 3 on desktop.
 * - Uses modal context for displaying medication details.
 * - Cards have hover effect on web.
 *
 * @component
 * @returns {JSX.Element}
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useModal } from '@/context/ModalContext';
import { stylesDayCarousel } from '@styles/components/stylesDayCarousel';
import { useLanguage } from "@/context/LanguageContext";

const DayCarousel = () => {
  const styles = stylesDayCarousel();
  const { translations } = useLanguage();
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { openModal, closeModal , setCustomStyles} = useModal();

  const width = Dimensions.get('window').width;
  const isWebSmall = Platform.OS === "web" && width <= 600;
  const isMobile = Platform.OS !== "web" && width <= 600;
  const isSmallScreen = isMobile || isWebSmall;
  const cardsToShow = isSmallScreen ? 1 : 3;

  useEffect(() => {
    setCustomStyles({
      modal: {
        ...(isSmallScreen
          ? {}
          : {
              width: 400,
              maxWidth: 400,
              minHeight: 250,
            }),
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingVertical: 36,
        paddingHorizontal: 32,
        alignItems: 'center',
        elevation: 16,
        shadowColor: '#00a69d',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        borderWidth: 2,
        borderColor: '#00a69d',
      },
      title: {
        color: '#00a69d',
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: 18,
        letterSpacing: 0.5,
        textShadowColor: '#b2f7ef',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
      body: {
        alignItems: 'center',
        marginBottom: 18,
      },
      buttons: {
        justifyContent: 'center',
        width: '100%',
        marginTop: 12,
      },
      overlay: {},
    });
  }, [isSmallScreen]);

  const days = [
    { name: translations.monday, medications: ['Med1', 'Med2', 'Med3', 'Med4', 'Med5'] },
    { name: translations.tuesday, medications: ['MedA', 'MedB'] },
    { name: translations.wednesday, medications: ['MedX', 'MedY', 'MedZ'] },
    { name: translations.thursday, medications: [] },
    { name: translations.friday, medications: ['MedQ', 'MedW', 'MedE', 'MedR'] },
    { name: translations.saturday, medications: ['MedS'] },
    { name: translations.sunday, medications: ['MedT', 'MedU', 'MedV', 'MedW', 'MedX', 'MedY'] }
  ];

  /**
   * Move carousel to next set of days.
   */
  const handleNext = () => {
    if (startIndex < days.length - cardsToShow) {
      setStartIndex(startIndex + 1);
    }
  };

  /**
   * Move carousel to previous set of days.
   */
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  /**
   * Open modal with medication details for the selected day.
   * @param day The selected day object
   */
  const handleCardPress = (day: { name: string; medications: string[] }) => {
    openModal(
      day.name,
      <View>
        {day.medications && day.medications.length > 0 ? (
          day.medications.map((med, idx) => (
            <Text key={idx} style={styles.medicationText}>{med}</Text>
          ))
        ) : (
          <Text style={styles.medicationText}>{translations.noMedications}</Text>
        )}
      </View>,
      <TouchableOpacity onPress={closeModal}>
        <Text style={{
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 16,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: '#00a69d',
          borderRadius: 8,
          textAlign: 'center'
        }}>
          {translations.close}
        </Text>
      </TouchableOpacity>,
    );
  };

  const visibleDays = days.slice(startIndex, startIndex + cardsToShow);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePrev} 
        style={styles.arrowButton}
        disabled={startIndex === 0}
      >
        <Ionicons 
          name="chevron-back" 
          size={28} 
          color={startIndex === 0 ? '#ccc' : '#00a69d'} 
        />
      </TouchableOpacity>
      <View style={styles.cardsRow}>
        {visibleDays.map((day, index) => (
          // @ts-ignore
          <TouchableOpacity
            key={day.name}
            style={[
              styles.card,
              hoveredIndex === index && styles.cardHover
            ]}
            onPress={() => handleCardPress(day)}
            activeOpacity={0.8}
            // @ts-ignore
            onMouseEnter={() => setHoveredIndex(index)}
            // @ts-ignore
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Text style={styles.dayTitle}>{day.name}</Text>
            {day.medications.length > 0 ? (
              <>
                {day.medications.slice(0, 3).map((med, idx) => (
                  <Text key={idx} style={styles.medicationText}>{med}</Text>
                ))}
                {day.medications.length > 3 && (
                  <Text style={{ color: '#00a69d', marginTop: 5, textAlign: 'center' }}>
                    +{day.medications.length - 3} {translations.more}
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.emptyMedication}>
                <Text style={styles.medicationText}>{translations.noMedications}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity 
        onPress={handleNext} 
        style={styles.arrowButton}
        disabled={startIndex >= days.length - cardsToShow}
      >
        <Ionicons 
          name="chevron-forward" 
          size={28} 
          color={startIndex >= days.length - cardsToShow ? '#ccc' : '#00a69d'} 
        />
      </TouchableOpacity>
    </View>
  );
};

export default DayCarousel;
