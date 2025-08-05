import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert, Image, TouchableOpacity } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  List,
  RadioButton,
  Snackbar,
} from "react-native-paper";
import { useLanguage } from "@context/LanguageContext";
import { useUserContext } from "@context/UserContext";
import HeaderComponent from "@components/common/Header";
import CardComponent from "@components/Home/Card";
import { getRouteAPI, fetchOptions, PAST_ARR } from "@utils";
import {
  TypeBodyGetUserPatients,
  ResponseGetUserPatients,
  TypeBodyGetUserMedications,
  ResponseGetUserMedications,
  TypeBodyGetAllMedications,
  ResponseGetAllMedications,
} from "@typesAPI";
import { stylesPillboxSettings as styles } from "@styles/screens/stylesPillboxSettings";

/**
 * Props interface for PillboxSettings component
 */
interface PillboxSettingsProps {}

/**
 * Interface representing a time slot for medication administration
 * @interface TimeSlot
 * @property {string} startTime - Start time in HH:MM format (24 hours)
 * @property {number} intervalHours - Interval between doses in hours
 */
interface TimeSlot {
  startTime: string;
  intervalHours: number;
}

/**
 * Interface representing a medication compartment in the pillbox
 * @interface Compartment
 * @property {number} id - Unique identifier for the compartment (1-10)
 * @property {string} medication - Name of the medication stored in this compartment
 * @property {string} dosage - Dosage information (e.g., "2 pills", "1 gram")
 * @property {TimeSlot[]} timeSlots - Array of time slots for medication administration
 */
interface Compartment {
  id: number;
  medication: string;
  dosage: string;
  timeSlots: TimeSlot[];
}

/**
 * Interface representing a patient that can be assigned to the pillbox
 * @interface Patient
 * @property {string} id - Unique identifier for the patient (userId)
 * @property {string} name - Full name of the patient
 * @property {string} [role] - Optional role (e.g., "patient", "caregiver")
 */
interface Patient {
  id: string;
  name: string;
  role?: string;
}

/**
 * Interface representing a saved pillbox configuration for a patient
 * @interface SavedPillboxConfig
 * @property {string} patientId - ID of the patient
 * @property {string} pillboxId - ID of the assigned pillbox device
 * @property {Compartment[]} compartments - Configured compartments
 * @property {Date} lastUpdated - Last update timestamp
 */
interface SavedPillboxConfig {
  patientId: string;
  pillboxId: string;
  compartments: Compartment[];
  lastUpdated: Date;
}

/**
 * PillboxSettings Screen Component
 *
 * This component provides an interface for configuring a smart pillbox device.
 * It allows users to:
 * - Select a patient from their assigned patients list
 * - Configure up to 10 medication compartments
 * - Set medication names and dosages for each compartment
 * - Send the configuration to a physical pillbox device via WebSocket
 *
 * The component communicates with a pillbox device at IP 192.168.4.1 using WebSocket
 * protocol with JSON payload containing compartment configurations.
 *
 * @component
 * @returns {JSX.Element} The rendered pillbox configuration screen
 *
 * @example
 * <PillboxSettings />
 */
