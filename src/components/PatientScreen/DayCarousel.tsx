import { Ionicons } from "@expo/vector-icons";
import { useModal } from "@context/ModalContext";
import ButtonComponent from "@components/common/Button";
import { useLanguage } from "@context/LanguageContext";
import { stylesDayCarousel } from "@styles/components/stylesDayCarousel";
import { View, Text, Pressable } from "react-native";
import React, { useEffect, useState } from "react";

type Day = { name: string; medications: string[] };

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

const DayCarousel: React.FC = () => {
  const { translations } = useLanguage();
  const { styles, customStyles, isPhone } = stylesDayCarousel();
  const { openModal, closeModal, setCustomStyles } = useModal();
  const cardsToShow = isPhone ? 1 : 3;

  const [startIndex, setStartIndex] = useState<number>(0);
  const [days, setDays] = useState<Day[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchedDays: Day[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ].map((day) => {
      return {
        name: translations[day as keyof typeof translations] || day,
        medications: Array.from(
          { length: Math.floor(Math.random() * 10) },
          (_, index) => `Med${index + 1}`
        ),
      };
    });

    setDays(fetchedDays);
  }, []);

  useEffect(() => setCustomStyles(customStyles), [customStyles]);

  /**
   * Open modal with medication details for the selected day.
   * @param day The selected day object
   */
  const handleCardPress = (day: Day) => {
    openModal(
      day.name,
      <View>
        {day?.medications?.length > 0 ? (
          day.medications.map((med, index) => (
            <Text key={index} style={styles.medicationText}>
              {med}
            </Text>
          ))
        ) : (
          <Text style={styles.medicationText}>
            {translations.noMedications}
          </Text>
        )}
      </View>,
      <Pressable onPress={closeModal}>
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: "#00a69d",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          {translations.close}
        </Text>
      </Pressable>
    );
  };

  const handleNext = () => {
    if (startIndex >= days.length - cardsToShow) return;
    setStartIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (startIndex <= 0) return;
    setStartIndex((prev) => prev - 1);
  };

  const visibleDays = days.slice(startIndex, startIndex + cardsToShow);

  return (
    <View style={styles.container}>
      <ButtonComponent
        label={translations.addMedication}
        handlePress={handlePrev}
        disabled={startIndex === 0}
        customStyles={{
          button: styles.arrowButton,
          textButton: {},
        }}
        children={
          <Ionicons
            name="add"
            size={24}
            color={startIndex === 0 ? "#ccc" : "#00a69d"}
          />
        }
      />
      <View style={styles.cardsRow}>
        {visibleDays.map((day, index) => (
          <ButtonComponent
            key={day.name}
            label={day.name}
            touchableOpacityIntensity={0.8}
            handlePress={() => handleCardPress(day)}
            handlerHoverIn={() => setHoveredIndex(index)}
            handlerHoverOut={() => setHoveredIndex(null)}
            customStyles={{
              button: [styles.card, hoveredIndex === index && styles.cardHover],
              textButton: styles.dayTitle,
            }}
            children={
              <>
                {day.medications.length > 0 && (
                  <>
                    {day.medications.slice(0, 3).map((med, idx) => (
                      <Text key={idx} style={styles.medicationText}>
                        {med}
                      </Text>
                    ))}
                    {day.medications.length > 3 && (
                      <Text style={styles.moreMedicationsText}>
                        +{day.medications.length - 3} {translations.more}
                      </Text>
                    )}
                  </>
                )}
                {day.medications.length <= 0 && (
                  <View style={styles.emptyMedication}>
                    <Text style={styles.medicationText}>
                      {translations.noMedications}
                    </Text>
                  </View>
                )}
              </>
            }
          />
        ))}
      </View>
      <ButtonComponent
        label={translations.addMedication}
        handlePress={handleNext}
        disabled={startIndex >= days.length - cardsToShow}
        customStyles={{
          button: styles.arrowButton,
          textButton: {},
        }}
        children={
          <Ionicons
            name="add"
            size={24}
            color={startIndex >= days.length - cardsToShow ? "#ccc" : "#00a69d"}
          />
        }
      />
    </View>
  );
};

export default DayCarousel;
