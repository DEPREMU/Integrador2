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
import { useWebSocket } from "@context/WebSocketContext";
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
  TypeBodySavePillboxConfig,
  ResponseSavePillboxConfig,
  TypeBodyGetPillboxConfig,
  ResponseGetPillboxConfig,
  TypeBodyDeletePillboxConfig,
  ResponseDeletePillboxConfig,
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
 * @property {string} userId - ID of the caregiver/user
 * @property {string} patientId - ID of the patient
 * @property {string} pillboxId - ID of the assigned pillbox device
 * @property {Compartment[]} compartments - Configured compartments
 * @property {Date} lastUpdated - Last update timestamp
 */
interface SavedPillboxConfig {
  userId: string;
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
  console.log(
    "🚀 PillboxSettings component loaded at:",
    new Date().toISOString(),
  );

  // Get contexts with error handling
  let isLoggedIn = false;
  let userData = null;
  let sendMessage: any = (...args: any[]) => {
    console.log("sendMessage not available:", args);
  };
  let t: any = (key: string) => key;

  try {
    const userContext = useUserContext();
    isLoggedIn = userContext?.isLoggedIn || false;
    userData = userContext?.userData || null;
    console.log("UserContext loaded:", {
      isLoggedIn,
      userData: userData?.userId,
    });
  } catch (error) {
    console.error("Error accessing UserContext:", error);
  }

  try {
    const webSocketContext = useWebSocket();
    sendMessage =
      webSocketContext?.sendMessage ||
      ((...args: any[]) => {
        console.log("sendMessage not available:", args);
      });
  } catch (error) {
    console.error("Error accessing WebSocketContext:", error);
  }

  try {
    const languageContext = useLanguage();
    t = languageContext?.t || ((key: any) => key as string);
  } catch (error) {
    console.error("Error accessing LanguageContext:", error);
  }

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
  const [loadingPatientData, setLoadingPatientData] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [validMedications, setValidMedications] = useState<{
    [key: number]: boolean;
  }>({});

