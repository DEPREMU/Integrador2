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
 * @property {string} stock - Current stock/quantity of pills in the compartment
 * @property {TimeSlot[]} timeSlots - Array of time slots for medication administration
 */
interface Compartment {
  id: number;
  medication: string;
  dosage: string;
  stock: string;
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
/**
 * PillboxSettings Component
 *
 * Main component for configuring smart pillboxes and managing medication schedules.
 * This component provides comprehensive functionality for:
 * - Patient selection and management
 * - Pillbox assignment and configuration
 * - Medication management with autocomplete validation
 * - Dosage and stock tracking for each compartment
 * - Time-based scheduling for medication administration
 * - Real-time WebSocket communication with the server
 * - Multi-language support (Spanish/English)
 *
 * Features:
 * - 10 configurable compartments per pillbox
 * - Medication validation against API database
 * - Stock management for inventory tracking
 * - Flexible scheduling with start times and intervals
 * - Auto-save functionality for configurations
 * - Real-time notifications and feedback
 *
 * @component
 * @returns {JSX.Element} The complete pillbox configuration interface
 *
 * @example
 * ```tsx
 * import PillboxSettings from './screens/PillboxSettings';
 *
 * function App() {
 *   return <PillboxSettings />;
 * }
 * ```
 *
 * @author DEPREMU Development Team
 * @version 2.0.0
 * @since 2024-01-01
 */
const PillboxSettings: React.FC<PillboxSettingsProps> = () => {
  /**
   * Context Initialization and Error Handling
   *
   * Safely initializes all required React contexts with proper error handling.
   * This approach prevents the entire component from crashing if any context
   * is unavailable, allowing graceful degradation of functionality.
   *
   * Contexts initialized:
   * - UserContext: Authentication and user data
   * - WebSocketContext: Real-time communication
   * - LanguageContext: Internationalization support
   */
  let isLoggedIn = false;
  let userData = null;
  let sendMessage: any = (...args: any[]) => {};
  let t: any = (key: string) => key;

  try {
    const userContext = useUserContext();
    isLoggedIn = userContext?.isLoggedIn || false;
    userData = userContext?.userData || null;
  } catch (error) {
    console.error("Error accessing UserContext:", error);
  }

  try {
    const webSocketContext = useWebSocket();
    sendMessage = webSocketContext?.sendMessage || ((...args: any[]) => {});
  } catch (error) {
    console.error("Error accessing WebSocketContext:", error);
  }

  try {
    const languageContext = useLanguage();
    t = languageContext?.t || ((key: any) => key as string);
  } catch (error) {
    console.error("Error accessing LanguageContext:", error);
  }

  /**
   * Component State Management
   *
   * Comprehensive state management for all aspects of pillbox configuration:
   *
   * Patient Management:
   * - selectedPatient: Currently active patient ID
   * - patients: List of all available patients
   * - loadingPatientData: Loading state for patient operations
   *
   * Pillbox Configuration:
   * - pillboxId: Unique identifier for the connected device
   * - savedConfigs: Cached configurations for quick access
   * - compartments: Complete configuration for all 10 compartments
   * - showPillboxIdInput: UI state for pillbox assignment flow
   *
   * Medication Management:
   * - allMedications: Complete medication database for validation
   * - medicationSuggestions: Real-time autocomplete suggestions per compartment
   * - showSuggestions: UI state for dropdown visibility per compartment
   * - validMedications: Validation status for each compartment's medication
   *
   * UI State:
   * - isConnecting: Connection status for pillbox communication
   * - snackbarVisible/snackbarMessage: User feedback system
   * - loadingMedications: Loading state for medication database
   * - initializationError: Error tracking for component initialization
   * - isInitialized: Initialization completion flag
   *
   * Time Scheduling:
   * - timeScheduleStates: Individual timing configuration per compartment
   */
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

  /**
   * Compartment Configuration State
   *
   * Central state for all 10 medication compartments. Each compartment contains:
   * - id: Unique identifier (1-10)
   * - medication: Selected medication name (validated against database)
   * - dosage: User-defined dosage amount (e.g., "2 pills", "500mg")
   * - stock: Current inventory count for tracking purposes
   * - timeSlots: Array of scheduled administration times with intervals
   *
   * This state is the single source of truth for all compartment data
   * and drives the entire configuration UI and validation system.
   */
  const [compartments, setCompartments] = useState<Compartment[]>(
    Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      medication: "",
      dosage: "",
      stock: "",
      timeSlots: [],
    })),
  );

  /**
   * Shows a Snackbar notification with the specified message
   *
   * Provides user feedback through a temporary notification that appears
   * at the bottom of the screen. Used for success messages, errors, and
   * general status updates throughout the application.
   *
   * @function showSnackbar
   * @param {string} message - The message to display to the user
   *
   * @example
   * ```typescript
   * showSnackbar("Configuration saved successfully!");
   * showSnackbar(t("errorSavingConfiguration"));
   * ```
   */
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  /**
   * Validates and sanitizes numeric input
   *
   * Removes any non-numeric characters from user input to ensure
   * only valid numbers are processed. Used for time intervals,
   * stock quantities, and other numeric fields.
   *
   * @function validateNumericInput
   * @param {string} value - The raw input value to validate
   * @returns {string} The sanitized numeric value (digits only)
   *
   * @example
   * ```typescript
   * validateNumericInput("123abc") // returns "123"
   * validateNumericInput("8 hours") // returns "8"
   * validateNumericInput("abc") // returns ""
   * ```
   */
  const validateNumericInput = (value: string): string => {
    return value.replace(/[^0-9]/g, "");
  };

  /**
   * Formats time input with automatic colon insertion for HH:MM format
   *
   * Provides user-friendly time input by automatically formatting raw numeric
   * input into proper time format. Handles partial input gracefully and
   * enforces maximum length constraints.
   *
   * @function formatTimeInput
   * @param {string} value - The raw time input (numeric characters only)
   * @returns {string} The formatted time string in HH:MM format
   *
   * @example
   * ```typescript
   * formatTimeInput("8") // returns "8"
   * formatTimeInput("830") // returns "8:30"
   * formatTimeInput("1445") // returns "14:45"
   * formatTimeInput("12345") // returns "12:34" (truncated)
   * ```
   */
  const formatTimeInput = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, "");

    const limitedValue = numericValue.substring(0, 4);

    if (limitedValue.length >= 3) {
      return limitedValue.substring(0, 2) + ":" + limitedValue.substring(2);
    }

    return limitedValue;
  };

  /**
   * Loads the complete medication database from API for autocomplete functionality
   *
   * Fetches all available medications from the server to enable real-time
   * autocomplete suggestions and medication validation. Implements performance
   * optimizations including chunked processing to prevent UI blocking.
   *
   * Performance Features:
   * - Lazy loading: Only loads when needed
   * - Chunked processing: Processes medications in batches
   * - UI-friendly: Includes delays to prevent interface freezing
   * - Error handling: Graceful fallback for network issues
   *
   * @async
   * @function loadAllMedications
   * @returns {Promise<void>} Resolves when medication loading is complete
   *
   * @example
   * ```typescript
   * // Typically called automatically when user starts typing
   * await loadAllMedications();
   * // Medications are now available for autocomplete
   * ```
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

          for (let i = 0; i < chunks.length; i++) {
            processedMedications = processedMedications.concat(chunks[i]);
            if (i % 10 === 0) {
              await new Promise((resolve) => setTimeout(resolve, 10));
            }
          }

          setAllMedications(processedMedications);
        } else {
          setAllMedications([]);
        }
      } else {
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
   * Filters medications based on search term for real-time autocomplete
   *
   * Provides intelligent medication filtering with multiple language support
   * and performance optimizations. Handles both English and Spanish medication
   * names for comprehensive search capabilities.
   *
   * Search Features:
   * - Case-insensitive matching
   * - Multi-language support (English/Spanish)
   * - Lazy loading integration
   * - Performance-optimized (limited results)
   * - Loading state feedback
   *
   * @function filterMedications
   * @param {string} searchTerm - The user's search input (minimum 2 characters)
   * @returns {string[]} Array of filtered medication names (max 5 results)
   *
   * @example
   * ```typescript
   * filterMedications("para") // returns ["Paracetamol 500mg", "Paracetamol 1g"]
   * filterMedications("ib") // returns ["Ibuprofeno 400mg", "Ibuprofeno 600mg"]
   * filterMedications("a") // returns [] (too short)
   * ```
   */
  const filterMedications = (searchTerm: string): string[] => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    if (allMedications.length === 0 && !loadingMedications) {
      loadAllMedications()
        .then(() => {})
        .catch((error) => {
          console.error("Failed to load medications:", error);
        });
      return [t("loadingMedications")]; 
    }

    if (loadingMedications) {
      return [t("loadingMedications")];
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
      .slice(0, 5); 

    return filtered;
  };

  /**
   * Validates medication names against the official database
   *
   * Ensures that user-entered medications are legitimate and available
   * in the system. Supports both English and Spanish medication names
   * with case-insensitive matching for better user experience.
   *
   * Validation Logic:
   * - Empty strings are invalid
   * - If database isn't loaded, assumes valid (graceful degradation)
   * - Case-insensitive exact matching
   * - Supports both English and Spanish names
   *
   * @function isValidMedication
   * @param {string} medicationName - The medication name to validate
   * @returns {boolean} True if medication exists in database or database is unavailable
   *
   * @example
   * ```typescript
   * isValidMedication("Paracetamol") // returns true (if in database)
   * isValidMedication("InvalidDrug") // returns false
   * isValidMedication("") // returns false
   * isValidMedication("ASPIRIN") // returns true (case-insensitive)
   * ```
   */
  const isValidMedication = (medicationName: string): boolean => {
    if (!medicationName.trim()) return false;

    if (allMedications.length === 0) return true;

    return allMedications.some(
      (med) =>
        (med.name && med.name.toLowerCase() === medicationName.toLowerCase()) ||
        (med.name_es &&
          med.name_es.toLowerCase() === medicationName.toLowerCase()),
    );
  };

  /**
   * Handles medication input changes with real-time validation and autocomplete
   *
   * Manages the complete medication input workflow including:
   * - Real-time validation against database
   * - Autocomplete suggestions generation
   * - Visual feedback for validation status
   * - State synchronization across the component
   *
   * Features:
   * - Instant validation feedback
   * - Smart autocomplete with fallback suggestions
   * - Minimum character threshold for performance
   * - Real and test data integration
   *
   * @function handleMedicationInputChange
   * @param {number} compartmentId - The ID of the compartment being modified (1-10)
   * @param {string} value - The new medication name input by the user
   *
   * @example
   * ```typescript
   * // User types in compartment 1
   * handleMedicationInputChange(1, "Para");
   * // Triggers validation and shows autocomplete suggestions
   * ```
   */
  const handleMedicationInputChange = (
    compartmentId: number,
    value: string,
  ) => {
    updateCompartment(compartmentId, "medication", value);

    const isValid = isValidMedication(value);
    setValidMedications({ ...validMedications, [compartmentId]: isValid });

    if (value.length >= 2) {
      const realSuggestions = filterMedications(value);

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
   * Handles selection of a medication from autocomplete suggestions
   *
   * Completes the medication selection process when user chooses from
   * the autocomplete dropdown. Updates all relevant states and provides
   * immediate visual feedback.
   *
   * Actions Performed:
   * - Updates compartment medication name
   * - Marks medication as valid (since it came from suggestions)
   * - Hides suggestion dropdown
   * - Clears suggestion state for cleanup
   *
   * @function selectMedicationSuggestion
   * @param {number} compartmentId - The ID of the target compartment (1-10)
   * @param {string} medicationName - The selected medication name from suggestions
   *
   * @example
   * ```typescript
   * // User clicks on "Paracetamol 500mg" suggestion for compartment 3
   * selectMedicationSuggestion(3, "Paracetamol 500mg");
   * // Compartment 3 now has valid medication with no dropdown shown
   * ```
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
   * Loads and manages the list of patients assigned to the current user
   *
   * Fetches patient data from the API and updates the component state.
   * Implements robust error handling to prevent UI crashes and provides
   * appropriate fallbacks for various error scenarios.
   *
   * Security Features:
   * - User authentication validation
   * - Proper error logging without sensitive data exposure
   * - Graceful degradation on API failures
   *
   * Error Handling:
   * - Network failures: Logs error, sets empty patient list
   * - Authentication issues: Safely returns empty list
   * - API errors: Logs response details for debugging
   *
   * @async
   * @function loadPatients
   * @returns {Promise<void>} Resolves when patient loading is complete
   *
   * @example
   * ```typescript
   * // Called during component initialization
   * await loadPatients();
   * // patients state now contains user's assigned patients
   * ```
   */
  const loadPatients = async () => {
    if (!userData?.userId) {
      setPatients([]);
      return;
    }

    try {
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

          setPatients(patientsData);
        } else {
          setPatients([]);
        }
      } else {
        const errorData = await response.json();
        console.error("Error response from getUserPatients API:", errorData);
        setPatients([]);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
    }
  };

  /**
   * Loads medications for a selected patient and auto-fills compartments
   *
   * Fetches the patient's current medication regimen from the API and
   * populates the compartment forms with medication names. Implements
   * the data isolation principle by leaving dosage and stock fields
   * empty for manual user input.
   *
   * Data Loading Strategy:
   * - Medication names: Auto-filled from patient's prescription
   * - Dosage amounts: Left empty for manual entry
   * - Stock quantities: Left empty for manual entry
   * - Time schedules: Reset to empty for new configuration
   *
   * Validation Integration:
   * - Automatically validates loaded medications
   * - Updates validation states for immediate feedback
   * - Handles invalid medications gracefully
   *
   * @async
   * @function loadPatientMedications
   * @param {string} patientId - The unique ID of the patient whose medications to load
   * @returns {Promise<void>} Resolves when medication loading and validation is complete
   *
   * @example
   * ```typescript
   * // Load medications for patient with ID "patient-123"
   * await loadPatientMedications("patient-123");
   * // Compartments now have medication names but empty dosage/stock
   * ```
   */
  const loadPatientMedications = async (patientId: string) => {
    if (!patientId) {
      return;
    }

    try {
      const response = await fetch(
        getRouteAPI("/getUserMedications"),
        fetchOptions<TypeBodyGetUserMedications>("POST", {
          userId: patientId,
        }),
      );

      if (response.ok) {
        const data: ResponseGetUserMedications = await response.json();

        if (data.medications && data.medications.length > 0) {
          const updatedCompartments = compartments.map((comp, index) => {
            const medication = data.medications[index];
            if (medication) {
              return {
                ...comp,
                medication: medication.name || "",
                dosage: "", 
                stock: "", 
                timeSlots: [],
              };
            }
            return comp;
          });

          setCompartments(updatedCompartments);

          const newValidMedications: { [key: number]: boolean } = {};
          updatedCompartments.forEach((comp) => {
            if (comp.medication.trim() !== "") {
              newValidMedications[comp.id] = isValidMedication(comp.medication);
            }
          });
          setValidMedications(newValidMedications);
        } else {
          const emptyCompartments = compartments.map((comp) => ({
            ...comp,
            medication: "",
            dosage: "",
            stock: "",
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

  /**
   * Component Initialization Effect
   *
   * Handles the initial loading of essential data when the component mounts
   * or when authentication state changes. Implements error boundary pattern
   * to ensure the interface remains functional even if initialization fails.
   *
   * Initialization Sequence:
   * 1. Verify user authentication
   * 2. Load patient list for current user
   * 3. Set initialization completion flag
   * 4. Handle any errors gracefully
   *
   * Performance Considerations:
   * - Skips heavy medication loading at startup
   * - Uses lazy loading for better initial render performance
   * - Provides error recovery mechanisms
   *
   * Dependencies: [isLoggedIn, userData]
   */
  useEffect(() => {
    const initializeData = async () => {
      if (!isLoggedIn || !userData) {
        return;
      }

      try {
        setInitializationError("");

        await loadPatients();

        setIsInitialized(true);
      } catch (error) {
        console.error("Error during initialization:", error);
        setInitializationError(`Error de inicialización: ${error}`);
        setIsInitialized(true); 
      }
    };

    initializeData();
  }, [isLoggedIn, userData]);

  useEffect(() => {
  }, [patients, userData]);

  /**
   * Patient Selection Change Effect
   *
   * Manages the complete workflow when a user selects a different patient.
   * Handles both loading saved configurations and preparing new setups
   * with comprehensive error recovery.
   *
   * Workflow:
   * 1. Trigger when selectedPatient changes
   * 2. Load patient-specific data and configurations
   * 3. Reset form if no patient selected
   * 4. Handle errors gracefully with form reset
   *
   * Dependencies: [selectedPatient] (optimized to remove unnecessary deps)
   */
  useEffect(() => {
    const handlePatientChange = async () => {
      try {
        if (selectedPatient) {
          await loadPatientData(selectedPatient);
        } else {
          resetForm();
        }
      } catch (error) {
        console.error("Error in handlePatientChange:", error);
        resetForm();
      }
    };

    handlePatientChange();
  }, [selectedPatient]); 

  /**
   * Auto-save Configuration Effect
   *
   * Implements intelligent auto-save functionality that preserves user work
   * without overwhelming the server with requests. Uses debouncing to
   * ensure optimal performance and user experience.
   *
   * Auto-save Triggers:
   * - Compartment configuration changes
   * - Patient selection changes
   * - Pillbox ID modifications
   *
   * Performance Features:
   * - 1-second debounce delay
   * - Only saves when meaningful data exists
   * - Cleanup on component unmount
   *
   * Dependencies: [compartments, selectedPatient, pillboxId]
   */
  useEffect(() => {
    if (
      selectedPatient &&
      pillboxId &&
      compartments.some((comp) => comp.medication.trim() !== "")
    ) {
      const timeoutId = setTimeout(async () => {
        await savePillboxConfig(selectedPatient, pillboxId, compartments);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [compartments, selectedPatient, pillboxId]);

  /**
   * WebSocket Message Handler Effect
   *
   * Manages real-time communication with the server for pillbox configuration
   * operations. Handles multiple message types and provides appropriate user
   * feedback for each operation result.
   *
   * Supported Message Types:
   * - pillbox-config-saved: Configuration save confirmations
   * - pillbox-config-loaded: Configuration retrieval responses
   * - pillbox-config-deleted: Configuration deletion confirmations
   *
   * Features:
   * - Real-time state synchronization
   * - User feedback via snackbar notifications
   * - Error handling and reporting
   * - Date object conversion for proper state management
   *
   * Event Lifecycle:
   * - Registers custom event listener on mount
   * - Processes messages based on type
   * - Updates local state accordingly
   * - Cleans up listener on unmount
   */
  useEffect(() => {
    const handleWebSocketMessage = (event: CustomEvent) => {
      const message = event.detail;

      if (!message || !message.type) return;

      switch (message.type) {
        case "pillbox-config-saved":
          if (message.success && message.config) {
            const configWithDate = {
              ...message.config,
              lastUpdated: new Date(message.config.lastUpdated),
            };

            setSavedConfigs((prev) => {
              const filtered = prev.filter(
                (config) => config.patientId !== message.config.patientId,
              );
              return [...filtered, configWithDate];
            });
          } else if (message.error) {
            console.error(
              "❌ Error saving config via WebSocket:",
              message.error,
            );
            showSnackbar(
              t("errorSavingConfiguration") + ": " + message.error.message,
            );
          }
          break;

        case "pillbox-config-loaded":
          if (message.config) {
            const configWithDate = {
              ...message.config,
              lastUpdated: new Date(message.config.lastUpdated),
            };

            setSavedConfigs((prev) => {
              const filtered = prev.filter(
                (config) => config.patientId !== message.config.patientId,
              );
              return [...filtered, configWithDate];
            });
          } else if (message.error) {
          }
          break;

        case "pillbox-config-deleted":
          if (message.success) {
            showSnackbar(t("configurationDeletedSuccessfully"));
          } else if (message.error) {
            console.error(
              "❌ Error deleting config via WebSocket:",
              message.error,
            );
            showSnackbar(
              t("errorDeletingConfiguration") + ": " + message.error.message,
            );
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener(
      "pillbox-config-message",
      handleWebSocketMessage as EventListener,
    );

    return () => {
      window.removeEventListener(
        "pillbox-config-message",
        handleWebSocketMessage as EventListener,
      );
    };
  }, []);

  /**
   * Loads saved pillbox configuration for a specific patient via WebSocket
   *
   * Retrieves patient-specific pillbox configurations from the database
   * using WebSocket communication. Implements async pattern with Promise
   * resolution for seamless integration with React state management.
   *
   * WebSocket Integration:
   * - Sends get-pillbox-config message
   * - Handles async response via existing WebSocket listener
   * - Falls back to local state for immediate availability
   *
   * Error Handling:
   * - Network failures: Returns null gracefully
   * - Authentication issues: Validates user data first
   * - Missing configs: Normal behavior for new patients
   *
   * @function loadPillboxConfig
   * @param {string} patientId - The unique identifier of the patient
   * @returns {Promise<SavedPillboxConfig | null>} The configuration or null if not found
   *
   * @example
   * ```typescript
   * const config = await loadPillboxConfig("patient-123");
   * if (config) {
   *   // Load existing configuration
   *   setCompartments(config.compartments);
   * } else {
   *   // Setup new configuration
   *   loadPatientMedications(patientId);
   * }
   * ```
   */
  const loadPillboxConfig = async (
    patientId: string,
  ): Promise<SavedPillboxConfig | null> => {
    if (!userData?.userId || !patientId) {
      return null;
    }

    try {
      return new Promise((resolve) => {
        const originalSendMessage = sendMessage;

        const message = {
          type: "get-pillbox-config",
          userId: userData.userId,
          patientId: patientId,
        };

        sendMessage(message);

        const existingConfig = savedConfigs.find(
          (config) => config.patientId === patientId,
        );
        if (existingConfig) {
          resolve(existingConfig);
        } else {
          resolve(null);
        }
      });
    } catch (error) {
      console.error(`Error loading config for patient ${patientId}:`, error);
      return null;
    }
  };

  /**
   * Saves pillbox configuration to database via WebSocket
   *
   * Persists the complete pillbox configuration including all compartments,
   * medications, dosages, stock levels, and scheduling information. Uses
   * WebSocket for real-time communication and immediate feedback.
   *
   * Configuration Data Saved:
   * - Patient assignment (patientId)
   * - Device identification (pillboxId)
   * - Complete compartment configurations
   * - Medication names and dosages
   * - Stock levels for inventory tracking
   * - Time-based scheduling information
   *
   * Communication Flow:
   * 1. Validates user authentication
   * 2. Sends save-pillbox-config WebSocket message
   * 3. Receives confirmation via WebSocket listener
   * 4. Updates local state automatically
   *
   * @function savePillboxConfig
   * @param {string} patientId - The unique identifier of the patient
   * @param {string} pillboxId - The unique identifier of the pillbox device
   * @param {Compartment[]} compartments - Complete array of compartment configurations
   *
   * @example
   * ```typescript
   * await savePillboxConfig(
   *   "patient-123",
   *   "PILLBOX-456",
   *   compartmentsArray
   * );
   * // Configuration is now saved and synchronized
   * ```
   */
  const savePillboxConfig = async (
    patientId: string,
    pillboxId: string,
    compartments: Compartment[],
  ) => {
    if (!userData?.userId) {
      console.error("No user ID available for saving config");
      showSnackbar(t("userNotIdentified"));
      return;
    }

    try {
      const message = {
        type: "save-pillbox-config",
        userId: userData.userId,
        patientId,
        pillboxId,
        compartments,
      };

      sendMessage(message);

    } catch (error) {
      console.error("Error saving config:", error);
      showSnackbar(t("errorSavingConfiguration"));
    }
  };

  /**
   * Removes a saved pillbox configuration from the database via WebSocket
   * @function removePillboxConfig
   * @param {string} patientId - The patient ID
   */
  const removePillboxConfig = async (patientId: string) => {
    if (!userData?.userId) {
      console.error("❌ No user ID available for removing config");
      showSnackbar(t("userNotIdentified"));
      return;
    }

    const existingConfig = savedConfigs.find(
      (config) => config.patientId === patientId,
    );

    try {
      const message = {
        type: "delete-pillbox-config",
        userId: userData.userId,
        patientId,
      };

      console.log("� Sending delete config message:", message);
      sendMessage(message);

      console.log("🔄 Updating local savedConfigs state optimistically...");
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

      if (selectedPatient === patientId) {
        console.log(
          "🔄 Current patient matches removed patient, resetting form...",
        );

        console.log("🆔 Clearing pillbox ID from:", pillboxId, "to empty");
        setPillboxId("");

        console.log("💊 Resetting all compartments...");
        const emptyCompartments = Array.from({ length: 10 }, (_, index) => ({
          id: index + 1,
          medication: "",
          dosage: "",
          stock: "",
          timeSlots: [],
        }));
        setCompartments(emptyCompartments);

        console.log("✅ Clearing validation states...");
        setValidMedications({});
        setShowSuggestions({});
        setMedicationSuggestions({});
        setTimeScheduleStates({});

        setShowPillboxIdInput(true);

        setLoadingPatientData(false);
      }

      showSnackbar(t("configurationDeletedSuccessfully"));
    } catch (error) {
      console.error("❌ Exception during removal:", error);
      console.error("❌ Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
      showSnackbar(
        t("errorDeletingConfiguration") +
          ": " +
          (error instanceof Error ? error.message : t("unknownError")),
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

      const savedConfig = await loadPillboxConfig(patientId);

      if (savedConfig) {
        console.log(`Found saved config for patient: ${patientId}`);

        setPillboxId(savedConfig.pillboxId);
        setCompartments(savedConfig.compartments);
        setShowPillboxIdInput(false);

        setSavedConfigs((prev) => {
          const filtered = prev.filter(
            (config) => config.patientId !== patientId,
          );
          return [...filtered, savedConfig];
        });

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

        await loadPatientMedications(patientId);
        setPillboxId("");
        setShowPillboxIdInput(true);
      }
    } catch (error) {
      console.error("Error in loadPatientData:", error);
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
        stock: "",
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
   * @param {keyof Omit<Compartment, "id">} field - The field to update ("medication", "dosage", "stock", or "timeSlots")
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

    const compartment = compartments.find((comp) => comp.id === compartmentId);
    if (compartment && compartment.timeSlots.length > 0) {
      Alert.alert(
        t("error"),
        t("compartmentAlreadyHasTimeSlot") ||
          "Este compartimento ya tiene un horario. Elimina el horario existente antes de agregar uno nuevo.",
      );
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
      const message = {
        type: "add-capsy" as const,
        capsyId: capsyId,
      };

      console.log(
        "Linking pillbox with add-capsy:",
        JSON.stringify(message, null, 2),
      );

      sendMessage(message);

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

      const pastillaArray = pastillaData.map((item) => {
        const compartment = compartments.find((comp) => comp.id === item.id);

        const timeSlot = compartment?.timeSlots?.[0];

        if (timeSlot?.startTime) {
          return {
            id: item.id as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
            cantidad: item.cantidad,
            type: "scheduled" as const,
            timeout: timeSlot.intervalHours * 3600000, 
            startTime: timeSlot.startTime,
            intervalMs: timeSlot.intervalHours * 3600000, 
          };
        } else if (timeSlot?.intervalHours) {
          return {
            id: item.id as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
            cantidad: item.cantidad,
            type: "interval" as const,
            timeout: timeSlot.intervalHours * 3600000,
          };
        } else {
          return {
            id: item.id as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
            cantidad: item.cantidad,
            type: "timeout" as const,
            timeout: 0, 
          };
        }
      });

      const message = {
        type: "capsy-individual" as const,
        capsyId: pillboxId,
        pastilla: pastillaArray,
      };

      console.log(
        "Sending capsy-individual configuration:",
        JSON.stringify(message, null, 2),
      );

      sendMessage(message);

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

    const invalidMedications = filledCompartments.filter(
      (comp) => !validMedications[comp.id],
    );

    if (invalidMedications.length > 0) {
      const compartmentNumbers = invalidMedications
        .map((comp) => comp.id)
        .join(", ");
      Alert.alert(
        t("error"),
        t("invalidMedicationsInCompartments").replace(
          "{numbers}",
          compartmentNumbers,
        ),
      );
      return;
    }

    const compartmentsWithoutSchedule = filledCompartments.filter(
      (comp) => comp.timeSlots.length === 0,
    );

    if (compartmentsWithoutSchedule.length > 0) {
      const compartmentNumbers = compartmentsWithoutSchedule
        .map((comp) => comp.id)
        .join(", ");
      Alert.alert(
        t("error"),
        t("compartmentsRequireSchedule").replace(
          "{numbers}",
          compartmentNumbers,
        ),
      );
      return;
    }

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

    console.log("🔔 About to show confirmation dialog...");

    const confirmed = window.confirm(
      t("confirmDeleteConfiguration").replace("{name}", patientName),
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
                {t("invalidMedication")}
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
                {t("validMedication")}
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

        <TextInput
          style={styles.input}
          label={t("stock")}
          value={compartment.stock}
          onChangeText={(value) => {
            // Allow only numeric values for stock
            const isNumericOnly = /^[0-9]*$/.test(value);
            if (isNumericOnly) {
              updateCompartment(compartment.id, "stock", value);
            }
          }}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#60c4b4"
          placeholder={t("stockPlaceholder")}
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
            !compartmentState.startTime ||
            !compartmentState.intervalHours ||
            compartment.timeSlots.length > 0
          }
        >
          {t("addTimeSlot")}
        </Button>

        {compartment.timeSlots.length > 0 && (
          <Text style={styles.infoText}>
            {t("compartmentAlreadyHasTimeSlot")}
          </Text>
        )}

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