const PillboxSettings: React.FC<PillboxSettingsProps> = () => {
  const { isLoggedIn, userData } = useUserContext();
  const { t } = useLanguage();

  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [pillboxId, setPillboxId] = useState<string>("");
  const [savedConfigs, setSavedConfigs] = useState<SavedPillboxConfig[]>([]);
  const [showPillboxIdInput, setShowPillboxIdInput] = useState<boolean>(false);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [allMedications, setAllMedications] = useState<any[]>([]);
  const [medicationSuggestions, setMedicationSuggestions] = useState<{
    [key: number]: string[];
  }>({});
  const [showSuggestions, setShowSuggestions] = useState<{
    [key: number]: boolean;
  }>({});
  const [loadingMedications, setLoadingMedications] = useState<boolean>(false);
  const [validMedications, setValidMedications] = useState<{
    [key: number]: boolean;
  }>({});
  const [compartments, setCompartments] = useState<Compartment[]>(
    Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      medication: "",
      dosage: "",
      timeSlots: [],
    })),
  );

  /**
   * Shows a Snackbar with the specified message
   * @function showSnackbar
   * @param {string} message - The message to display
   */
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  /**
   * Validates that input contains only numbers
   * @function validateNumericInput
   * @param {string} value - The input value to validate
   * @returns {string} The validated numeric value
   */
  const validateNumericInput = (value: string): string => {
    // Remove any non-numeric characters
    return value.replace(/[^0-9]/g, "");
  };

  /**
   * Formats time input automatically with colon separator
   * @function formatTimeInput
   * @param {string} value - The input value to format
   * @returns {string} The formatted time value (HH:MM)
   */
  const formatTimeInput = (value: string): string => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");

    // Limit to 4 digits maximum (HHMM)
    const limitedValue = numericValue.substring(0, 4);

    // Add colon after 2 digits if we have more than 2 digits
    if (limitedValue.length >= 3) {
      return limitedValue.substring(0, 2) + ":" + limitedValue.substring(2);
    }

    return limitedValue;
  };

  /**
   * Loads all medications from the API for autocomplete suggestions
   * @async
   * @function loadAllMedications
   * @returns {Promise<void>}
   */
  const loadAllMedications = async () => {
    try {
      setLoadingMedications(true);

      const response = await fetch(
        getRouteAPI("/getAllMedications"),
        fetchOptions<TypeBodyGetAllMedications>("POST", {
          onlyGetTheseColumns: ["name", "name_es"],
        }),
      );

      if (response.ok) {
        const data: ResponseGetAllMedications = await response.json();

        if (data.medications && data.medications.length > 0) {
          setAllMedications(data.medications);
        } else {
          setAllMedications([]);
        }
      } else {
        setAllMedications([]);
      }
    } catch (error) {
      setAllMedications([]);
    } finally {
      setLoadingMedications(false);
    }
  };

  /**
   * Filters medications based on search term for autocomplete
   * @function filterMedications
   * @param {string} searchTerm - The search term to filter by
   * @returns {string[]} Array of filtered medication names
   */
  const filterMedications = (searchTerm: string): string[] => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const normalizedSearch = searchTerm.toLowerCase().trim();

    const filtered = allMedications
      .filter((med) => {
        const name = med.name?.toLowerCase() || "";
        const nameEs = med.name_es?.toLowerCase() || "";
        const matches =
          name.includes(normalizedSearch) || nameEs.includes(normalizedSearch);
        return matches;
      })
      .map((med) => med.name || med.name_es || "")
      .filter((name) => name.length > 0)
      .slice(0, 5); // Limit to 5 suggestions

    return filtered;
  };

  /**
   * Checks if a medication name is valid (exists in the medications list)
   * @function isValidMedication
   * @param {string} medicationName - The medication name to validate
   * @returns {boolean} True if the medication is valid
   */
  const isValidMedication = (medicationName: string): boolean => {
    if (!medicationName.trim()) return false;

    return allMedications.some(
      (med) =>
        (med.name && med.name.toLowerCase() === medicationName.toLowerCase()) ||
        (med.name_es &&
          med.name_es.toLowerCase() === medicationName.toLowerCase()),
    );
  };

  /**
   * Handles medication input change with autocomplete
   * @function handleMedicationInputChange
   * @param {number} compartmentId - The compartment ID
   * @param {string} value - The input value
   */
  const handleMedicationInputChange = (
    compartmentId: number,
    value: string,
  ) => {
    updateCompartment(compartmentId, "medication", value);

    // Check if medication is valid
    const isValid = isValidMedication(value);
    setValidMedications({ ...validMedications, [compartmentId]: isValid });

    // Update suggestions if we have enough characters
    if (value.length >= 2) {
      // Try real filtering first
      const realSuggestions = filterMedications(value);

      // If no real suggestions, use test data
      const testSuggestions = [
        "Paracetamol 500mg",
        "Ibuprofeno 400mg",
        "Aspirina 100mg",
        "Amoxicilina 500mg",
        "Omeprazol 20mg",
      ].filter((med) => med.toLowerCase().includes(value.toLowerCase()));

      const suggestions =
        realSuggestions.length > 0 ? realSuggestions : testSuggestions;

      setMedicationSuggestions({
        ...medicationSuggestions,
        [compartmentId]: suggestions,
      });
      setShowSuggestions({
        ...showSuggestions,
        [compartmentId]: suggestions.length > 0,
      });
    } else {
      setShowSuggestions({ ...showSuggestions, [compartmentId]: false });
      setMedicationSuggestions({
        ...medicationSuggestions,
        [compartmentId]: [],
      });
    }
  };

  /**
   * Handles selecting a medication from suggestions
   * @function selectMedicationSuggestion
   * @param {number} compartmentId - The compartment ID
   * @param {string} medicationName - The selected medication name
   */
  const selectMedicationSuggestion = (
    compartmentId: number,
    medicationName: string,
  ) => {
    updateCompartment(compartmentId, "medication", medicationName);
    setValidMedications({ ...validMedications, [compartmentId]: true });
    setShowSuggestions({ ...showSuggestions, [compartmentId]: false });
    setMedicationSuggestions({ ...medicationSuggestions, [compartmentId]: [] });
  };

  /**
   * Loads the list of patients assigned to the current user
   * Fetches patient data from the API and updates the patients state
   * Shows error alerts if the request fails
   *
   * @async
   * @function loadPatients
   * @returns {Promise<void>}
   */
  const loadPatients = async () => {
    if (!userData?.userId) {
      console.log("No userData available");
      return;
    }

    try {
      console.log("Loading patients for user:", userData.userId);

      const response = await fetch(
        getRouteAPI("/getUserPatients"),
        fetchOptions<TypeBodyGetUserPatients>("POST", {
          userId: userData.userId,
        }),
      );

      if (response.ok) {
        const data: ResponseGetUserPatients = await response.json();

        if (data.patients && data.patients.length > 0) {
          const patientsData: Patient[] = data.patients.map((user) => ({
            id: user.userId,
            name: user.name,
            role: user.role,
          }));

          console.log("Loaded patients:", patientsData);
          setPatients(patientsData);
        } else {
          console.log("No patients found for user");
          setPatients([]);
        }
      } else {
        const errorData = await response.json();
        console.error("Error response from API:", errorData);
        Alert.alert(t("error"), t("couldNotConnectToPillbox"));
        setPatients([]);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      Alert.alert(t("error"), t("couldNotConnectToPillbox"));
      setPatients([]);
    }
  };

  /**
   * Loads medications for the selected patient and auto-fills compartments
   * Fetches medication data from the API and populates the compartments
   * with the patient's current medication regimen
   *
   * @async
   * @function loadPatientMedications
   * @param {string} patientId - The ID of the patient whose medications to load
   * @returns {Promise<void>}
   */
  const loadPatientMedications = async (patientId: string) => {
    if (!patientId) {
      console.log("No patient ID provided");
      return;
    }

    try {
      console.log("Loading medications for patient:", patientId);

      const response = await fetch(
        getRouteAPI("/getUserMedications"),
        fetchOptions<TypeBodyGetUserMedications>("POST", {
          userId: patientId,
        }),
      );

      if (response.ok) {
        const data: ResponseGetUserMedications = await response.json();

        if (data.medications && data.medications.length > 0) {
          console.log("Loaded medications:", data.medications);

          const updatedCompartments = compartments.map((comp, index) => {
            const medication = data.medications[index];
            if (medication) {
              return {
                ...comp,
                medication: medication.name || "",
                dosage: medication.dosage || `${medication.grams} grams` || "",
                timeSlots: [],
              };
            }
            return comp;
          });

          setCompartments(updatedCompartments);

          // Validate loaded medications
          const newValidMedications: { [key: number]: boolean } = {};
          updatedCompartments.forEach((comp) => {
            if (comp.medication.trim() !== "") {
              newValidMedications[comp.id] = isValidMedication(comp.medication);
            }
          });
          setValidMedications(newValidMedications);
        } else {
          console.log("No medications found for patient");
          const emptyCompartments = compartments.map((comp) => ({
            ...comp,
            medication: "",
            dosage: "",
            timeSlots: [],
          }));
          setCompartments(emptyCompartments);
        }
      } else {
        const errorData = await response.json();
        console.error("Error response from medications API:", errorData);
        Alert.alert(t("error"), t("verifyWifiConnection"));
      }
    } catch (error) {
      console.error("Error loading patient medications:", error);
      Alert.alert(t("error"), t("verifyWifiConnection"));
    }
  };

  useEffect(() => {
    if (isLoggedIn && userData) {
      loadPatients();
      loadSavedConfigs();
      loadAllMedications();
    }
  }, [isLoggedIn, userData]);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientData(selectedPatient);
    } else {
      resetForm();
    }
  }, [selectedPatient]);

  /**
   * Auto-saves configuration when compartments change
   */
  useEffect(() => {
    if (
      selectedPatient &&
      pillboxId &&
      compartments.some((comp) => comp.medication.trim() !== "")
    ) {
      // Debounce the save operation
      const timeoutId = setTimeout(() => {
        savePillboxConfig(selectedPatient, pillboxId, compartments);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [compartments, selectedPatient, pillboxId]);

  /**
   * Loads saved pillbox configurations from localStorage
   * @function loadSavedConfigs
   */
  const loadSavedConfigs = () => {
    try {
      const saved = localStorage.getItem("pillboxConfigs");
      if (saved) {
        const configs: SavedPillboxConfig[] = JSON.parse(saved);
        setSavedConfigs(configs);
      }
    } catch (error) {
      console.error("Error loading saved configs:", error);
    }
  };

  /**
   * Saves a pillbox configuration to localStorage
   * @function savePillboxConfig
   * @param {string} patientId - The patient ID
   * @param {string} pillboxId - The pillbox ID
   * @param {Compartment[]} compartments - The compartments configuration
   */
  const savePillboxConfig = (
    patientId: string,
    pillboxId: string,
    compartments: Compartment[],
  ) => {
    try {
      const newConfig: SavedPillboxConfig = {
        patientId,
        pillboxId,
        compartments,
        lastUpdated: new Date(),
      };

      const updatedConfigs = savedConfigs.filter(
        (config) => config.patientId !== patientId,
      );
      updatedConfigs.push(newConfig);

      setSavedConfigs(updatedConfigs);
      localStorage.setItem("pillboxConfigs", JSON.stringify(updatedConfigs));
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  /**
   * Removes a saved pillbox configuration
   * @function removePillboxConfig
   * @param {string} patientId - The patient ID
   */
  const removePillboxConfig = (patientId: string) => {
    try {
      const updatedConfigs = savedConfigs.filter(
        (config) => config.patientId !== patientId,
      );
      setSavedConfigs(updatedConfigs);
      localStorage.setItem("pillboxConfigs", JSON.stringify(updatedConfigs));
    } catch (error) {
      console.error("Error removing config:", error);
    }
  };

  /**
   * Loads patient data and saved configuration if exists
   * @function loadPatientData
   * @param {string} patientId - The patient ID
   */
  const loadPatientData = (patientId: string) => {
    // Check if there's a saved configuration for this patient
    const savedConfig = savedConfigs.find(
      (config) => config.patientId === patientId,
    );

    if (savedConfig) {
      // Load saved configuration
      setPillboxId(savedConfig.pillboxId);
      setCompartments(savedConfig.compartments);
      setShowPillboxIdInput(false);

      // Validate loaded medications
      const newValidMedications: { [key: number]: boolean } = {};
      savedConfig.compartments.forEach((comp) => {
        if (comp.medication.trim() !== "") {
          newValidMedications[comp.id] = isValidMedication(comp.medication);
        }
      });
      setValidMedications(newValidMedications);
    } else {
      // Load medications from API and show pillbox ID input
      loadPatientMedications(patientId);
      setPillboxId("");
      setShowPillboxIdInput(true);
    }
  };

  /**
   * Resets the form to initial state
   * @function resetForm
   */
  const resetForm = () => {
    const emptyCompartments = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      medication: "",
      dosage: "",
      timeSlots: [],
    }));
    setCompartments(emptyCompartments);
    setPillboxId("");
    setShowPillboxIdInput(false);
    setValidMedications({});
    setShowSuggestions({});
    setMedicationSuggestions({});
  };

  /**
   * Updates a specific field in a compartment
   *
   * @function updateCompartment
   * @param {number} id - The compartment ID to update
   * @param {keyof Omit<Compartment, "id">} field - The field to update ("medication", "dosage", or "timeSlots")
   * @param {string} value - The new value for the field
   */
  const updateCompartment = (
    id: number,
    field: keyof Omit<Compartment, "id">,
    value: string,
  ) => {
    setCompartments((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, [field]: value } : comp)),
    );
  };

  /**
   * Validates time format (HH:MM) and ensures valid hours and minutes
   *
   * @function isValidTimeFormat
   * @param {string} time - Time string to validate
   * @returns {boolean} True if format is valid
   */
  const isValidTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return false;
    }

    const [hours, minutes] = time.split(":").map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  /**
   * Adds a new time slot to a compartment
   *
   * @function addTimeSlot
   * @param {number} compartmentId - The compartment ID
   * @param {string} startTime - Start time in HH:MM format
   * @param {number} intervalHours - Interval between doses in hours
   */
  const addTimeSlot = (
    compartmentId: number,
    startTime: string,
    intervalHours: number,
  ) => {
    if (!isValidTimeFormat(startTime)) {
      Alert.alert(t("error"), t("invalidTimeFormat"));
      return;
    }

    if (intervalHours <= 0) {
      Alert.alert(t("error"), t("intervalMustBeGreaterThanZero"));
      return;
    }

    setCompartments((prev) =>
      prev.map((comp) =>
        comp.id === compartmentId
          ? {
              ...comp,
              timeSlots: [...comp.timeSlots, { startTime, intervalHours }],
            }
          : comp,
      ),
    );

    Alert.alert(t("success"), t("timeSlotAdded"));

    // Auto-save after adding time slot
    if (selectedPatient && pillboxId) {
      setTimeout(() => {
        const updatedCompartments = compartments.map((comp) =>
          comp.id === compartmentId
            ? {
                ...comp,
                timeSlots: [...comp.timeSlots, { startTime, intervalHours }],
              }
            : comp,
        );
        savePillboxConfig(selectedPatient, pillboxId, updatedCompartments);
      }, 100);
    }
  };

  /**
   * Removes a time slot from a compartment
   *
   * @function removeTimeSlot
   * @param {number} compartmentId - The compartment ID
   * @param {number} slotIndex - Index of the time slot to remove
   */
  const removeTimeSlot = (compartmentId: number, slotIndex: number) => {
    setCompartments((prev) =>
      prev.map((comp) =>
        comp.id === compartmentId
          ? {
              ...comp,
              timeSlots: comp.timeSlots.filter(
                (_, index) => index !== slotIndex,
              ),
            }
          : comp,
      ),
    );

    Alert.alert(t("success"), t("timeSlotRemoved"));

    // Auto-save after removing time slot
    if (selectedPatient && pillboxId) {
      setTimeout(() => {
        const updatedCompartments = compartments.map((comp) =>
          comp.id === compartmentId
            ? {
                ...comp,
                timeSlots: comp.timeSlots.filter(
                  (_, index) => index !== slotIndex,
                ),
              }
            : comp,
        );
        savePillboxConfig(selectedPatient, pillboxId, updatedCompartments);
      }, 100);
    }
  };

  /**
   * Extracts the numerical quantity of pills from a dosage string
   * Parses dosage text to extract the number of pills/tablets
   *
   * @function extractQuantityFromDosage
   * @param {string} dosage - The dosage string (e.g., "2 pills", "1 tablet")
   * @returns {number} The extracted quantity, defaults to 1 if no number found
   *
   * @example
   * extractQuantityFromDosage("2 pills") // returns 2
   * extractQuantityFromDosage("morning dose") // returns 1
   */
  const extractQuantityFromDosage = (dosage: string): number => {
    const match = dosage.match(/^(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 1;
  };

  /**
   * Sends pillbox configuration data to the physical device via WebSocket
   * Attempts to connect to the pillbox using WebSocket protocol with fallback support
   * Uses a timeout mechanism and provides detailed error handling
   *
   * @async
   * @function sendToPillbox
   * @param {any[]} pastillaData - Array of compartment data with id and cantidad properties
   * @returns {Promise<void>}
   *
   * @example
   * sendToPillbox([
   *   { id: 1, cantidad: 2 },
   *   { id: 3, cantidad: 1 }
   * ])
   */
  const sendToPillbox = async (pastillaData: any[]) => {
    setIsConnecting(true);

    // Prepare payload in the format expected by the pillbox device
    const payload = {
      pastilla: pastillaData.map((item) => {
        const compartment = compartments.find((comp) => comp.id === item.id);
        return {
          ...item,
          timeSlots: compartment?.timeSlots || [],
        };
      }),
    };

    console.log("Sending to pillbox via WebSocket:", JSON.stringify(payload));

    // WebSocket URLs for pillbox communication
    const wsUrls = [
      "ws://192.168.4.1:81", // Primary WebSocket endpoint
      "ws://192.168.4.1:80", // Fallback WebSocket endpoint
    ];

    // Try each WebSocket URL until one succeeds or all fail
    for (let i = 0; i < wsUrls.length; i++) {
      try {
        console.log(`Attempting WebSocket connection to: ${wsUrls[i]}`);

        // Create promise to handle WebSocket connection
        await new Promise<void>((resolve, reject) => {
          const ws = new WebSocket(wsUrls[i]);

          // Set up connection timeout
          const connectionTimeout = setTimeout(() => {
            ws.close();
            reject(new Error("Connection timeout"));
          }, 8000);

          // Handle WebSocket connection opening
          ws.onopen = () => {
            clearTimeout(connectionTimeout);
            console.log(`WebSocket connected to ${wsUrls[i]}`);

            // Send the payload
            ws.send(JSON.stringify(payload));
            console.log("Data sent via WebSocket:", JSON.stringify(payload));
          };

          // Handle incoming messages from pillbox
          ws.onmessage = (event) => {
            clearTimeout(connectionTimeout);
            console.log("Pillbox WebSocket response:", event.data);
            ws.close();
            setIsConnecting(false);

            showSnackbar(t("configurationSentSuccessfully"));
            resolve();
          };

          // Handle WebSocket errors
          ws.onerror = (error) => {
            clearTimeout(connectionTimeout);
            console.error(`WebSocket error at ${wsUrls[i]}:`, error);
            ws.close();
            reject(new Error("WebSocket connection failed"));
          };

          // Handle WebSocket connection close
          ws.onclose = (event) => {
            clearTimeout(connectionTimeout);
            console.log(
              `WebSocket closed for ${wsUrls[i]}:`,
              event.code,
              event.reason,
            );

            // If connection closed without success
            if (!event.wasClean) {
              reject(
                new Error(`WebSocket closed unexpectedly: ${event.reason}`),
              );
            }
          };
        });

        // If we reach here, the WebSocket succeeded
        return;
      } catch (error: any) {
        console.error(`Error with WebSocket ${wsUrls[i]}:`, error);

        // Handle errors only on the last attempt
        if (i === wsUrls.length - 1) {
          setIsConnecting(false);

          if (error.message.includes("timeout")) {
            Alert.alert(t("error"), t("connectionTimeout"));
          } else if (
            error.message.includes("Network") ||
            error.message.includes("WebSocket")
          ) {
            Alert.alert(t("error"), t("verifyPillboxConnection"));
          } else {
            Alert.alert(t("error"), t("couldNotEstablishConnection"));
          }
        }
        // Continue to next URL if not the last attempt
      }
    }
  };

  /**
   * Handles the save action for pillbox configuration
   * Validates that a patient is selected and at least one medication is configured
   * Shows a confirmation dialog with preview before sending to pillbox
   *
   * @function handleSave
   * @returns {void}
   */
  const handleSave = () => {
    if (!selectedPatient) {
      Alert.alert(t("error"), t("pleaseSelectPatient"));
      return;
    }

    if (!pillboxId.trim()) {
      Alert.alert(t("error"), t("pillboxIdRequired"));
      return;
    }

    const filledCompartments = compartments.filter(
      (comp) => comp.medication.trim() !== "",
    );

    if (filledCompartments.length === 0) {
      Alert.alert(t("error"), t("pleaseAddMedication"));
      return;
    }

    // Validate that all filled compartments have valid medications
    const invalidMedications = filledCompartments.filter(
      (comp) => !validMedications[comp.id],
    );

    if (invalidMedications.length > 0) {
      const compartmentNumbers = invalidMedications
        .map((comp) => comp.id)
        .join(", ");
      Alert.alert(
        t("error"),
        `Los compartimientos ${compartmentNumbers} contienen medicamentos no válidos. Por favor, selecciona medicamentos de la lista de sugerencias.`,
      );
      return;
    }

    // Validate that all filled compartments have at least one time slot
    const compartmentsWithoutSchedule = filledCompartments.filter(
      (comp) => comp.timeSlots.length === 0,
    );

    if (compartmentsWithoutSchedule.length > 0) {
      const compartmentNumbers = compartmentsWithoutSchedule
        .map((comp) => comp.id)
        .join(", ");
      Alert.alert(
        t("error"),
        `Los compartimientos ${compartmentNumbers} requieren al menos un horario de administración.`,
      );
      return;
    }

    // Save configuration
    savePillboxConfig(selectedPatient, pillboxId, compartments);

    const pastillaData = filledCompartments.map((comp) => ({
      id: comp.id,
      cantidad: extractQuantityFromDosage(comp.dosage),
    }));

    console.log("Paciente seleccionado:", selectedPatient);
    console.log("Pillbox ID:", pillboxId);
    console.log("Compartments saved:", compartments);
    console.log("Data to send:", pastillaData);

    const dataPreview = filledCompartments
      .map((comp) => {
        const quantity = extractQuantityFromDosage(comp.dosage);
        const pillText = quantity === 1 ? t("pill") : t("pills");
        let scheduleText = "";

        if (comp.timeSlots.length > 0) {
          const scheduleInfo = comp.timeSlots
            .map((slot) => `${slot.startTime} (cada ${slot.intervalHours}h)`)
            .join(", ");
          scheduleText = `\n   Horarios: ${scheduleInfo}`;
        }

        return `${t("compartment")} ${comp.id}: ${comp.medication} (${quantity} ${pillText})${scheduleText}`;
      })
      .join("\n\n");

    Alert.alert(
      t("confirmSend"),
      `${t("pillboxWillBeConfigured")}\n\n${t("pillboxId")}: ${pillboxId}\n\n${dataPreview}\n\n${t("continueQuestion")}`,
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("send"),
          onPress: () => {
            sendToPillbox(pastillaData);
            showSnackbar(t("configurationSavedInCapsy"));
          },
        },
      ],
    );
  };

  /**
   * Renders the pillbox management section
   * Shows pillbox ID input for new assignments or current pillbox info for existing ones
   *
   * @function renderPillboxManagement
   * @returns {JSX.Element} The pillbox management UI component
   */
  const renderPillboxManagement = () => {
    if (!selectedPatient) return null;

    const savedConfig = savedConfigs.find(
      (config) => config.patientId === selectedPatient,
    );
    const patientName =
      patients.find((p) => p.id === selectedPatient)?.name || "Paciente";

    return (
      <Card style={styles.patientCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t("pillboxManagement")}</Text>

          {savedConfig ? (
            // Show existing pillbox configuration
            <View>
              <Text style={styles.sectionSubtitle}>
                {t("pillboxAssignedTo")} {patientName}
              </Text>

              <View
                style={[
                  styles.patientItem,
                  {
                    backgroundColor: "#f0f8f0",
                    borderRadius: 8,
                    marginVertical: 8,
                  },
                ]}
              >
                <Text style={[styles.patientName, { color: "#2e7d32" }]}>
                  {t("pillboxId")}: {savedConfig.pillboxId}
                </Text>
                <Text style={[styles.intervalLabel, { marginLeft: 0 }]}>
                  {t("configuredOn")}:{" "}
                  {savedConfig.lastUpdated.toLocaleDateString()}
                </Text>
              </View>

              <Button
                mode="outlined"
                onPress={() => handleRemovePillbox(selectedPatient)}
                style={[styles.addTimeButton, { marginTop: 12 }]}
                buttonColor="#ffffff"
                textColor="#d32f2f"
              >
                {t("removePillbox")}
              </Button>
            </View>
          ) : (
            // Show pillbox ID input for new assignment
            <View>
              <Text style={styles.sectionSubtitle}>
                {t("assignPillboxTo")} {patientName}
              </Text>

              <TextInput
                style={styles.input}
                label={t("pillboxIdLabel")}
                value={pillboxId}
                onChangeText={setPillboxId}
                mode="outlined"
                placeholder={t("pillboxIdPlaceholder")}
                outlineColor="#ccc"
                activeOutlineColor="#60c4b4"
              />

              <Text style={styles.intervalLabel}>{t("pillboxIdHelp")}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  /**
   * Handles removing a pillbox assignment from a patient
   * @function handleRemovePillbox
   * @param {string} patientId - The patient ID
   */
  const handleRemovePillbox = (patientId: string) => {
    const patientName =
      patients.find((p) => p.id === patientId)?.name || "este paciente";

    Alert.alert(
      t("confirmRemoval"),
      t("confirmRemovalMessage").replace("{name}", patientName) +
        " " +
        t("allConfigurationWillBeLost"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("remove"),
          style: "destructive",
          onPress: () => {
            removePillboxConfig(patientId);
            resetForm();
            setShowPillboxIdInput(true);
          },
        },
      ],
    );
  };
  const renderPatientSelector = () => (
    <Card style={styles.patientCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>{t("selectPatient")}</Text>
        <Text style={styles.sectionSubtitle}>{t("selectPatientSubtitle")}</Text>

        <View style={styles.patientList}>
          {patients.map((patient) => (
            <View key={patient.id} style={styles.patientItem}>
              <RadioButton
                value={patient.id}
                status={
                  selectedPatient === patient.id ? "checked" : "unchecked"
                }
                onPress={() => setSelectedPatient(patient.id)}
                color="#60c4b4"
              />
              <Text style={styles.patientName}>{patient.name}</Text>
            </View>
          ))}
        </View>

        {patients.length === 0 && (
          <Text style={styles.noPatients}>
            {t("noPatientsAvailable")} {t("addPatientsFirst")}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  /**
   * Renders a form for configuring a single medication compartment
   * Displays compartment number, medication input, dosage input, and time scheduling
   * Shows pill count indicator when compartment has content
   *
   * @function renderCompartmentForm
   * @param {Compartment} compartment - The compartment data to render
   * @returns {JSX.Element} The compartment configuration form UI
   */
  const renderCompartmentForm = (compartment: Compartment) => {
    const quantity = compartment.dosage
      ? extractQuantityFromDosage(compartment.dosage)
      : 0;
    const hasContent = compartment.medication.trim() !== "";

    return (
      <View
        key={compartment.id}
        style={[
          styles.compartmentContainer,
          { overflow: "visible", zIndex: 1 },
        ]}
      >
        <Text style={styles.compartmentTitle}>
          {t("compartment")} {compartment.id}
          {hasContent && quantity > 0 && (
            <Text style={styles.quantityIndicator}>
              {" "}
              ({quantity} {quantity === 1 ? t("pill") : t("pills")})
            </Text>
          )}
        </Text>

        <View style={{ position: "relative", zIndex: 1 }}>
          <TextInput
            style={[
              styles.input,
              compartment.medication.trim() !== "" &&
              !validMedications[compartment.id]
                ? { borderColor: "#d32f2f", borderWidth: 2 }
                : compartment.medication.trim() !== "" &&
                    validMedications[compartment.id]
                  ? { borderColor: "#4CAF50", borderWidth: 2 }
                  : {},
            ]}
            label={t("medication")}
            value={compartment.medication}
            onChangeText={(value) =>
              handleMedicationInputChange(compartment.id, value)
            }
            mode="outlined"
            outlineColor={
              compartment.medication.trim() !== "" &&
              !validMedications[compartment.id]
                ? "#d32f2f"
                : compartment.medication.trim() !== "" &&
                    validMedications[compartment.id]
                  ? "#4CAF50"
                  : "#ccc"
            }
            activeOutlineColor={
              compartment.medication.trim() !== "" &&
              !validMedications[compartment.id]
                ? "#d32f2f"
                : compartment.medication.trim() !== "" &&
                    validMedications[compartment.id]
                  ? "#4CAF50"
                  : "#60c4b4"
            }
            onFocus={() => {
              // Show suggestions if we already have text
              if (compartment.medication.length >= 2) {
                const realSuggestions = filterMedications(
                  compartment.medication,
                );
                const testSuggestions = [
                  "Paracetamol 500mg",
                  "Ibuprofeno 400mg",
                  "Aspirina 100mg",
                  "Amoxicilina 500mg",
                  "Omeprazol 20mg",
                ].filter((med) =>
                  med
                    .toLowerCase()
                    .includes(compartment.medication.toLowerCase()),
                );

                const suggestions =
                  realSuggestions.length > 0
                    ? realSuggestions
                    : testSuggestions;
                setMedicationSuggestions({
                  ...medicationSuggestions,
                  [compartment.id]: suggestions,
                });
                setShowSuggestions({
                  ...showSuggestions,
                  [compartment.id]: suggestions.length > 0,
                });
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow selection
              setTimeout(() => {
                setShowSuggestions({
                  ...showSuggestions,
                  [compartment.id]: false,
                });
              }, 300);
            }}
          />

          {compartment.medication.trim() !== "" &&
            !validMedications[compartment.id] && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#d32f2f",
                  marginTop: 4,
                  marginLeft: 12,
                }}
              >
                Medicamento no válido. Selecciona uno de la lista.
              </Text>
            )}

          {compartment.medication.trim() !== "" &&
            validMedications[compartment.id] && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#4CAF50",
                  marginTop: 4,
                  marginLeft: 12,
                }}
              >
                ✓ Medicamento válido
              </Text>
            )}

          {/* Autocomplete dropdown */}
          {showSuggestions[compartment.id] &&
            medicationSuggestions[compartment.id] &&
            medicationSuggestions[compartment.id].length > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 60, // Positioned below the input
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  borderWidth: 2,
                  borderColor: "#21aae1",
                  borderRadius: 4,
                  maxHeight: 200,
                  zIndex: 9999,
                  elevation: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                }}
              >
                <Text
                  style={{
                    padding: 8,
                    backgroundColor: "#21aae1",
                    color: "white",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  Opciones disponibles (
                  {medicationSuggestions[compartment.id].length})
                </Text>
                {medicationSuggestions[compartment.id].map(
                  (suggestion: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        padding: 15,
                        borderBottomWidth:
                          index <
                          medicationSuggestions[compartment.id].length - 1
                            ? 1
                            : 0,
                        borderBottomColor: "#eee",
                        backgroundColor: "white",
                      }}
                      onPress={() => {
                        selectMedicationSuggestion(compartment.id, suggestion);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 16, color: "#333" }}>
                        📋 {suggestion}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}
        </View>

        <TextInput
          style={styles.input}
          label={t("dose")}
          value={compartment.dosage}
          onChangeText={(value) => {
            // Allow numbers and the word "pastillas" or "pills" or "grams"
            const isNumericOnly = /^[0-9]+$/.test(value);
            const hasValidText =
              /^[0-9]+\s*(pastillas?|pills?|grams?|mg|gramos?)$/i.test(value);

            if (value === "" || isNumericOnly || hasValidText) {
              updateCompartment(compartment.id, "dosage", value);
            }
          }}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#60c4b4"
          placeholder={t("dosePlaceholder")}
          keyboardType="numeric"
        />

        {renderTimeScheduleSection(compartment)}
      </View>
    );
  };

  /**
   * Renders the time schedule section for a compartment
   * Allows users to add, view, and remove time slots for medication administration
   *
   * @function renderTimeScheduleSection
   * @param {Compartment} compartment - The compartment data
   * @returns {JSX.Element} The time schedule UI component
   */
  const renderTimeScheduleSection = (compartment: Compartment) => {
    const [startTime, setStartTime] = useState<string>("");
    const [intervalHours, setIntervalHours] = useState<string>("8");
    const [isIntervalFocused, setIsIntervalFocused] = useState<boolean>(false);

    const handleAddTimeSlot = () => {
      const interval = parseInt(intervalHours, 10);
      addTimeSlot(compartment.id, startTime, interval);
      setStartTime("");
      setIntervalHours("8");
      setIsIntervalFocused(false);
    };

    const handleIntervalFocus = () => {
      if (!isIntervalFocused) {
        setIntervalHours("");
        setIsIntervalFocused(true);
      }
    };

    const handleIntervalChange = (value: string) => {
      const numericValue = validateNumericInput(value);
      setIntervalHours(numericValue);
      if (!isIntervalFocused) {
        setIsIntervalFocused(true);
      }
    };

    const handleTimeChange = (value: string) => {
      const formattedTime = formatTimeInput(value);
      setStartTime(formattedTime);
    };

    const handleIntervalBlur = () => {
      const numericValue = validateNumericInput(intervalHours);
      if (numericValue.trim() === "") {
        setIntervalHours("8");
        setIsIntervalFocused(false);
      } else {
        setIntervalHours(numericValue);
      }
    };

    return (
      <View style={styles.scheduleSection}>
        <Text style={styles.scheduleSectionTitle}>
          {t("scheduleAndTiming")}
        </Text>
        <Text style={styles.intervalLabel}>{t("schedulingRequired")}</Text>

        <TextInput
          style={styles.input}
          label={t("startTime")}
          value={startTime}
          onChangeText={handleTimeChange}
          mode="outlined"
          placeholder="08:00"
          keyboardType="numeric"
          maxLength={5}
          outlineColor="#ccc"
          activeOutlineColor="#60c4b4"
        />

        <TextInput
          style={styles.input}
          label={t("intervalHours")}
          value={intervalHours}
          onChangeText={handleIntervalChange}
          onFocus={handleIntervalFocus}
          onBlur={handleIntervalBlur}
          mode="outlined"
          placeholder="8"
          keyboardType="numeric"
          maxLength={2}
          outlineColor="#ccc"
          activeOutlineColor="#60c4b4"
        />

        <Button
          mode="outlined"
          onPress={handleAddTimeSlot}
          style={styles.addTimeButton}
          buttonColor="#ffffff"
          textColor="#60c4b4"
          disabled={!startTime || !intervalHours}
        >
          {t("addTimeSlot")}
        </Button>

        {compartment.timeSlots.map((timeSlot, index) => (
          <View key={index} style={styles.timeSlotContainer}>
            <Text style={styles.timeSlotText}>
              {timeSlot.startTime} (cada {timeSlot.intervalHours} horas)
            </Text>
            <TouchableOpacity
              style={styles.removeTimeButton}
              onPress={() => removeTimeSlot(compartment.id, index)}
            >
              <Text style={styles.removeTimeText}>{t("removeTime")}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.intervalLabel}>{t("timeFormat")}</Text>
      </View>
    );
  };

  return (
    <>
      <HeaderComponent />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <CardComponent title="Capsy" description={t("pillboxDescription")} />

          {/* Pillbox illustration image */}
          <View style={styles.imageContainer}>
            <Image source={PAST_ARR} style={styles.image} />
          </View>

          {renderPatientSelector()}

          {renderPillboxManagement()}

          <Text style={styles.formTitle}>{t("pillboxConfiguration")}</Text>

          {compartments.map(renderCompartmentForm)}

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            buttonColor="#21aae1"
            textColor="#FFFFFF"
            loading={isConnecting}
            disabled={isConnecting}
          >
            {isConnecting ? t("connecting") : t("sendToPillbox")}
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{
          backgroundColor: "#4CAF50",
          marginBottom: 20,
        }}
        action={{
          label: t("close"),
          onPress: () => setSnackbarVisible(false),
          textColor: "#FFFFFF",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 16 }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </>
  );
};

export default PillboxSettings;
