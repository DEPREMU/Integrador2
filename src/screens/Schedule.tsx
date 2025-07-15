import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  User,
  UrgencyType,
  MedicationUser,
  ResponseGetUserPatients,
  ResponseGetAllMedications,
  TypeBodyGetAllMedications,
  TypeBodyAddUserMedication,
  ResponseAddUserMedication,
  ResponseGetUserMedications,
  TypeBodyGetUserMedications,
} from "@types";
import Button from "@components/common/Button";
import Header from "@components/common/Header";
import { useLanguage } from "@context/LanguageContext";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "@context/UserContext";
import { TextInput, Text } from "react-native-paper";
import { RootStackParamList } from "@navigation/navigationTypes";
import RenderScheduleItemMemo from "@components/Schedule/RenderSchedule";
import { DayOfWeek, DaysOfWeek } from "@types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useStylesScheduleMedication } from "@styles/screens/stylesScheduleMedication";
import { View, Platform, Pressable, ScrollView, Animated } from "react-native";
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { log, getRouteAPI, fetchOptions, interpolateMessage } from "@utils";
import { Ionicons } from "@expo/vector-icons";

type ScheduleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Schedule"
>;

type Medication = { _id: string; name: string; [key: string]: any };

const MedicationScheduler: React.FC = () => {
  const { styles, isPhone } = useStylesScheduleMedication();
  const navigation = useNavigation<ScheduleScreenNavigationProp>();
  const { userData } = useUserContext();
  const { language, translations } = useLanguage();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;
  const patientAnim = useRef(new Animated.Value(1)).current;
  const formAnim = useRef(new Animated.Value(1)).current;

  // Custom theme for consistent TextInput styling
  const inputTheme = {
    colors: {
      background: "#ecebea",
      surface: "#ecebea",
      onSurface: "#333333",
      primary: "#00a69d",
      onSurfaceVariant: "#666666",
      placeholder: "#666666",
    }
  };

  const daysOfWeek: Record<DayOfWeek, string> = useMemo(() => ({
    monday: translations.days.monday,
    tuesday: translations.days.tuesday,
    wednesday: translations.days.wednesday,
    thursday: translations.days.thursday,
    friday: translations.days.friday,
    saturday: translations.days.saturday,
    sunday: translations.days.sunday,
  }), [translations.days]);
  const dosageTypes: string[] = useMemo(() => JSON.parse(translations.dosageTypes), [translations.dosageTypes]);

  const [dose, setDose] = useState<string>("");
  const [time, setTime] = useState<Date>(new Date());
  const [intervalHours, setIntervalHours] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [requiredDoses, setRequiredDoses] = useState<number>(0);
  const urgencyOptions = useMemo(() => {
    return typeof translations.urgency === 'string' 
      ? JSON.parse(translations.urgency) as Record<UrgencyType, string>
      : translations.urgency;
  }, [translations.urgency]);

  const [urgency, setUrgency] = useState<Partial<Record<UrgencyType, string>>>({
    low: urgencyOptions.low,
  });
  const [patients, setPatients] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<MedicationUser[]>([]);
  const [medication, setMedication] = useState<Medication | null>(null);
  const [dosageType, setDosageType] = useState<string>("pills");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<DaysOfWeek | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [searchMedicationsList, setSearchMedicationsList] = useState<
    Medication[]
  >([]);
  const [medicationsList, setMedicationsList] = useState<Medication[]>();
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingMedications, setIsSearchingMedications] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMedicationsLoading, setIsMedicationsLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({
    medication: false,
    dose: false,
    days: false,
    intervalHours: false,
    urgency: false,
  });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const startEntranceAnimations = useCallback(() => {}, []);
  const startPulseAnimation = useCallback(() => {}, []);
  const animateButtonPress = useCallback(() => {}, []);
  const animateIconRotation = useCallback(() => {}, []);
  const resetForm = useCallback(() => {
    setMedication(null);
    setDose("");
    setSelectedDays(null);
    setDosageType("pills");
    setIntervalHours(0);
    setStock(0);
    setRequiredDoses(0);
    setUrgency({ low: urgencyOptions.low });
    setTime(new Date());
    // Reset validation states when form is reset
    setHasAttemptedSubmit(false);
    setFieldErrors({
      medication: false,
      dose: false,
      days: false,
      intervalHours: false,
      urgency: false,
    });
  }, [urgencyOptions.low]);

  const validateFields = useCallback(() => {
    const doseValue = parseFloat(dose);
    const errors = {
      medication: !medication,
      dose: !dose || dose.trim() === "" || isNaN(doseValue) || doseValue <= 0,
      days: !selectedDays || Object.keys(selectedDays).length === 0,
      intervalHours: intervalHours <= 0,
      urgency: !urgency || Object.keys(urgency).length === 0,
    };
    
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  }, [medication, dose, selectedDays, intervalHours, urgency]);

  const getValidationErrors = useCallback(() => {
    const errors = [];
    const doseValue = parseFloat(dose);
    
    if (!medication) {
      errors.push(translations.medicationRequired);
    }
    
    if (!dose || dose.trim() === "" || isNaN(doseValue) || doseValue <= 0) {
      errors.push(translations.dosageRequired);
    }
    
    if (!selectedDays || Object.keys(selectedDays).length === 0) {
      errors.push(translations.daysRequired);
    }
    
    if (intervalHours <= 0) {
      errors.push(translations.intervalRequired);
    }
    
    if (!urgency || Object.keys(urgency).length === 0) {
      errors.push(translations.urgencyRequired);
    }
    
    return errors;
  }, [medication, dose, selectedDays, intervalHours, urgency, translations]);

  const isFormValid = useMemo(() => {
    const doseValue = parseFloat(dose);
    const isValid = medication && 
           dose && 
           dose.trim() !== "" && 
           !isNaN(doseValue) && 
           doseValue > 0 &&
           selectedDays && 
           Object.keys(selectedDays).length > 0 && 
           intervalHours > 0 && 
           urgency && 
           Object.keys(urgency).length > 0;
    
    // Prevent showing validation errors if form is actually valid
    if (isValid && hasAttemptedSubmit) {
      // Clear any previous errors if form is now valid
      setTimeout(() => {
        setFieldErrors({
          medication: false,
          dose: false,
          days: false,
          intervalHours: false,
          urgency: false,
        });
      }, 50);
    }
    
    return isValid;
  }, [medication, dose, selectedDays, intervalHours, urgency, hasAttemptedSubmit]);

  // Reset specific field errors when user fixes them (only when form has been attempted)
  useEffect(() => {
    if (hasAttemptedSubmit) {
      // Use a small delay to avoid flickering
      const timeoutId = setTimeout(() => {
        const doseValue = parseFloat(dose);
        setFieldErrors(prev => ({
          ...prev,
          medication: !medication,
          dose: !dose || dose.trim() === "" || isNaN(doseValue) || doseValue <= 0,
          days: !selectedDays || Object.keys(selectedDays).length === 0,
          intervalHours: intervalHours <= 0,
          urgency: !urgency || Object.keys(urgency).length === 0,
        }));
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasAttemptedSubmit, medication, dose, selectedDays, intervalHours, urgency]);

  useEffect(() => {
    if (!userData) return;

    const getPatients = async () => {
      if (!userData?.patientUserIds || userData.patientUserIds.length === 0)
        return;

      const data: ResponseGetUserPatients = await fetch(
        getRouteAPI("/getUserPatients"),
        fetchOptions("POST", { userId: userData.userId })
      ).then((res) => res.json());

      if (data.error) {
        console.error("Error fetching patients:", data.error);
        return;
      }
      const { patients } = data;
      log(patients, "patients");
      if (patients.length === 0) return;
      setSelectedPatient(patients[0]);
      setPatients(patients);
      patients.forEach((patient) => log("patient:", patient));
    };

    const getMedications = async () => {
      log("Fetching medications...");
      setIsMedicationsLoading(true);
      try {
        const data: ResponseGetAllMedications = await fetch(
          getRouteAPI("/getAllMedications"),
          fetchOptions<TypeBodyGetAllMedications>("POST", {
            onlyGetTheseColumns: [
              "_id",
              "name_es",
              "name",
            ],
          })
        ).then((res) => res.json());

        if (data.error) {
          console.error("Error fetching medications:", data.error);
          setMedicationsList([]);
          setIsMedicationsLoading(false);
          return;
        }

        log("Medications loaded:", data.medications?.length);
        setMedicationsList(data.medications as any);
        setIsMedicationsLoading(false);
      } catch (error) {
        console.error("Network error fetching medications:", error);
        setMedicationsList([]);
        setIsMedicationsLoading(false);
      }
    };

    const getUserScheduledMedications = async () => {
      if (!userData?.userId) return;
      
      log("Fetching user scheduled medications...");
      const data: ResponseGetUserMedications = await fetch(
        getRouteAPI("/getUserMedications"),
        fetchOptions<TypeBodyGetUserMedications>("POST", {
          userId: userData.userId,
        })
      ).then((res) => res.json());

      if (data.error) {
        console.error("Error fetching user medications:", data.error);
        return;
      }
      
      log("User medications loaded:", data.medications);
      setSchedules(data.medications || []);
    };

    getPatients();
    getMedications();
    getUserScheduledMedications();
  }, [userData?.userId, language]);

  // Start animations when component mounts
  useEffect(() => {
    startEntranceAnimations();
  }, [startEntranceAnimations]);

  // Start pulse animation when add button becomes enabled
  useEffect(() => {
    console.log("🔍 Form validation check:", {
      medication: !!medication,
      dose: !!dose,
      selectedDays: Object.keys(selectedDays || {}).length,
      intervalHours,
      urgency: !!urgency,
      isFormValid
    });
    
    if (isFormValid) {
      startPulseAnimation();
    }
  }, [isFormValid, startPulseAnimation]);

  // Validate fields in real-time when user has attempted to submit (with debounce)
  useEffect(() => {
    if (hasAttemptedSubmit) {
      const timeoutId = setTimeout(() => {
        validateFields();
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasAttemptedSubmit, validateFields]);

  const handleAddSchedule = useCallback(async () => {
    console.log("🚀 handleAddSchedule called");
    animateButtonPress();
    
    // Validate fields first BEFORE setting hasAttemptedSubmit
    if (!validateFields()) {
      console.warn("❌ Form validation failed");
      setHasAttemptedSubmit(true);
      return;
    }
    
    if (!selectedPatient || !medication) {
      console.error("❌ Missing required data:", { selectedPatient, medication });
      alert("Por favor selecciona un paciente y un medicamento");
      setHasAttemptedSubmit(true);
      return;
    }

    console.log("✅ Required data available:", { 
      selectedPatient: selectedPatient.name, 
      medication: medication.name 
    });

    setIsSubmitting(true);

    const medicationAPI = medicationsList?.find(
      (med) => med._id === medication?._id
    ) as Medication;
    
    const newSchedule: Omit<MedicationUser, "_id"> = {
      medicationId: medication._id,
      name: medicationAPI?.name || translations.unknown,
      userId: selectedPatient.userId,
      dosage: dosageType,
      startHour: time.toTimeString().slice(0, 5),
      days: [...Object.keys(selectedDays || {})],
      grams: parseFloat(dose.split(" ")[0]) || 0,
      intervalHours,
      stock,
      requiredDoses,
      urgency: (Object.values(urgency)[0] ||
        urgencyOptions.low) as UrgencyType,
    };

    console.log("📝 New schedule data:", newSchedule);

    try {
      console.log("🌐 Sending request to backend...");
      const response: ResponseAddUserMedication = await fetch(
        getRouteAPI("/addUserMedication"),
        fetchOptions<TypeBodyAddUserMedication>("POST", {
          medication: newSchedule,
        })
      ).then((res) => res.json());

      console.log("📦 Backend response:", response);

      if (response.error) {
        console.error("❌ Error saving medication:", response.error);
        alert(`Error: ${response.error.message}`);
        setIsSubmitting(false);
        return;
      }

      if (response.success && response.medication) {
        console.log("✅ Medication saved successfully:", response.medication);
        setSchedules((prev) => [...prev, response.medication!]);
        
        // Reset form immediately to prevent validation errors showing
        resetForm();
        
        console.log("🔄 Navigating to Patient screen...");
        setTimeout(() => {
          setIsSubmitting(false);
          navigation.navigate("Patient");
          console.log("✅ Navigation completed");
        }, 300); // Reduced delay to make navigation feel more responsive
      }
    } catch (error) {
      console.error("💥 Network error saving medication:", error);
      alert(`Network error: ${error}`);
      setIsSubmitting(false);
    }
  }, [medication, dose, selectedDays, time, dosageType, intervalHours, stock, urgency, selectedPatient, medicationsList, translations.unknown, urgencyOptions.low, resetForm, animateButtonPress, navigation, validateFields]);

  const toggleDay = useCallback((day: DayOfWeek) => {
    setSelectedDays((prev) => {
      if (!prev) return { [day]: daysOfWeek[day] } as DaysOfWeek;
      
      const newSelectedDays = { ...prev };
      if (Object.keys(newSelectedDays).includes(day)) {
        delete newSelectedDays[day];
        return Object.keys(newSelectedDays).length === 0 ? null : newSelectedDays;
      }
      return {
        ...newSelectedDays,
        [day]: daysOfWeek[day],
      };
    });
  }, [daysOfWeek]);

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };

  const deleteSchedule = useCallback(
    (scheduleId: string) => {
      setSchedules((prev) =>
        prev.filter((s) => (s._id as unknown) !== scheduleId)
      );
    },
    [setSchedules]
  );

  const handleSearchMedication = useCallback(async () => {
    animateIconRotation();
    if (searchValue.length < 3) {
      setSearchMedicationsList([]);
      setHasSearched(false);
      return;
    }

    if (isMedicationsLoading || !medicationsList || medicationsList.length === 0) {
      console.warn("Medications list not loaded yet, please wait...");
      setIsSearchingMedications(false);
      setHasSearched(true);
      setSearchMedicationsList([]);
      return;
    }

    setIsSearchingMedications(true);
    setHasSearched(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const found = medicationsList?.filter((med) =>
        med[language !== "en" ? `name_${language}` : "name"]?.toLowerCase()?.includes(searchValue.toLowerCase())
      );
      
      log(found?.length, "foundMedications", searchValue);
      if (found) setSearchMedicationsList(found);
      else setSearchMedicationsList([]);
    } catch (error) {
      console.error("Error searching medications:", error);
      setSearchMedicationsList([]);
    } finally {
      setIsSearchingMedications(false);
    }
  }, [searchValue, medicationsList, isMedicationsLoading, animateIconRotation, language]);

  // Auto-retry search when medications finish loading
  useEffect(() => {
    if (!isMedicationsLoading && searchValue.length >= 3 && hasSearched && searchMedicationsList.length === 0) {
      console.log("🔄 Medications loaded, retrying search for:", searchValue);
      handleSearchMedication();
    }
  }, [isMedicationsLoading, searchValue, hasSearched, searchMedicationsList.length, handleSearchMedication]);

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.screenContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      {/* Back Button - rendered before Header to ensure it stays behind menu */}
      <Pressable
        onPress={() => navigation.navigate("Patient")}
        style={styles.backButton}
        android_ripple={{ color: isPhone ? "rgba(255,255,255,0.2)" : "rgba(0,166,157,0.2)", radius: 24 }}
      >
        <Ionicons name="arrow-back" size={24} color={isPhone ? "white" : "#00a69d"} />
      </Pressable>
      
      <Header />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.pageHeader,
            {
              opacity: headerAnim,
              transform: [{ translateY: Animated.multiply(headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }), 1) }],
            }
          ]}
        >
          <Text style={styles.pageTitle}>{translations.medicationsManagement}</Text>
          <Text style={styles.pageSubtitle}>{translations.manageMedicationsDescription}</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.header,
            {
              opacity: patientAnim,
              transform: [{ translateY: Animated.multiply(patientAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }), 1) }],
            }
          ]}
        >
          <View style={styles.patientSelector}>
            <Text style={styles.patientLabel}>{translations.patientText}:</Text>
            <View style={styles.patientButtons}>
              {patients.map((patient) => (
                <Pressable
                  key={patient.userId}
                  style={[
                    styles.patientButton,
                    selectedPatient?.userId === patient.userId &&
                      styles.selectedPatient,
                  ]}
                  onPress={() => {
                    animateButtonPress();
                    setSelectedPatient(patient);
                  }}
                >
                  <Text
                    style={
                      selectedPatient?.userId === patient.userId
                        ? styles.selectedPatientText
                        : styles.patientButtonText
                    }
                  >
                    {patient.name || translations.noNameGiven}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

      <Animated.View 
        style={[
          styles.formContainer,
          {
            opacity: formAnim,
            transform: [{ translateY: Animated.multiply(formAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }), 1) }],
          }
        ]}
      >
        <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.label, fieldErrors.medication && hasAttemptedSubmit && styles.labelError]}>
              {translations.medicationText}:
            </Text>
            {fieldErrors.medication && hasAttemptedSubmit && (
              <Text style={styles.requiredIndicator}>●</Text>
            )}
          </View>
          {fieldErrors.medication && hasAttemptedSubmit && (
            <Text style={styles.errorText}>{translations.medicationRequired}</Text>
          )}
          {!medication && (
            <TextInput
              style={styles.input}
              value={searchValue}
              onChangeText={(text) => {
                setSearchValue(text);
                if (text.length < 3) {
                  setSearchMedicationsList([]);
                  setHasSearched(false);
                } else {
                  setHasSearched(false);
                }
              }}
              onSubmitEditing={() => {
                if (searchValue.length >= 3) {
                  handleSearchMedication();
                }
              }}
              autoCorrect={false}
              autoCapitalize="none"
              placeholder={translations.medicationPlaceholder}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={inputTheme}
              right={
                <TextInput.Icon 
                  icon={isSearchingMedications ? "loading" : "magnify"}
                  onPress={() => {
                    if (searchValue.length >= 3 && !isSearchingMedications) {
                      handleSearchMedication();
                    }
                  }}
                  disabled={isSearchingMedications || searchValue.length < 3}
                  style={{
                    transform: isSearchingMedications ? [{ rotate: iconRotation }] : undefined
                  }}
                />
              }
            />
          )}
          
          {/* Search requirement hint */}
          {!medication && searchValue.length > 0 && searchValue.length < 3 && (
            <Text style={{
              color: '#666666',
              fontSize: 12,
              paddingHorizontal: 12,
              paddingVertical: 4,
              fontStyle: 'italic'
            }}>
              {translations.searchHint} ({searchValue.length}/3)
            </Text>
          )}
          
          {/* Search hint when user has enough characters */}
          {!medication && searchValue.length >= 3 && !isSearchingMedications && searchMedicationsList.length === 0 && (
            <Text style={{
              color: '#00a69d',
              fontSize: 12,
              paddingHorizontal: 12,
              paddingVertical: 4,
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              {language === 'es' 
                ? 'Presiona Enter o haz clic en la lupa para buscar'
                : 'Press Enter or click the magnifying glass to search'
              }
            </Text>
          )}
          
          {/* Loading medications message */}
          {!medication && hasSearched && !isSearchingMedications && searchMedicationsList.length === 0 && searchValue.length >= 3 && isMedicationsLoading && (
            <Text style={{
              color: '#00a69d',
              fontSize: 14,
              paddingHorizontal: 12,
              paddingVertical: 8,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              {translations.loadingMedications}
            </Text>
          )}
          
          {/* No medications found message */}
          {!medication && hasSearched && !isSearchingMedications && searchMedicationsList.length === 0 && searchValue.length >= 3 && !isMedicationsLoading && (
            <Text style={{
              color: '#ff6b6b',
              fontSize: 14,
              paddingHorizontal: 12,
              paddingVertical: 8,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              {translations.noMedicationsFoundMessage}
            </Text>
          )}
          
          {medication && (
            <Button
              handlePress={() => {
                setMedication(null);
                setSearchValue("");
                setSearchMedicationsList([]);
              }}
              children={
                <View style={styles.clearMedicationChildren}>
                  <View style={styles.medicationIcon}>
                    <Ionicons name="medical" size={16} color="#00a69d" />
                  </View>
                  <Text style={styles.clearMedicationText}>
                    {medication?.[language !== "en" ? `name_${language}` : "name"] || translations.unknown}
                  </Text>
                  <View style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </View>
                </View>
              }
              replaceStyles={{
                button: styles.selectedMedButton,
                textButton: {},
              }}
              forceReplaceStyles
              touchableOpacity
            />
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.medicationScroll}
          >
            {searchMedicationsList.length > 0 &&
              searchMedicationsList.map((medication, index) => {
                log(medication, "searchMedicationsList");
                return (
                  <Animated.View
                    key={medication._id}
                    style={{
                      opacity: formAnim,
                      transform: [
                        {
                          translateY: Animated.multiply(
                            formAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            }),
                            1
                          ),
                        },
                      ],
                    }}
                  >
                    <Button
                      label={medication[language !== "en" ? `name_${language}` : "name"] || translations.unknown}
                      handlePress={() => {
                        animateButtonPress();
                        setSearchValue("");
                        setSearchMedicationsList([]);
                        setMedication(medication);
                      }}
                      replaceStyles={{
                        button: styles.medicationButton,
                        textButton: styles.medicationButtonText,
                      }}
                      forceReplaceStyles
                      touchableOpacity
                    />
                  </Animated.View>
                );
              })}
          </ScrollView>
        </View>

        <View style={styles.doseContainer}>
          <View style={styles.doseInputGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.label, fieldErrors.dose && hasAttemptedSubmit && styles.labelError]}>
                {translations.dosage}:
              </Text>
              {fieldErrors.dose && hasAttemptedSubmit && (
                <Text style={styles.requiredIndicator}>●</Text>
              )}
            </View>
            {fieldErrors.dose && hasAttemptedSubmit && (
              <Text style={styles.errorText}>{translations.dosageRequired}</Text>
            )}
            <TextInput
              style={[styles.input, fieldErrors.dose && hasAttemptedSubmit && styles.inputError]}
              keyboardType="numeric"
              value={dose}
              onChangeText={(text) => {
                let numericValue = text.replace(/[^0-9.]/g, '');
                
                // Prevent multiple decimal points
                const parts = numericValue.split('.');
                if (parts.length > 2) {
                  numericValue = parts[0] + '.' + parts.slice(1).join('');
                }
                
                // Prevent leading zeros (except for decimal numbers like 0.5)
                if (numericValue.length > 1 && numericValue[0] === '0' && numericValue[1] !== '.') {
                  numericValue = numericValue.substring(1);
                }
                
                setDose(numericValue);
              }}
              placeholder={interpolateMessage(translations.dosagePlaceholder, [
                "100 ",
              ])}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={inputTheme}
            />
          </View>

          <View style={styles.dosageTypeGroup}>
            <Text style={styles.label}>{translations.type}:</Text>
            <View style={styles.dosageButtons}>
              {dosageTypes.map((type, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.dosageButton,
                    dosageType === type && styles.selectedDosageButton,
                  ]}
                  onPress={() => {
                    animateButtonPress();
                    setDosageType(type);
                  }}
                >
                  <Text
                    style={
                      dosageType === type
                        ? styles.selectedDosageText
                        : styles.dosageButtonText
                    }
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.label, fieldErrors.days && hasAttemptedSubmit && styles.labelError]}>
              {translations.daysText}:
            </Text>
            {fieldErrors.days && hasAttemptedSubmit && (
              <Text style={styles.requiredIndicator}>●</Text>
            )}
          </View>
          {fieldErrors.days && hasAttemptedSubmit && (
            <Text style={styles.errorText}>{translations.daysRequired}</Text>
          )}
          <View style={styles.daysContainer}>
            {Object.entries(daysOfWeek).map(([key, day], index) => (
              <Pressable
                key={index}
                style={[
                  styles.dayButton,
                  Object.values(selectedDays || {}).includes(day) &&
                    styles.selectedDay,
                  fieldErrors.days && hasAttemptedSubmit && styles.dayButtonError,
                ]}
                onPress={() => {
                  animateButtonPress();
                  toggleDay(key as DayOfWeek);
                }}
              >
                <Text
                  style={
                    Object.values(selectedDays || {}).includes(day)
                      ? styles.selectedDayText
                      : styles.dayButtonText
                  }
                >
                  {day}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{translations.hour}:</Text>
          {Platform.OS !== "web" && (
            <TextInput
              style={styles.input}
              value={time.toTimeString().slice(0, 5)}
              onFocus={() => setShowTimePicker(true)}
              showSoftInputOnFocus={false}
              placeholder={translations.selectTime}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={inputTheme}
              right={
                <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
                  <TextInput.Icon 
                    icon="clock-outline" 
                    onPress={() => {
                      animateIconRotation();
                      setShowTimePicker(true);
                    }}
                  />
                </Animated.View>
              }
            />
          )}
          {Platform.OS !== "web" && showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
            />
          )}
          {Platform.OS === "web" && (
            <input
              type="time"
              value={time.toTimeString().slice(0, 5)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(":").map(Number);
                const newTime = new Date(time);
                newTime.setHours(hours);
                newTime.setMinutes(minutes);
                setTime(newTime);
              }}
              style={{
                ...styles.timeButton,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.label, fieldErrors.intervalHours && hasAttemptedSubmit && styles.labelError]}>
              {translations.intervalHours}:
            </Text>
            {fieldErrors.intervalHours && hasAttemptedSubmit && (
              <Text style={styles.requiredIndicator}>●</Text>
            )}
          </View>
          {fieldErrors.intervalHours && hasAttemptedSubmit && (
            <Text style={styles.errorText}>{translations.intervalRequired}</Text>
          )}
          <TextInput
            style={[styles.input, fieldErrors.intervalHours && hasAttemptedSubmit && styles.inputError]}
            keyboardType="numeric"
            value={intervalHours.toString()}
            onChangeText={(text) => setIntervalHours(Number(text) || 0)}
            placeholder={translations.intervalHoursPlaceholder}
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            theme={inputTheme}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{translations.stock}:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={stock ? stock.toString() : ""}
            onChangeText={(text) => setStock(Number(text))}
            placeholder={translations.stockPlaceholder}
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            theme={inputTheme}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{translations.requiredDoses}:</Text>
          <Text style={{
            fontSize: 12,
            color: '#666666',
            marginBottom: 8,
            fontStyle: 'italic',
            lineHeight: 16
          }}>
            {translations.requiredDosesDescription}
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={requiredDoses ? requiredDoses.toString() : ""}
            onChangeText={(text) => {
              const numericValue = Number(text) || 0;
              if (numericValue >= 0) {
                setRequiredDoses(numericValue);
              }
            }}
            placeholder={translations.requiredDosesPlaceholder}
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            theme={inputTheme}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.label, fieldErrors.urgency && hasAttemptedSubmit && styles.labelError]}>
              {translations.urgencyText}:
            </Text>
            {fieldErrors.urgency && hasAttemptedSubmit && (
              <Text style={styles.requiredIndicator}>●</Text>
            )}
          </View>
          {fieldErrors.urgency && hasAttemptedSubmit && (
            <Text style={styles.errorText}>{translations.urgencyRequired}</Text>
          )}
          <View style={styles.urgencyButtons}>
            {Object.entries(translations.urgency).map(([key, label]) => (
              <Pressable
                key={key}
                style={[
                  styles.urgencyButton,
                  Object.values(urgency)[0] === label &&
                    styles.selectedUrgencyButton,
                  fieldErrors.urgency && hasAttemptedSubmit && styles.urgencyButtonError,
                ]}
                onPress={() => {
                  animateButtonPress();
                  setUrgency({ [key as UrgencyType]: label });
                }}
              >
                <Text
                  style={
                    Object.values(urgency)[0] === label
                      ? styles.selectedUrgencyText
                      : styles.urgencyButtonText
                  }
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Validation Summary */}
        {hasAttemptedSubmit && !isFormValid && (
          <View style={styles.validationSummary}>
            <Text style={styles.validationTitle}>
              {translations.formValidationTitle}
            </Text>
            <Text style={styles.validationMessage}>
              {translations.formValidationMessage}
            </Text>
            <View style={styles.validationList}>
              {getValidationErrors().map((error, index) => (
                <View key={index} style={styles.validationItem}>
                  <Text style={styles.validationBullet}>•</Text>
                  <Text style={styles.validationItemText}>{error}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Button
            label={isSubmitting ? "..." : ["+", translations.addSchedule].join(" ")}
            handlePress={handleAddSchedule}
            replaceStyles={{
              button: [
                styles.addButton,
                isSubmitting && { opacity: 0.7 },
                !isFormValid && styles.addButtonDisabled
              ],
              textButton: [
                styles.addButtonText,
                !isFormValid && styles.addButtonTextDisabled
              ],
            }}
            forceReplaceStyles
            touchableOpacity
            disabled={isSubmitting || !isFormValid}
          />
        </Animated.View>
        </View>
      </Animated.View>
    </ScrollView>
    </Animated.View>
  );
};
/*
  <ScrollView
        style={styles.schedulesContainer}
        contentContainerStyle={styles.schedulesContent}
      >
        <Text style={styles.sectionTitle}>
          {translations.schedulesScheduled}
        </Text>
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {translations.schedulesNotScheduled}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {translations.addMedicationsOnTop}
            </Text>
          </View>
        ) : (
          <RenderScheduleItemMemo
            data={schedules}
            styles={styles}
            deleteSchedule={deleteSchedule}
          />
        )}
      </ScrollView>

 */

export default MedicationScheduler;
