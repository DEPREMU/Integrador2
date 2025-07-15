import { Ionicons } from "@expo/vector-icons";
import { useModal } from "@context/ModalContext";
import Button from "@components/common/Button";
import { useLanguage } from "@context/LanguageContext";
import { useStylesDayCarousel } from "@styles/components/stylesDayCarousel";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { MedicationUser } from "@types";
import { log } from "@/utils";
import { capitalize } from "@/utils/functions/appManagement";

type Day = { name: string; medications: MedicationUser[] };

interface DayCarouselProps {
  medications: MedicationUser[];
  loading: boolean;
  onDeleteMedication?: (medicationId: string) => void;
}

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

const DayCarousel: React.FC<DayCarouselProps> = ({ medications, loading, onDeleteMedication }) => {
  const { translations } = useLanguage();
  const { styles, customStyles, isPhone, isWeb } = useStylesDayCarousel();
  const { openModal, closeModal, setCustomStyles } = useModal();
  const cardsToShow = isPhone ? 1 : 3;

  const [startIndex, setStartIndex] = useState<number>(0);
  const [days, setDays] = useState<Day[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 % 12 || 12;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const translateDosageType = (dosageType: string): string => {
    const dosageMap: { [key: string]: number } = {
      'pills': 0,
      'pastillas': 0,
      'mg': 1,
      'units': 2,
      'unidades': 2
    };
    
    const dosageTypes = typeof translations.dosageTypes === 'string' 
      ? JSON.parse(translations.dosageTypes) 
      : translations.dosageTypes;
    
    const index = dosageMap[dosageType.toLowerCase()];
    return index !== undefined ? dosageTypes[index] || dosageType : dosageType;
  };

  const translateUrgency = (urgencyLevel: string): string => {
    if (!urgencyLevel) return urgencyLevel;
    
    const normalizedUrgency = urgencyLevel.toLowerCase().trim();
    
    // Parse the urgency translations if they're a JSON string
    const urgencyTranslations = typeof translations.urgency === 'string' 
      ? JSON.parse(translations.urgency) 
      : translations.urgency;
    
    // Map different possible values to the translation keys
    const urgencyMap: { [key: string]: string } = {
      'high': urgencyTranslations.high || 'High',
      'alta': urgencyTranslations.high || 'High',
      'alto': urgencyTranslations.high || 'High',
      'medium': urgencyTranslations.medium || 'Medium',
      'media': urgencyTranslations.medium || 'Medium',
      'medio': urgencyTranslations.medium || 'Medium',
      'low': urgencyTranslations.low || 'Low',
      'baja': urgencyTranslations.low || 'Low',
      'bajo': urgencyTranslations.low || 'Low'
    };
    
    return urgencyMap[normalizedUrgency] || urgencyLevel;
  };

  const getUrgencyColor = (urgency: string): string => {
    if (!urgency) return '#333333';
    
    const normalizedUrgency = urgency.toLowerCase().trim();
    console.log('🔍 Urgency value:', urgency, '-> normalized:', normalizedUrgency);
    
    switch (normalizedUrgency) {
      case 'high':
      case 'alta':
      case 'alto':
        return '#FF0000';
      case 'medium':
      case 'media':
      case 'medio':
        return '#FF8C00';
      case 'low':
      case 'baja':
      case 'bajo':
        return '#008000';
      default:
        console.log('⚠️ Unknown urgency value:', urgency);
        return '#333333';
    }
  };

  const handleDeleteMedication = (medicationId: string, medicationName: string) => {
    console.log('🗑️ handleDeleteMedication called with:', { medicationId, medicationName });
    
    if (onDeleteMedication) {
      console.log('✅ onDeleteMedication callback exists');
      
      // Cerrar el modal actual primero
      closeModal();
      console.log('📝 Modal closed, opening confirmation modal...');
      
      // Abrir el modal de confirmación después de un pequeño delay
      setTimeout(() => {
        console.log('⏰ Opening confirmation modal now');
        openModal(
          translations.deleteMedication || 'Delete Medication',
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Ionicons name="warning-outline" size={48} color="#FF8C00" style={{ marginBottom: 16 }} />
            <Text style={{ 
              fontSize: 16, 
              textAlign: 'center', 
              marginBottom: 8,
              color: '#333'
            }}>
              ¿Estás seguro de que quieres eliminar:
            </Text>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold',
              textAlign: 'center', 
              marginBottom: 20,
              color: '#d32f2f'
            }}>
              "{capitalize(medicationName)}"?
            </Text>
          </View>,
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable 
              onPress={() => {
                console.log('❌ User cancelled deletion');
                closeModal();
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 20,
                backgroundColor: '#e0e0e0',
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#666', fontWeight: 'bold', fontSize: 16 }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable 
              onPress={() => {
                console.log('✅ User confirmed deletion');
                onDeleteMedication(medicationId);
                closeModal();
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 20,
                backgroundColor: '#d32f2f',
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                Eliminar
              </Text>
            </Pressable>
          </View>
        );
      }, 100);
    } else {
      console.log('❌ No onDeleteMedication callback provided');
    }
  };

  useEffect(() => {
    if (loading) return;
    
    const dayNames = [
      "monday",
      "tuesday", 
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    const organizedDays: Day[] = dayNames.map((dayKey) => {
      const dayName = typeof translations[dayKey as keyof typeof translations] === 'string' 
        ? translations[dayKey as keyof typeof translations] as string 
        : dayKey;
      
      const dayMedications = medications.filter(medication => 
        medication.days && medication.days.includes(dayKey)
      );

      return {
        name: dayName,
        medications: dayMedications,
      };
    });log("Organized days:", organizedDays);

    setDays(organizedDays);
  }, [medications, loading, translations]);

  useEffect(() => setCustomStyles(customStyles), [customStyles]);

  const handleCardPress = (day: Day) => {
    const hasmedications = day?.medications?.length > 0;
    
    openModal(
      `${translations.medicationText || 'Medications'} - ${day.name}`,
      hasmedications ? (
        <ScrollView 
          style={{ maxHeight: 400 }} 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {day.medications.map((med, index) => (
            <View key={index} style={styles.modalMedicationCard}>
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}>
                <Text style={[styles.modalMedicationName, { flex: 1, textAlign: "left" }]}>
                  {capitalize(med.name)}
                </Text>
                {onDeleteMedication && med._id && (
                  <Pressable
                    onPress={() => handleDeleteMedication(med._id!, med.name)}
                    style={({ pressed }) => [
                      {
                        padding: 8,
                        borderRadius: 20,
                        backgroundColor: pressed ? "#e0e0e0" : "#f5f5f5",
                        marginLeft: 12,
                        ...(isWeb && {
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }),
                      }
                    ]}
                  >
                    {({ pressed }) => (
                      <Ionicons 
                        name="trash-outline" 
                        size={18} 
                        color={pressed ? "#d32f2f" : "#666666"} 
                      />
                    )}
                  </Pressable>
                )}
              </View>
              
              <View style={styles.modalDetailRow}>
                <Ionicons name="time-outline" size={16} color="#00a69d" />
                <Text style={styles.modalDetailLabel}>{translations.hour || 'Time'}:</Text>
                <Text style={styles.modalDetailValue}>
                  {formatTime(med.startHour)}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Ionicons name="medical-outline" size={16} color="#00a69d" />
                <Text style={styles.modalDetailLabel}>{translations.dosage || 'Dosage'}:</Text>
                <Text style={styles.modalDetailValue}>
                  {translateDosageType(med.dosage)} {med.grams > 0 ? `(${med.grams}g)` : ''}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Ionicons name="refresh-outline" size={16} color="#00a69d" />
                <Text style={styles.modalDetailLabel}>{translations.intervalHours || 'Interval'}:</Text>
                <Text style={styles.modalDetailValue}>
                  {med.intervalHours} {med.intervalHours === 1 ? translations.hour : translations.hours}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Ionicons name="cube-outline" size={16} color="#00a69d" />
                <Text style={styles.modalDetailLabel}>{translations.stock || 'Stock'}:</Text>
                <Text style={styles.modalDetailValue}>
                  {med.stock}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Ionicons name="calculator-outline" size={16} color="#00a69d" />
                <Text style={styles.modalDetailLabel}>{translations.requiredDoses || 'Required Doses'}:</Text>
                <Text style={styles.modalDetailValue}>
                  {med.requiredDoses || 0}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Ionicons 
                  name={med.urgency === 'high' ? 'alert-circle-outline' : 
                       med.urgency === 'medium' ? 'warning-outline' : 'checkmark-circle-outline'} 
                  size={16} 
                  color="#00a69d"
                />
                <Text style={styles.modalDetailLabel}>{translations.urgencyText || 'Urgency'}:</Text>
                <Text style={[
                  styles.modalDetailValue,
                  { 
                    color: getUrgencyColor(med.urgency),
                    fontWeight: 'bold'
                  }
                ]}>
                  {translateUrgency(med.urgency)} {/* DEBUG: "{med.urgency}" */}
                </Text>
              </View>

              {index < day.medications.length - 1 && (
                <View style={styles.modalSeparator} />
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyMedication}>
          <Ionicons name="medical-outline" size={48} color="#ccc" />
          <Text style={styles.modalEmptyText}>
            {translations.noMedications}
          </Text>
        </View>
      ),
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
      <Button
        handlePress={handlePrev}
        disabled={startIndex === 0}
        customStyles={{
          button: styles.arrowButton,
          textButton: {},
        }}
        children={
          <Ionicons
            name="chevron-back"
            size={24}
            color={startIndex === 0 ? "#ccc" : "#00a69d"}
          />
        }
      />
      <View style={styles.cardsRow}>
        {visibleDays.map((day, index) => (
          <Button
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
                      <View key={idx} style={styles.medicationItem}>
                        <Text style={styles.medicationText}>
                          {capitalize(med.name)}
                        </Text>
                        <Text style={styles.medicationTime}>
                          {formatTime(med.startHour)}
                        </Text>
                      </View>
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
      <Button
        handlePress={handleNext}
        disabled={startIndex >= days.length - cardsToShow}
        customStyles={{
          button: styles.arrowButton,
          textButton: {},
        }}
        children={
          <Ionicons
            name="chevron-forward"
            size={24}
            color={startIndex >= days.length - cardsToShow ? "#ccc" : "#00a69d"}
          />
        }
      />
    </View>
  );
};

export default DayCarousel;
