/* eslint-disable indent */
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Animated, Easing, View, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInput, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Contextos y utils
import { useUserContext } from '@context/UserContext';
import { useLanguage } from '@context/LanguageContext';
import { log, getRouteAPI, fetchOptions, typeLanguages, interpolateMessage } from '@utils';
import { MedicationUser } from '@types';
import { useStylesScheduleMedication } from '@styles/screens/stylesScheduleMedication';

// Componentes
import HeaderComponent from '@components/common/Header';
import ButtonComponent from '@components/common/Button';

// Tipos
type RootStackParamList = {
  Schedule: undefined;
  Patient: undefined;
};

type ScheduleScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Schedule'>;


import { UserData } from '@types';

type UrgencyType = 'low' | 'medium' | 'high';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type DaysOfWeek = Partial<Record<DayOfWeek, string>>;

type Medication = {
  _id: string;
  name: string;
  name_es?: string;
  name_pt?: string;
};

type ResponseGetUserPatients = {
  error?: boolean;
  patients: UserData[];
};

type ResponseGetAllMedications = {
  error?: boolean;
  medications: Medication[];
};

type TypeBodyGetAllMedications = {
  onlyGetTheseColumns: string[];
};

const MedicationScheduler: React.FC = () => {
  // Hooks de contexto
  const { styles } = useStylesScheduleMedication();
  const navigation = useNavigation<ScheduleScreenNavigationProp>();
  const { userData } = useUserContext();
  const { language, t } = useLanguage();

  // Estados principales
  const [dose, setDose] = useState<string>('');
  const [time, setTime] = useState<Date>(new Date());
  const [intervalHours, setIntervalHours] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [requiredDoses, setRequiredDoses] = useState<number>(0);
  const [urgency, setUrgency] = useState<UrgencyType>('low');
  const [schedules, setSchedules] = useState<MedicationUser[]>([]);
  const [medication, setMedication] = useState<Medication | null>(null);
  const [dosageType, setDosageType] = useState<string>('pills');
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<DaysOfWeek | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [searchMedicationsList, setSearchMedicationsList] = useState<Medication[]>([]);
  const [medicationsList, setMedicationsList] = useState<Medication[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingMedications, setIsSearchingMedications] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMedicationsLoading, setIsMedicationsLoading] = useState(true);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [iconRotation, setIconRotation] = useState('0deg');

  // Validación
  const [fieldErrors, setFieldErrors] = useState({
    medication: false,
    dose: false,
    days: false,
    intervalHours: false,
    urgency: false,
  });

  // Animaciones
  const formAnim = useRef(new Animated.Value(0)).current;
  const dosageTypes: string[] = JSON.parse(t('dosageTypes')) as string[];

  // Días traducidos
  const daysOfWeek: Record<DayOfWeek, string> = {
    monday: t('days.monday' as keyof typeLanguages),
    tuesday: t('days.tuesday' as keyof typeLanguages),
    wednesday: t('days.wednesday' as keyof typeLanguages),
    thursday: t('days.thursday' as keyof typeLanguages),
    friday: t('days.friday' as keyof typeLanguages),
    saturday: t('days.saturday' as keyof typeLanguages),
    sunday: t('days.sunday' as keyof typeLanguages),
  };

  // Animación icono reloj
  const animateIconRotation = useCallback(() => {
    setIconRotation('0deg');
    let deg = 0;
    const interval = setInterval(() => {
      deg += 30;
      setIconRotation(`${deg}deg`);
      if (deg >= 360) {
        clearInterval(interval);
        setIconRotation('0deg');
      }
    }, 16);
  }, []);

  // Animación entrada formulario
  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  // Fetch datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Ya no se obtienen pacientes, solo medicamentos
        setIsMedicationsLoading(true);
        const medsRes = await fetch(
          getRouteAPI('/getAllMedications'),
          fetchOptions<TypeBodyGetAllMedications>('POST', {
            onlyGetTheseColumns: ['_id', language !== 'en' ? `name_${language}` : 'name'],
          })
        ).then(res => res.json());
        setMedicationsList(medsRes.medications?.map((m: Medication) => ({ ...m, _id: String(m._id) })) || []);
      } catch (error) {
        log('Error fetching data:', error);
      } finally {
        setIsMedicationsLoading(false);
      }
    };

    fetchInitialData();
  }, [language]);

  // Validación campos
  const validateFields = useCallback(() => {
    const doseValue = parseFloat(dose);
    return (
      !!medication &&
      !!dose && !isNaN(doseValue) && doseValue > 0 &&
      !!selectedDays && Object.keys(selectedDays).length > 0 &&
      intervalHours > 0 &&
      !!urgency
    );
  }, [medication, dose, selectedDays, intervalHours, urgency]);

  // Errores visuales
  const getFieldErrors = useCallback(() => ({
    medication: !medication,
    dose: !dose || isNaN(parseFloat(dose)) || parseFloat(dose) <= 0,
    days: !selectedDays || Object.keys(selectedDays).length === 0,
    intervalHours: intervalHours <= 0,
    urgency: !urgency,
  }), [medication, dose, selectedDays, intervalHours, urgency]);

  // Reset formulario
  const resetForm = useCallback(() => {
    setMedication(null);
    setDose('');
    setSelectedDays(null);
    setTime(new Date());
    setDosageType(dosageTypes[0]);
    setIntervalHours(0);
    setStock(0);
    setRequiredDoses(0);
    setUrgency('low');
    setFieldErrors({
      medication: false,
      dose: false,
      days: false,
      intervalHours: false,
      urgency: false,
    });
    setHasAttemptedSubmit(false);
  }, [dosageTypes]);

  // Enviar horario
  const handleAddSchedule = useCallback(async () => {
    const errors = getFieldErrors();
    setFieldErrors(errors);
    setHasAttemptedSubmit(true);

    if (Object.values(errors).some(e => e)) return;


    // El paciente es el usuario logueado
    if (!userData || !userData.id) {
      alert('No hay usuario logueado. Inicia sesión antes de agregar el horario.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        medication: {
          userId: userData.id,
          medicationId: medication!._id,
          name: language !== 'en' ? (medication as any)[`name_${language}`] : medication!.name,
          dosage: dosageType,
          startHour: time.toTimeString().slice(0, 5),
          days: Object.keys(selectedDays!),
          grams: parseFloat(dose),
          intervalHours,
          stock,
          requiredDoses,
          urgency,
        }
      };

      // DEBUG: log userData and request body
      console.log('userData:', userData);
      console.log('addUserMedication body:', body);

      const res = await fetch(
        getRouteAPI('/addUserMedication'),
        fetchOptions('POST', body)
      ).then(r => r.json());

      if (res.success) {
        setSchedules(prev => [...prev, res.medication]);
        resetForm();
        navigation.navigate('Patient');
      } else {
        alert(t('error.addScheduleFailed' as keyof typeLanguages) + (res.error?.message || ''));
      }
    } catch (error) {
      alert('Error de red: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    getFieldErrors,
    medication,
    dosageType,
    time,
    selectedDays,
    dose,
    intervalHours,
    stock,
    requiredDoses,
    urgency,
    resetForm,
    navigation,
    language,
    t
  ]);

  // Toggle día
  const toggleDay = useCallback((day: DayOfWeek) => {
    setSelectedDays(prev => {
      const newDays = prev ? { ...prev } : {};
      if (newDays[day]) {
        delete newDays[day];
        return Object.keys(newDays).length ? newDays : null;
      }
      return { ...newDays, [day]: t(`days.${day}` as keyof typeLanguages) };
    });
  }, [t]);

  // Estilos combinados
  const fullStyles = {
    ...styles,
    ...StyleSheet.create({
      managementCard: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 24,
        padding: 32,
        shadowColor: '#00a69d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
      },
      managementTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#00a69d',
        textAlign: 'center',
        marginBottom: 8,
        textShadowColor: 'rgba(178, 223, 219, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 80,
        left: 20,
        zIndex: 10,
        backgroundColor: Platform.OS === 'ios' ? '#00a69d' : 'transparent',
        borderRadius: 24,
        padding: 8,
      },
      timeInput: {
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#00a69d',
        borderRadius: 16,
        padding: 14,
        fontSize: 16,
        color: '#00a69d',
        fontWeight: '600',
      },
      submitButton: {
        backgroundColor: '#00a69d',
        borderRadius: 16,
        padding: 16,
        marginTop: 24,
        alignItems: 'center',
        shadowColor: '#00a69d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      },
      submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
      },
      submitButtonPressed: {
        backgroundColor: '#00897b',
      },
    }),
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={fullStyles.backButton}
        android_ripple={{ color: 'rgba(0,166,157,0.2)', radius: 24 }}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={Platform.OS === 'ios' ? 'white' : '#00a69d'}
        />
      </Pressable>

      <HeaderComponent />

      <ScrollView
        contentContainerStyle={{
          paddingVertical: 24,
          alignItems: 'center',
          paddingBottom: 50,
        }}
      >
        <View style={fullStyles.managementCard}>
          <Text style={fullStyles.managementTitle}>
            {t('medicationsManagement')}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: formAnim,
              transform: [
                {
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.formContent}>
            {/* Búsqueda medicamentos */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('medicationText')}</Text>
              <TextInput
                style={[styles.input, fieldErrors.medication && hasAttemptedSubmit && styles.inputError]}
                value={searchValue}
                onChangeText={text => setSearchValue(text)}
                placeholder={t('medicationPlaceholder')}
                right={
                  <TextInput.Icon
                    icon={isSearchingMedications ? 'loading' : 'magnify'}
                    onPress={() => {
                      if (searchValue.length >= 3) {
                        setIsSearchingMedications(true);
                        setTimeout(() => {
                          const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
                          const normalizedSearch = normalize(searchValue);
                          const filtered = medicationsList.filter(m => {
                            let medName = '';
                            if (language === 'es' && m.name_es) {
                              medName = m.name_es;
                            } else if (String(language) === 'pt' && m.name_pt) {
                              medName = m.name_pt;
                            } else if (m.name) {
                              medName = m.name;
                            }
                            return normalize(medName).includes(normalizedSearch);
                          });
                          setSearchMedicationsList(filtered);
                          setIsSearchingMedications(false);
                        }, 500);
                      }
                    }}
                  />
                }
              />
              {fieldErrors.medication && hasAttemptedSubmit && (
                <Text style={styles.errorText}>
                  {t('formErrorMedication' as keyof typeLanguages)}
                </Text>
              )}

              {/* Sugerencias de medicamentos filtrados */}
              {searchMedicationsList.length > 0 && (
                <View style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 4, elevation: 2 }}>
                  {searchMedicationsList.map(med => (
                    <Pressable
                      key={med._id}
                      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                      onPress={() => {
                        setMedication(med);
                        setSearchValue(language === 'es' && med.name_es ? med.name_es : med.name);
                        setSearchMedicationsList([]);
                      }}
                    >
                      <Text style={{ color: '#00a69d', fontWeight: '500' }}>
                        {language === 'es' && med.name_es ? med.name_es : med.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Dosis */}
            <View style={styles.doseContainer}>
              <View style={styles.doseInputGroup}>
                <Text style={styles.label}>{t('dosage')}</Text>
                <TextInput
                style={[styles.input, styles.inputHint, fieldErrors.dose && hasAttemptedSubmit && styles.inputError]}
                keyboardType="numeric"
                value={dose}
                onChangeText={text => setDose(text.replace(/[^0-9.]/g, ''))}
                placeholder={interpolateMessage(t('dosagePlaceholder' as keyof typeLanguages), ['500 mg']) || 'Dosage'}
                />
                {fieldErrors.dose && hasAttemptedSubmit && (
                  <Text style={styles.errorText}>
                    {t('formErrorDose' as keyof typeLanguages)}
                  </Text>
                )}
              </View>

              <View style={styles.dosageTypeGroup}>
                <Text style={styles.label}>{t('type')}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  {dosageTypes.map(type => (
                    <Pressable
                      key={type}
                      style={[
                        styles.urgencyButton,
                        dosageType === type && styles.selectedUrgencyButton,
                      ]}
                      onPress={() => setDosageType(type)}
                    >
                      <Text
                        style={
                          dosageType === type
                            ? styles.selectedUrgencyText
                            : styles.urgencyButtonText
                        }
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Días */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('daysText')}</Text>
              <View style={styles.daysContainer}>
                {Object.entries(daysOfWeek).map(([day, label]) => (
                  <Pressable
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDays && day in selectedDays && styles.selectedDay,
                    ]}
                    onPress={() => toggleDay(day as DayOfWeek)}
                  >
                    <Text
                      style={
                        selectedDays && day in selectedDays
                          ? styles.selectedDayText
                          : styles.dayButtonText
                      }
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {fieldErrors.days && hasAttemptedSubmit && (
                <Text style={styles.errorText}>
                  {t('formErrorDays' as keyof typeLanguages)}
                </Text>
              )}
            </View>

            {/* Hora */}
            {/* Campo de hora - Versión completa */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('selectTime')}</Text>
              {Platform.OS !== 'web' ? (
                <>
                  <Pressable
                    onPress={() => {
                      animateIconRotation();
                      setShowTimePicker(true);
                    }}
                    style={({ pressed }) => [
                      styles.timeInputContainer,
                      pressed && { backgroundColor: '#e0f7fa' },
                    ]}
                  >
                    <Text style={{ fontWeight: '600', fontSize: 16, color: '#00a69d' }}>
                      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
                      <Ionicons 
                        name="time-outline" 
                        size={20} 
                        color="#00a69d" 
                      />
                    </Animated.View>
                  </Pressable>
                  {showTimePicker && (
                    <DateTimePicker
                      value={time}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowTimePicker(false);
                        if (selectedDate) {
                          setTime(selectedDate);
                        }
                      }}
                      themeVariant="light"
                      accentColor="#00a69d"
                    />
                  )}
                </>
              ) : (
                <input
                  type="time"
                  value={time.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newTime = new Date(time);
                    newTime.setHours(hours);
                    newTime.setMinutes(minutes);
                    setTime(newTime);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #00a69d',
                    fontSize: '16px',
                    color: '#00a69d',
                    backgroundColor: '#f8f9fa',
                  }}
                />
              )}
            </View>

            {/* Intervalo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('intervalHours')}</Text>
              <TextInput
                style={[styles.input, fieldErrors.intervalHours && hasAttemptedSubmit && styles.inputError]}
                keyboardType="numeric"
                value={intervalHours.toString()}
                onChangeText={text => setIntervalHours(Number(text.replace(/[^0-9.]/g, '')) || 0)}
              />
              {fieldErrors.intervalHours && hasAttemptedSubmit && (
                <Text style={styles.errorText}>
                  {t('formErrorIntervalHours' as keyof typeLanguages)}
                </Text>
              )}
            </View>

            {/* Stock */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('stock')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={stock.toString()}
                onChangeText={text => setStock(Number(text.replace(/[^0-9.]/g, '')) || 0)}
              />
            </View>

            {/* Dosis requeridas */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('requiredDoses')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={requiredDoses.toString()}
                onChangeText={text => setRequiredDoses(Number(text.replace(/[^0-9.]/g, '')) || 0)}
                placeholder={t('stockPlaceholder' as keyof typeLanguages)}
              />
              <Text style={styles.inputDescription}>{t('requiredDosesDescription' as keyof typeLanguages)}</Text>
            </View>

            {/* Urgencia */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('urgencyText')}</Text>
              <View style={styles.urgencyButtons}>
                {(() => {
                  let urgencyLabels: Record<string, string> = {};
                  const rawUrgency = t("urgency");
                  if (typeof rawUrgency === "string") {
                    try {
                      urgencyLabels = JSON.parse(rawUrgency);
                    } catch {
                      urgencyLabels = { low: "Low", medium: "Medium", high: "High" };
                    }
                  } else if (typeof rawUrgency === "object" && rawUrgency !== null) {
                    urgencyLabels = rawUrgency as Record<string, string>;
                  }
                  return (["low", "medium", "high"] as UrgencyType[]).map(level => (
                    <Pressable
                      key={level}
                      style={[
                        styles.urgencyButton,
                        urgency === level && styles.selectedUrgencyButton,
                      ]}
                      onPress={() => setUrgency(level)}
                    >
                      <Text
                        style={
                          urgency === level
                            ? styles.selectedUrgencyText
                            : styles.urgencyButtonText
                        }
                      >
                        {urgencyLabels[level] || level}
                      </Text>
                    </Pressable>
                  ));
                })()}
              </View>
              {fieldErrors.urgency && hasAttemptedSubmit && (
                <Text style={styles.errorText}>
                  {t('formErrorUrgency' as keyof typeLanguages)}
                </Text>
              )}
            </View>

            {/* Botón enviar */}
            <ButtonComponent
              label={t('addSchedule')}
              handlePress={handleAddSchedule}
              customStyles={{ button: [fullStyles.submitButton, isSubmitting && fullStyles.submitButtonPressed], textButton: fullStyles.submitButtonText }}
            />
            {/* Errores */}
            {hasAttemptedSubmit && Object.values(fieldErrors).some(Boolean) && (
              <View style={styles.errorContainer}>
                {Object.entries(fieldErrors)
                  .filter(([_, hasError]) => hasError)
                  .map(([field]) => (
                    <Text key={field} style={styles.errorText}>
                      {t((`formError${field.charAt(0).toUpperCase() + field.slice(1)}`) as keyof typeLanguages)}
                    </Text>
                  ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

export default MedicationScheduler;