  // States for time schedule section - moved to component level to avoid hooks rule violation
  const [timeScheduleStates, setTimeScheduleStates] = useState<{
    [key: number]: {
      startTime: string;
      intervalHours: string;
      isIntervalFocused: boolean;
    };
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
      console.log("Loading medications for autocomplete (optimized)...");

      const response = await fetch(
        getRouteAPI("/getAllMedications"),
        fetchOptions<TypeBodyGetAllMedications>("POST", {
          onlyGetTheseColumns: ["name", "name_es"],
        }),
      );

      if (response.ok) {
        const data: ResponseGetAllMedications = await response.json();

        if (data.medications && data.medications.length > 0) {
          console.log(
            `Loaded ${data.medications.length} medications for autocomplete`,
          );
          // Procesar medicamentos en chunks pequeños para evitar bloqueo del UI
          const processInChunks = (
            medications: any[],
            chunkSize: number = 100,
          ) => {
            const chunks = [];
            for (let i = 0; i < medications.length; i += chunkSize) {
              chunks.push(medications.slice(i, i + chunkSize));
            }
            return chunks;
          };

          const chunks = processInChunks(data.medications);
          let processedMedications: any[] = [];

          // Procesar chunks con delay para no bloquear el UI
          for (let i = 0; i < chunks.length; i++) {
            processedMedications = processedMedications.concat(chunks[i]);
            if (i % 10 === 0) {
              // Cada 10 chunks, dar tiempo al UI
              await new Promise((resolve) => setTimeout(resolve, 10));
            }
          }

          setAllMedications(processedMedications);
        } else {
          setAllMedications([]);
        }
      } else {
        console.error("Failed to load all medications");
        setAllMedications([]);
      }
    } catch (error) {
      console.error("Error loading all medications:", error);
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

    // If medications not loaded yet, trigger lazy load but return loading message
    if (allMedications.length === 0 && !loadingMedications) {
      console.log(
        "Triggering lazy load of medications for search:",
        searchTerm,
      );
      // Trigger load asynchronously without blocking UI
      loadAllMedications()
        .then(() => {
          console.log("Medications loaded successfully");
        })
        .catch((error) => {
          console.error("Failed to load medications:", error);
        });
      return ["Cargando medicamentos..."]; // Show loading message
    }

    // If still loading, show loading message
    if (loadingMedications) {
      return ["Cargando medicamentos..."];
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

    // If allMedications is empty, consider all medications as valid
    // This prevents blocking users when medications haven't loaded yet
    if (allMedications.length === 0) return true;

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
      console.log("No userData available for loading patients");
      setPatients([]);
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

          console.log("Successfully loaded patients:", patientsData.length);
          setPatients(patientsData);
        } else {
          console.log("No patients found for user");
          setPatients([]);
        }
      } else {
        const errorData = await response.json();
        console.error("Error response from getUserPatients API:", errorData);
        setPatients([]);
        // Don't show alert here, just log the error
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
      // Don't show alert here, just log the error
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
    const initializeData = async () => {
      if (!isLoggedIn || !userData) {
        return;
      }

      try {
        setInitializationError("");

        // Load only essential data - don't load all medications at startup
        await loadPatients();
        // Removed loadAllMedications() to prevent UI freeze

        setIsInitialized(true);
      } catch (error) {
        console.error("Error during initialization:", error);
        setInitializationError(`Error de inicialización: ${error}`);
        setIsInitialized(true); // Set to true anyway to show the interface
      }
    };

    initializeData();
  }, [isLoggedIn, userData]);

  // Load saved configs after patients are loaded
  useEffect(() => {
    // No longer needed since we load configs individually per patient
  }, [patients, userData]);

  useEffect(() => {
    console.log("🔄 Patient selection changed:", selectedPatient);
    const handlePatientChange = async () => {
      try {
        if (selectedPatient) {
          console.log(`Patient selected: ${selectedPatient}`);
          await loadPatientData(selectedPatient);
        } else {
          console.log("No patient selected, resetting form");
          resetForm();
        }
      } catch (error) {
        console.error("Error in handlePatientChange:", error);
        resetForm();
      }
    };

    handlePatientChange();
  }, [selectedPatient]); // Removed savedConfigs and allMedications dependencies

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
      const timeoutId = setTimeout(async () => {
        await savePillboxConfig(selectedPatient, pillboxId, compartments);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [compartments, selectedPatient, pillboxId]);

  /**
   * Loads saved pillbox configuration for a specific patient from the database
   * @function loadPillboxConfig
   * @param {string} patientId - The patient ID to load configuration for
   * @returns {Promise<SavedPillboxConfig | null>} The configuration or null if not found
   */
  const loadPillboxConfig = async (
    patientId: string,
  ): Promise<SavedPillboxConfig | null> => {
    if (!userData?.userId || !patientId) {
      return null;
    }

    try {
      console.log(`Loading pillbox config for patient: ${patientId}`);

      const response = await fetch(
        getRouteAPI("/getPillboxConfig"),
        fetchOptions<TypeBodyGetPillboxConfig>("POST", {
          userId: userData.userId,
          patientId: patientId,
        }),
      );

      if (response.ok) {
        const data: ResponseGetPillboxConfig = await response.json();
        if (data.config) {
          // Convert lastUpdated string back to Date object
          const configWithDate = {
            ...data.config,
            lastUpdated: new Date(data.config.lastUpdated),
          };
          console.log(`Successfully loaded config for patient: ${patientId}`);
          return configWithDate;
        }
      } else {
        console.log(`No config found for patient: ${patientId}`);
      }
    } catch (error) {
      console.error(`Error loading config for patient ${patientId}:`, error);
    }

    return null;
  };

  /**
   * Saves a pillbox configuration to the database
   * @function savePillboxConfig
   * @param {string} patientId - The patient ID
   * @param {string} pillboxId - The pillbox ID
   * @param {Compartment[]} compartments - The compartments configuration
   */
  const savePillboxConfig = async (
    patientId: string,
    pillboxId: string,
    compartments: Compartment[],
  ) => {
    if (!userData?.userId) {
      console.error("No user ID available for saving config");
      showSnackbar("Error: Usuario no identificado");
      return;
    }

    try {
      const response = await fetch(
        getRouteAPI("/savePillboxConfig"),
        fetchOptions<TypeBodySavePillboxConfig>("POST", {
          userId: userData.userId,
          patientId,
          pillboxId,
          compartments,
        }),
      );

      if (response.ok) {
        const data: ResponseSavePillboxConfig = await response.json();
        if (data.success && data.config) {
          // Convert lastUpdated string back to Date object
          const configWithDate = {
            ...data.config,
            lastUpdated: new Date(data.config.lastUpdated),
          };

          // Update local state
          setSavedConfigs((prev) => {
            const filtered = prev.filter(
              (config) => config.patientId !== patientId,
            );
            return [...filtered, configWithDate];
          });
        } else {
          console.error("Error saving config:", data.error);
          showSnackbar("Error al guardar la configuración");
        }
      } else {
        console.error("Error response from save config API");
        showSnackbar("Error al guardar la configuración");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      showSnackbar("Error al guardar la configuración");
    }
  };

  /**
   * Removes a saved pillbox configuration from the database
   * @function removePillboxConfig
   * @param {string} patientId - The patient ID
   */
  const removePillboxConfig = async (patientId: string) => {
    console.log("🗑️ removePillboxConfig called with patient:", patientId);

    console.log("🗑️ Starting removal process for patient:", patientId);
    console.log("👤 Current userData:", userData?.userId);
    console.log("📊 Current savedConfigs:", savedConfigs);
    console.log("🔍 Selected patient:", selectedPatient);

    if (!userData?.userId) {
      console.error("❌ No user ID available for removing config");
      showSnackbar("Error: Usuario no identificado");
      return;
    }

    // Check if config exists before deletion
    const existingConfig = savedConfigs.find(
      (config) => config.patientId === patientId,
    );
    console.log("🔍 Existing config found:", existingConfig);

    try {
      console.log("🌐 Making API call to delete pillbox config...");
      console.log("📤 Request data:", {
        userId: userData.userId,
        patientId: patientId,
        url: getRouteAPI("/deletePillboxConfig"),
      });

      const response = await fetch(
        getRouteAPI("/deletePillboxConfig"),
        fetchOptions<TypeBodyDeletePillboxConfig>("POST", {
          userId: userData.userId,
          patientId,
        }),
      );

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (response.ok) {
        const data: ResponseDeletePillboxConfig = await response.json();
        console.log("📊 API Response received:", JSON.stringify(data, null, 2));

        if (data.success) {
          console.log("✅ API confirmed successful deletion from database");

          // Update local state - remove from saved configs
          console.log("🔄 Updating local savedConfigs state...");
          console.log(
            "📋 Current savedConfigs before update:",
            savedConfigs.map((c) => ({
              patientId: c.patientId,
              pillboxId: c.pillboxId,
            })),
          );

          setSavedConfigs((prev) => {
            const newConfigs = prev.filter(
              (config) => config.patientId !== patientId,
            );
            console.log("📋 Configs before filtering:", prev.length);
            console.log("📋 Configs after filtering:", newConfigs.length);
            console.log(
              "📋 Filtered configs details:",
              newConfigs.map((c) => ({
                patientId: c.patientId,
                pillboxId: c.pillboxId,
              })),
            );
            return newConfigs;
          });

          // If the removed config is for the currently selected patient, reset everything
          if (selectedPatient === patientId) {
            console.log(
              "🔄 Current patient matches removed patient, resetting form...",
            );

            // Clear pillbox ID
            console.log("🆔 Clearing pillbox ID from:", pillboxId, "to empty");
            setPillboxId("");

            // Reset all compartments to empty state
            console.log("💊 Resetting all compartments...");
            const emptyCompartments = Array.from(
              { length: 10 },
              (_, index) => ({
                id: index + 1,
                medication: "",
                dosage: "",
                timeSlots: [],
              }),
            );
            setCompartments(emptyCompartments);

            // Clear validation states
            console.log("✅ Clearing validation states...");
            setValidMedications({});
            setShowSuggestions({});
            setMedicationSuggestions({});
            setTimeScheduleStates({});

            // Show pillbox ID input for new assignment
            console.log("📝 Showing pillbox ID input...");
            setShowPillboxIdInput(true);

            console.log("🎯 Form reset completed for current patient");

            // Force re-render by updating a state
            console.log("🔄 Forcing component re-render...");
            setLoadingPatientData(false);
          } else {
            console.log(
              "ℹ️ Removed patient is not currently selected, keeping current form",
            );
          }

          showSnackbar("Configuración eliminada exitosamente");
          console.log("🎉 Removal process completed successfully");

          // Log final state after a delay to see the actual update
          setTimeout(() => {
            console.log("🔍 Final state check:");
            console.log("  - pillboxId:", pillboxId);
            console.log("  - showPillboxIdInput:", showPillboxIdInput);
            console.log("  - savedConfigs count:", savedConfigs.length);
          }, 1000);
        } else {
          console.error("❌ API returned error:", data.error);
          showSnackbar(
            "Error al eliminar la configuración: " +
              (data.error?.message || "Error desconocido"),
          );
        }
      } else {
        const errorText = await response.text();
        console.error("❌ API response not OK:");
        console.error("  - Status:", response.status);
        console.error("  - Status Text:", response.statusText);
        console.error("  - Response body:", errorText);
        showSnackbar(`Error al eliminar la configuración (${response.status})`);
      }
    } catch (error) {
      console.error("❌ Exception during removal:", error);
      console.error("❌ Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
      showSnackbar(
        "Error al eliminar la configuración: " +
          (error instanceof Error ? error.message : "Error desconocido"),
      );
    }
  };

  /**
   * Loads patient data and saved configuration if exists
   * @function loadPatientData
   * @param {string} patientId - The patient ID
   */
  const loadPatientData = async (patientId: string) => {
    setLoadingPatientData(true);

    try {
      console.log(`Loading data for patient: ${patientId}`);

      // Load configuration for this specific patient
      const savedConfig = await loadPillboxConfig(patientId);

      if (savedConfig) {
        console.log(`Found saved config for patient: ${patientId}`);

        // Load saved configuration
        setPillboxId(savedConfig.pillboxId);
        setCompartments(savedConfig.compartments);
        setShowPillboxIdInput(false);

        // Update savedConfigs state to include this config
        setSavedConfigs((prev) => {
          const filtered = prev.filter(
            (config) => config.patientId !== patientId,
          );
          return [...filtered, savedConfig];
        });

        // Validate loaded medications
        const newValidMedications: { [key: number]: boolean } = {};
        savedConfig.compartments.forEach((comp) => {
          if (comp.medication.trim() !== "") {
            newValidMedications[comp.id] = isValidMedication(comp.medication);
          }
        });
        setValidMedications(newValidMedications);
      } else {
        console.log(
          `No saved config found for patient: ${patientId}, loading medications from API`,
        );

        // No saved config, load medications from API and show pillbox ID input
        await loadPatientMedications(patientId);
        setPillboxId("");
        setShowPillboxIdInput(true);
      }
    } catch (error) {
      console.error("Error in loadPatientData:", error);
      // Reset form on error to prevent white screen
      resetForm();
    } finally {
      setLoadingPatientData(false);
    }
  };

  /**
   * Resets the form to initial state
   * @function resetForm
   */
  const resetForm = () => {
    try {
      console.log("Resetting form to initial state");
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
      setLoadingPatientData(false);
      console.log("Form reset completed successfully");
    } catch (error) {
      console.error("Error resetting form:", error);
    }
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
      setTimeout(async () => {
        const updatedCompartments = compartments.map((comp) =>
          comp.id === compartmentId
            ? {
                ...comp,
                timeSlots: [...comp.timeSlots, { startTime, intervalHours }],
              }
            : comp,
        );
        await savePillboxConfig(
          selectedPatient,
          pillboxId,
          updatedCompartments,
        );
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
      setTimeout(async () => {
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
        await savePillboxConfig(
          selectedPatient,
          pillboxId,
          updatedCompartments,
        );
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
   * Links a pillbox to the current user following FLUJO_PASTILLERO_COMPLETO.md workflow
   * Sends add-capsy message to associate the device with the user account
   *
   * @async
   * @function linkPillbox
   * @param {string} capsyId - The pillbox ID to link
   * @returns {Promise<boolean>} True if linking was successful
   */
  const linkPillbox = async (capsyId: string): Promise<boolean> => {
    try {
      // Send add-capsy message following documented workflow
      const message = {
        type: "add-capsy" as const,
        capsyId: capsyId,
      };

      console.log(
        "Linking pillbox with add-capsy:",
        JSON.stringify(message, null, 2),
      );

      sendMessage(message);

      // Wait a moment for server response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Pillbox linked successfully");
      return true;
    } catch (error: any) {
      console.error("Error linking pillbox:", error);
      showSnackbar(t("couldNotEstablishConnection"));
      return false;
    }
  };

  /**
   * Sends pillbox configuration data to the server following FLUJO_PASTILLERO_COMPLETO.md workflow
   * Uses the capsy-individual message type to configure specific pastillero with scheduled medications
   * Supports startTime for specific hours and intervalMs for repetition cycles
   *
   * @async
   * @function sendToPillbox
   * @param {any[]} pastillaData - Array of compartment data with id and cantidad properties
   * @returns {Promise<void>}
   *
   * @example
   * sendToPillbox([
   *   { id: 1, cantidad: 2, type: "scheduled", startTime: "07:30", intervalMs: 28800000 },
   *   { id: 3, cantidad: 1, type: "interval", timeout: 43200000 }
   * ])
   */
  const sendToPillbox = async (pastillaData: any[]) => {
    if (!pillboxId.trim()) {
      showSnackbar(t("pillboxIdRequired"));
      return;
    }

    setIsConnecting(true);

    try {
      // First, link the pillbox if it's not already saved
      const savedConfig = savedConfigs.find(
        (config) =>
          config.patientId === selectedPatient &&
          config.pillboxId === pillboxId,
      );

      if (!savedConfig) {
        console.log("Linking new pillbox before configuration...");
        const linkSuccess = await linkPillbox(pillboxId);
        if (!linkSuccess) {
          setIsConnecting(false);
          return;
        }
      }

      // Build the pastilla array following the documented workflow format
      const pastillaArray = pastillaData.map((item) => {
        const compartment = compartments.find((comp) => comp.id === item.id);

        // Convert timeSlots to the documented format
        const timeSlot = compartment?.timeSlots?.[0];

        if (timeSlot?.startTime) {
          // Use scheduled type with specific start time
          return {
            id: item.id as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
            cantidad: item.cantidad,
            type: "scheduled" as const,
            timeout: timeSlot.intervalHours * 3600000, // Required timeout field
            startTime: timeSlot.startTime,
            intervalMs: timeSlot.intervalHours * 3600000, // Convert hours to milliseconds
          };
        } else if (timeSlot?.intervalHours) {
          // Use interval type for immediate start with repetition
          return {
            id: item.id as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
            cantidad: item.cantidad,
            type: "interval" as const,
            timeout: timeSlot.intervalHours * 3600000, // Convert hours to milliseconds
          };
        } else {
          // Default to single dose (timeout type)
          return {
            id: item.id as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
            cantidad: item.cantidad,
            type: "timeout" as const,
            timeout: 0, // Immediate
          };
        }
      });

      // Prepare capsy-individual message following documented workflow
      const message = {
        type: "capsy-individual" as const,
        capsyId: pillboxId,
        pastilla: pastillaArray,
      };

      console.log(
        "Sending capsy-individual configuration:",
        JSON.stringify(message, null, 2),
      );

      // Send the message to the server using WebSocket context
      sendMessage(message);

      // Show success message
      showSnackbar(t("configurationSentSuccessfully"));
      console.log("Capsy configuration sent successfully via server WebSocket");
    } catch (error: any) {
      console.error("Error sending capsy configuration:", error);

      showSnackbar(t("couldNotEstablishConnection"));
    } finally {
      setIsConnecting(false);
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
  const handleSave = async () => {
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
    await savePillboxConfig(selectedPatient, pillboxId, compartments);

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
    if (!selectedPatient) {
      return null;
    }

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
                  {savedConfig.lastUpdated instanceof Date
                    ? savedConfig.lastUpdated.toLocaleDateString()
                    : new Date(savedConfig.lastUpdated).toLocaleDateString()}
                </Text>
              </View>

              <Button
                mode="outlined"
                onPress={() => {
                  console.log(
                    "🔴 REMOVE BUTTON PRESSED! Selected patient:",
                    selectedPatient,
                  );
                  console.log("🔴 Button onPress triggered");
                  handleRemovePillbox(selectedPatient);
                }}
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
    console.log("🚨 handleRemovePillbox called with patientId:", patientId);

    const patientName =
      patients.find((p) => p.id === patientId)?.name || "este paciente";

    console.log("👤 Patient name found:", patientName);
    console.log("🔧 Translation function working:", typeof t);

    // Try window.confirm instead of Alert.alert for web compatibility
    console.log("🔔 About to show confirmation dialog...");

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la configuración del pastillero de ${patientName}? Toda la configuración se perderá.`,
    );

    console.log("🔔 Confirmation result:", confirmed);

    if (confirmed) {
      console.log("✅ User confirmed removal, calling removePillboxConfig...");
      removePillboxConfig(patientId)
        .then(() => {
          console.log("🎉 removePillboxConfig completed successfully");
        })
        .catch((error) => {
          console.error("💥 Error in removePillboxConfig:", error);
        });
    } else {
      console.log("❌ User cancelled removal");
    }
  };
  const renderPatientSelector = () => {
    return (
      <Card style={styles.patientCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t("selectPatient")}</Text>
          <Text style={styles.sectionSubtitle}>
            {t("selectPatientSubtitle")}
          </Text>

          <View style={styles.patientList}>
            {patients && patients.length > 0 ? (
              patients.map((patient) => (
                <View key={patient.id} style={styles.patientItem}>
                  <RadioButton
                    value={patient.id}
                    status={
                      selectedPatient === patient.id ? "checked" : "unchecked"
                    }
                    onPress={() => {
                      console.log(
                        "🔘 RadioButton pressed for patient:",
                        patient.id,
                        patient.name,
                      );
                      setSelectedPatient(patient.id);
                    }}
                    color="#60c4b4"
                  />
                  <Text style={styles.patientName}>{patient.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noPatients}>
                {t("noPatientsAvailable")} {t("addPatientsFirst")}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

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
    if (!compartment) {
      console.error("Compartment is null or undefined");
      return null;
    }

    const quantity = compartment.dosage
      ? extractQuantityFromDosage(compartment.dosage)
      : 0;
    const hasContent =
      compartment.medication && compartment.medication.trim() !== "";

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
    // Get or initialize state for this compartment
    const compartmentState = timeScheduleStates[compartment.id] || {
      startTime: "",
      intervalHours: "8",
      isIntervalFocused: false,
    };

    const updateCompartmentTimeState = (
      updates: Partial<typeof compartmentState>,
    ) => {
      setTimeScheduleStates((prev) => ({
        ...prev,
        [compartment.id]: {
          ...compartmentState,
          ...updates,
        },
      }));
    };

    const handleAddTimeSlot = () => {
      const interval = parseInt(compartmentState.intervalHours, 10);
      addTimeSlot(compartment.id, compartmentState.startTime, interval);
      updateCompartmentTimeState({
        startTime: "",
        intervalHours: "8",
        isIntervalFocused: false,
      });
    };

    const handleIntervalFocus = () => {
      if (!compartmentState.isIntervalFocused) {
        updateCompartmentTimeState({
          intervalHours: "",
          isIntervalFocused: true,
        });
      }
    };

    const handleIntervalChange = (value: string) => {
      const numericValue = validateNumericInput(value);
      updateCompartmentTimeState({
        intervalHours: numericValue,
        isIntervalFocused: true,
      });
    };

    const handleTimeChange = (value: string) => {
      const formattedTime = formatTimeInput(value);
      updateCompartmentTimeState({
        startTime: formattedTime,
      });
    };

    const handleIntervalBlur = () => {
      const numericValue = validateNumericInput(compartmentState.intervalHours);
      if (numericValue.trim() === "") {
        updateCompartmentTimeState({
          intervalHours: "8",
          isIntervalFocused: false,
        });
      } else {
        updateCompartmentTimeState({
          intervalHours: numericValue,
        });
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
          value={compartmentState.startTime}
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
          value={compartmentState.intervalHours}
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
          disabled={
            !compartmentState.startTime || !compartmentState.intervalHours
          }
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

          {!isLoggedIn || !userData ? (
            <Card style={styles.patientCard}>
              <Card.Content>
                <View style={{ alignItems: "center", padding: 20 }}>
                  <Text style={styles.sectionTitle}>
                    {t("loadingUserInformation")}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ) : (
            <>
              {renderPatientSelector()}

              {loadingPatientData ? (
                <Card style={styles.patientCard}>
                  <Card.Content>
                    <View style={{ alignItems: "center", padding: 20 }}>
                      <Text style={styles.sectionTitle}>
                        {t("loadingPatientData")}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ) : (
                <>
                  {renderPillboxManagement()}

                  <Text style={styles.formTitle}>
                    {t("pillboxConfiguration")}
                  </Text>

                  {compartments.map((compartment) =>
                    renderCompartmentForm(compartment),
                  )}

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
                </>
              )}
            </>
          )}
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
