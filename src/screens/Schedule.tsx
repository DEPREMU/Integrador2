/* eslint-disable indent */
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
  MedicationApi,
} from "@typesAPI";
import ButtonComponent from "@components/common/Button";
import { useLanguage } from "@context/LanguageContext";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "@context/UserContext";
import { TextInput, Text, Searchbar } from "react-native-paper";
import { RootStackParamList } from "@navigation/navigationTypes";
import { DayOfWeek, DaysOfWeek } from "@types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useStylesScheduleMedication } from "@styles/screens/stylesScheduleMedication";
import { View, Platform, Pressable, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  log,
  getRouteAPI,
  fetchOptions,
  interpolateMessage,
  typeLanguages,
} from "@utils";

type ScheduleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Schedule"
>;

const MedicationScheduler: React.FC = () => {
  const { styles } = useStylesScheduleMedication();
  const navigation = useNavigation<ScheduleScreenNavigationProp>();
  const { userData } = useUserContext();
  const { language, t } = useLanguage();

  const daysOfWeek: Record<DayOfWeek, string> = {
    monday: t("days.monday" as keyof typeLanguages),
    tuesday: t("days.tuesday" as keyof typeLanguages),
    wednesday: t("days.wednesday" as keyof typeLanguages),
    thursday: t("days.thursday" as keyof typeLanguages),
    friday: t("days.friday" as keyof typeLanguages),
    saturday: t("days.saturday" as keyof typeLanguages),
    sunday: t("days.sunday" as keyof typeLanguages),
  };
  const dosageTypes: string[] = JSON.parse(t("dosageTypes")) as string[];

  const [dose, setDose] = useState<string>("");
  const [time, setTime] = useState<Date>(new Date());
  const [intervalHours, setIntervalHours] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [urgency, setUrgency] = useState<Partial<Record<UrgencyType, string>>>({
    low: t("urgency.low" as keyof typeLanguages),
  });
  const [patients, setPatients] = useState<User[]>([]);
  const [, setSchedules] = useState<MedicationUser[]>([]);
  const [medication, setMedication] = useState<Partial<MedicationApi> | null>(
    null,
  );
  const [dosageType, setDosageType] = useState<string>("pills");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<DaysOfWeek | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [searchMedicationsList, setSearchMedicationsList] = useState<
    Partial<MedicationApi>[]
  >([]);
  const [medicationsList, setMedicationsList] =
    useState<Partial<MedicationApi>[]>();
  const [, setKeysPressed] = useState<string[]>([]); //! Delete
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      setKeysPressed((prev) => {
        if (prev.includes(e.key)) return prev;
        const keys = [...prev, e.key];
        log(keys, "keysPressed");

        if (keys.includes("Control") && keys.includes("h")) {
          navigation.replace("Home");
        }

        return keys;
      });
    };
    const handler1 = (e: KeyboardEvent) => {
      setKeysPressed((prev) => prev.filter((key) => key !== e.key));
    };

    document?.addEventListener("keydown", handler);
    document?.addEventListener("keyup", handler1);
    if (!userData)
      return () => {
        document?.removeEventListener("keydown", handler);
        document?.removeEventListener("keyup", handler1);
      };

    const getPatients = async () => {
      if (!userData?.patientUserIds || userData.patientUserIds.length === 0)
        return;

      const data: ResponseGetUserPatients = await fetch(
        getRouteAPI("/getUserPatients"),
        fetchOptions("POST", { userId: userData.userId }),
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
        }),
      ).then((res) => res.json());

      setMedicationsList(data.medications);
    };

    getPatients();
    getMedications();
    return () => {
      document?.removeEventListener("keydown", handler);
      setKeysPressed([]);
    };
  }, [userData, language, navigation]);

  const resetForm = useCallback(() => {
    setMedication(null);
    setDose("");
    setSelectedDays(null);
    setTime(new Date());
    setDosageType("pastillas");
  }, []);

  const handleAddSchedule = useCallback(() => {
    const medicationAPI = medicationsList?.find(
      (med) => String(med._id) === String(medication?._id),
    );
    const newSchedule: MedicationUser = {
      medicationId: String(medication?._id || ""),
      name: (medicationAPI?.name as string) || t("unknown"),
      userId: selectedPatient?.userId || "",
      dosage: dosageType,
      startHour: time.toTimeString().slice(0, 5),
      days: [...Object.keys(selectedDays || {})],
      grams: parseFloat(dose.split(" ")[0]),
      intervalHours,
      stock,
      urgency: (Object.values(urgency)[0] ||
        t("urgency.low" as keyof typeLanguages)) as UrgencyType,
    };

    setSchedules((prev) => [...prev, newSchedule]);
    resetForm();
  }, [
    medication,
    t,
    dose,
    selectedDays,
    time,
    dosageType,
    intervalHours,
    stock,
    urgency,
    medicationsList,
    resetForm,
    selectedPatient,
  ]);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) => {
      if (!prev)
        return {
          [day]: t(("days." + day) as keyof typeLanguages),
        } as DaysOfWeek;
      log(prev, "prevSelectedDays", day);
      if (Object.keys(prev).includes(day)) {
        log(prev);
        delete prev[day];
        log(prev);
        return prev;
      }
      return {
        ...prev,
        [day]: t(("days." + day) as keyof typeLanguages),
      };
    });
  };

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };

  const getAgeText = useCallback(
    (age: number | string): string => {
      const ageText = t("age") || "Age";
      return `${ageText}: ${age} ${t("years") || "years"}`;
    },
    [t],
  );

  const handleSearchMedication = useCallback(() => {
    if (searchValue.length < 3) return;

    const found = medicationsList?.filter((med) =>
      med.name?.toLowerCase().includes(searchValue.toLowerCase()),
    );
    log(found?.length, "foundMedications", searchValue);
    if (found) setSearchMedicationsList(found);
    else setSearchMedicationsList([]);
  }, [searchValue, medicationsList]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("medicationsManagement")}</Text>

        <View style={styles.patientSelector}>
          <Text style={styles.patientLabel}>{t("patientText")}:</Text>
          <View style={styles.patientButtons}>
            {patients.map((patient) => (
              <Pressable
                key={patient.userId}
                style={[
                  styles.patientButton,
                  selectedPatient?.userId === patient.userId &&
                    styles.selectedPatient,
                ]}
                onPress={() => setSelectedPatient(patient)}
              >
                <Text
                  style={
                    selectedPatient?.userId === patient.userId
                      ? styles.selectedPatientText
                      : styles.patientButtonText
                  }
                >
                  {patient.name || t("noNameGiven")}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {selectedPatient && (
          <View style={styles.patientInfo}>
            <Text style={styles.patientDetail}>
              {t("namePatient", {
                interpolateMessage: selectedPatient?.name || t("unknown"),
              })}
            </Text>
            <Text style={styles.patientDetail}>
              {getAgeText(selectedPatient?.age || "N/A")}
            </Text>
            {selectedPatient.conditions &&
              selectedPatient.conditions.length > 0 && (
                <Text style={styles.patientDetail}>
                  {t("conditions")}: {selectedPatient?.conditions?.join(", ")}
                </Text>
              )}
          </View>
        )}
      </View>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("medicationText")}:</Text>
          {!medication && (
            <Searchbar
              style={styles.input}
              value={searchValue}
              placeholder={t("medicationPlaceholder")}
              onChangeText={setSearchValue}
              onIconPress={handleSearchMedication}
              autoCorrect={false}
              autoCapitalize="none"
              onSubmitEditing={handleSearchMedication}
            />
          )}
          {medication && (
            <ButtonComponent
              handlePress={() => {
                setMedication(null);
                setSearchValue("");
                setSearchMedicationsList([]);
              }}
              children={
                <View style={styles.clearMedicationChildren}>
                  <Text style={styles.clearMedicationText}>X</Text>
                  <Text style={styles.clearMedicationText}>
                    {medication?.name || t("unknown")}
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
                  <ButtonComponent
                    key={(medication._id as unknown as string) || index}
                    label={medication.name || t("unknown")}
                    handlePress={() => {
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
                );
              })}
          </ScrollView>
        </View>

        <View style={styles.doseContainer}>
          <View style={styles.doseInputGroup}>
            <Text style={styles.label}>{t("dosage")}:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              underlineColor="#00a69d"
              activeUnderlineColor="#00a69d"
              value={dose}
              onChangeText={setDose}
              label={interpolateMessage(t("dosagePlaceholder"), ["100 "])}
            />
          </View>

          <View style={styles.dosageTypeGroup}>
            <Text style={styles.label}>{t("type")}:</Text>
            <View style={styles.dosageButtons}>
              {dosageTypes.map((type, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.dosageButton,
                    dosageType === type && styles.selectedDosageButton,
                  ]}
                  onPress={() => setDosageType(type)}
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
          <Text style={styles.label}>{t("daysText")}:</Text>
          <View style={styles.daysContainer}>
            {Object.entries(daysOfWeek).map(([key, day], index) => (
              <ButtonComponent
                label={day}
                replaceStyles={{
                  button: styles.dayButton,
                  textButton: Object.values(selectedDays || {}).includes(day)
                    ? styles.selectedDayText
                    : styles.dayButtonText,
                }}
                handlePress={() => toggleDay(key as DayOfWeek)}
                forceReplaceStyles
                key={index}
              />
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("hour")}:</Text>
          {Platform.OS !== "web" && (
            <ButtonComponent
              label={time.toTimeString().slice(0, 5)}
              handlePress={() => setShowTimePicker(true)}
              replaceStyles={{
                button: styles.timeButton,
                textButton: styles.timeButtonText,
              }}
              forceReplaceStyles
              touchableOpacity
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
              style={styles.timeButton}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("intervalHours")}:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            underlineColor="#00a69d"
            activeUnderlineColor="#00a69d"
            value={intervalHours ? intervalHours.toString() : ""}
            onChangeText={(text) => setIntervalHours(Number(text))}
            label={t("intervalHoursPlaceholder")}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("stock")}:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            underlineColor="#00a69d"
            activeUnderlineColor="#00a69d"
            value={stock ? stock.toString() : ""}
            onChangeText={(text) => setStock(Number(text))}
            label={t("stockPlaceholder")}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("urgencyText")}:</Text>
          <View style={styles.urgencyButtons}>
            {Object.entries(
              JSON.parse(t("urgency")) as Record<UrgencyType, string>,
            ).map(([key, label]) => (
              <Pressable
                key={key}
                style={[
                  styles.urgencyButton,
                  Object.values(urgency)[0] === label &&
                    styles.selectedUrgencyButton,
                ]}
                onPress={() => setUrgency({ [key as UrgencyType]: label })}
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

        <ButtonComponent
          label={["+", t("addSchedule")].join(" ")}
          handlePress={handleAddSchedule}
          replaceStyles={{
            button: styles.addButton,
            textButton: styles.addButtonText,
          }}
          forceReplaceStyles
          touchableOpacity
          disabled={
            !medication ||
            !dose ||
            !(Object.keys(selectedDays || {}).length > 0) ||
            intervalHours <= 0 ||
            !urgency
          }
        />
      </ScrollView>
    </ScrollView>
  );
};

export default MedicationScheduler;
