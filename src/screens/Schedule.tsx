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

type ScheduleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Schedule"
>;

type Medication = { _id: string; name: string };

const MedicationScheduler: React.FC = () => {
  const { styles } = useStylesScheduleMedication();
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
  const dosageTypes: string[] = useMemo(() => translations.dosageTypes, [translations.dosageTypes]);

  const [dose, setDose] = useState<string>("");
  const [time, setTime] = useState<Date>(new Date());
  const [intervalHours, setIntervalHours] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [urgency, setUrgency] = useState<Partial<Record<UrgencyType, string>>>({
    low: translations.urgency.low,
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
    setUrgency({ low: translations.urgency.low });
    setTime(new Date());
  }, [translations.urgency.low]);

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
      const data: ResponseGetAllMedications = await fetch(
        getRouteAPI("/getAllMedications"),
        fetchOptions<TypeBodyGetAllMedications>("POST", {
          onlyGetTheseColumns: [
            "_id",
            language !== "en" ? `name_${language}` : "name",
          ],
        })
      ).then((res) => res.json());

      setMedicationsList(data.medications as any);
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
    const isFormValid = medication && 
                       dose && 
                       (Object.keys(selectedDays || {}).length > 0) && 
                       intervalHours > 0 && 
                       urgency;
    
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
  }, [medication, dose, selectedDays, intervalHours, urgency, startPulseAnimation]);

  const handleAddSchedule = useCallback(async () => {
    console.log("🚀 handleAddSchedule called");
    animateButtonPress();
    
    if (!selectedPatient || !medication) {
      console.error("❌ Missing required data:", { selectedPatient, medication });
      alert("Por favor selecciona un paciente y un medicamento");
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
      urgency: (Object.values(urgency)[0] ||
        translations.urgency.low) as UrgencyType,
    };

    console.log("📝 New schedule data:", newSchedule);

    try {
      console.log("🌐 Sending request to backend...");
      // Save to backend
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
        resetForm();
        
        console.log("🔄 Navigating to Patient screen...");
        // Small delay for better UX, then navigate back
        setTimeout(() => {
          setIsSubmitting(false);
          navigation.navigate("Patient");
          console.log("✅ Navigation completed");
        }, 500);
      }
    } catch (error) {
      console.error("💥 Network error saving medication:", error);
      alert(`Network error: ${error}`);
      setIsSubmitting(false);
    }
  }, [medication, dose, selectedDays, time, dosageType, intervalHours, stock, urgency, selectedPatient, medicationsList, translations.unknown, translations.urgency.low, resetForm, animateButtonPress, navigation]);

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

  const getAgeText = useCallback(
    (age: number | string): string => {
      const ageText = translations?.age || "Age";
      return `${ageText}: ${age} ${translations?.years || "years"}`;
    },
    [translations?.age, translations?.years]
  );

  const deleteSchedule = useCallback(
    (scheduleId: string) => {
      setSchedules((prev) =>
        prev.filter((s) => (s._id as unknown) !== scheduleId)
      );
    },
    [setSchedules]
  );

  const handleSearchMedication = useCallback(() => {
    animateIconRotation();
    if (searchValue.length < 3) return;

    const found = medicationsList?.filter((med) =>
      med.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    log(found?.length, "foundMedications", searchValue);
    if (found) setSearchMedicationsList(found);
    else setSearchMedicationsList([]);
  }, [searchValue, medicationsList, animateIconRotation]);

  // Rotation interpolation
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

          {selectedPatient && (
            <View style={styles.patientInfo}>
              <Text style={styles.patientDetail}>
                {translations.name}: {selectedPatient?.name || "N/A"}
              </Text>
              <Text style={styles.patientDetail}>
                {getAgeText(selectedPatient?.age || "N/A")}
              </Text>
              {selectedPatient?.conditions &&
                selectedPatient.conditions.length > 0 && (
                  <Text style={styles.patientDetail}>
                    {translations.conditions}:{" "}
                    {selectedPatient?.conditions.join(", ")}
                  </Text>
                )}
            </View>
          )}
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
          <Text style={styles.label}>{translations.medicationText}:</Text>
          {!medication && (
            <TextInput
              style={styles.input}
              value={searchValue}
              onChangeText={setSearchValue}
              onSubmitEditing={handleSearchMedication}
              autoCorrect={false}
              autoCapitalize="none"
              placeholder={translations.medicationPlaceholder}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={inputTheme}
              right={
                <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
                  <TextInput.Icon 
                    icon="magnify" 
                    onPress={() => {
                      animateIconRotation();
                      handleSearchMedication();
                    }}
                  />
                </Animated.View>
              }
            />
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
                  <Text style={styles.clearMedicationText}>X</Text>
                  <Text style={styles.clearMedicationText}>
                    {medication?.name || translations.unknown}
                  </Text>
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
                      label={medication.name || translations.unknown}
                      handlePress={() => {
                        animateButtonPress();
                        setSearchValue("");
                        setSearchMedicationsList([]);
                        setMedication(medication);
                      }}
                      replaceStyles={{
                        button: { ...styles.addButton, marginHorizontal: 5 },
                        textButton: {},
                      }}
                      touchableOpacity
                    />
                  </Animated.View>
                );
              })}
          </ScrollView>
        </View>

        <View style={styles.doseContainer}>
          <View style={styles.doseInputGroup}>
            <Text style={styles.label}>{translations.dosage}:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={dose}
              onChangeText={setDose}
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
          <Text style={styles.label}>{translations.daysText}:</Text>
          <View style={styles.daysContainer}>
            {Object.entries(daysOfWeek).map(([key, day], index) => (
              <Pressable
                key={index}
                style={[
                  styles.dayButton,
                  Object.values(selectedDays || {}).includes(day) &&
                    styles.selectedDay,
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
          <Text style={styles.label}>{translations.intervalHours}:</Text>
          <TextInput
            style={styles.input}
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
          <Text style={styles.label}>{translations.urgencyText}:</Text>
          <View style={styles.urgencyButtons}>
            {Object.entries(translations.urgency).map(([key, label]) => (
              <Pressable
                key={key}
                style={[
                  styles.urgencyButton,
                  Object.values(urgency)[0] === label &&
                    styles.selectedUrgencyButton,
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

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Button
            label={isSubmitting ? "..." : ["+", translations.addSchedule].join(" ")}
            handlePress={handleAddSchedule}
            replaceStyles={{
              button: [
                styles.addButton,
                isSubmitting && { opacity: 0.7 }
              ],
              textButton: styles.addButtonText,
            }}
            forceReplaceStyles
            touchableOpacity
            disabled={
              isSubmitting ||
              !medication ||
              !dose ||
              !(Object.keys(selectedDays || {}).length > 0) ||
              intervalHours <= 0 ||
              !urgency
            }
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
