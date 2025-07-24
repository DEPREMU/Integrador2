// /src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useModal } from "@context/ModalContext";
import { View, Text, Alert, Image } from "react-native";
import HeaderComponent from "@components/common/Header";
import ButtonComponent from "@components/common/Button";
import { useLanguage } from "@context/LanguageContext";
import { useUserContext } from "@context/UserContext";
import stylesDashboardScreen from "@styles/screens/stylesDashboardScreen";
import { interpolateMessage, getRouteAPI, fetchOptions, getRouteImage } from "@utils";
import { RootStackParamList } from "@navigation/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PatientCarousel, { Patient } from "@components/Dashboard/PatientCarousel";
import PatientModalBody from "@components/Dashboard/PatientModalBody";
import PatientModalFooter from "@components/Dashboard/PatientModalFooter";
import PatientEditForm from "@components/Dashboard/PatientEditForm";
import {
  User,
  TypeBodyGetUserPatients,
  ResponseGetUserPatients,
  TypeBodyDeletePatient,
  ResponseDeletePatient,
} from "@typesAPI";

/**
 * Type definition for navigation prop used in the Dashboard screen.
 */
type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

/**
 * Props interface for the DashboardScreen component.
 * @interface Props
 * @property {DashboardScreenNavigationProp} navigation - Navigation prop for screen navigation
 */
interface Props {
  navigation: DashboardScreenNavigationProp;
}

/**
 * DashboardScreen component serves as the main dashboard interface for caregivers.
 * 
 * This screen provides a comprehensive overview of the caregiver's patients and serves as the
 * central hub for patient management activities within the application.
 * 
 * Features:
 * - Header with user profile information and image
 * - Personalized greeting message with user's name
 * - Horizontal carousel of patient cards for easy browsing
 * - Add new patient functionality with modal interface
 * - Edit and delete patient capabilities
 * - Real-time patient data loading and refresh
 * - Modal-based patient management forms
 * - Responsive design with loading states
 * - Error handling and user feedback
 * 
 * Patient Management:
 * - View all assigned patients in a scrollable carousel
 * - Add new patients (create new or search existing)
 * - Edit existing patient information
 * - Unassign patients from caregiver (with confirmation)
 * - Navigate to individual patient detail screens
 * 
 * UI Components:
 * - HeaderComponent for navigation and user info
 * - PatientCarousel for displaying patient cards
 * - Modal-based forms for patient management
 * - Loading states and error handling
 * 
 * Context Integration:
 * - Uses UserContext for user data and authentication
 * - Uses LanguageContext for localization
 * - Uses ModalContext for modal management
 * 
 * @component
 * @param {Props} [props] - Component props (currently unused but available for navigation)
 * @returns {JSX.Element} The rendered dashboard screen
 *
 * @example
 * <DashboardScreen />
 */
const DashboardScreen: React.FC = () => {
  const { t } = useLanguage();
  const { openModal, closeModal } = useModal();
  const { stylesDashboardScreen: styles } = stylesDashboardScreen();
  const { userData } = useUserContext();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified modal styles for consistency
  const modalStyles = {
    container: {
      padding: 20,
      alignItems: 'center' as const,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      marginBottom: 15,
      textAlign: 'center' as const,
      color: '#333',
    },
    message: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center' as const,
      color: '#666',
      lineHeight: 22,
    },
    buttonsContainer: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginTop: 24,
      gap: 12,
      width: '100%' as const,
      paddingHorizontal: 20,
    },
    // Styles matching PatientModalButtons
    cancelButton: {
      flex: 1,
      backgroundColor: "#e0e0e0",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center' as const,
    },
    cancelButtonText: {
      color: "#2c3e50",
      fontWeight: "600" as const,
      fontSize: 16,
    },
    primaryButton: {
      flex: 1,
      backgroundColor: "#00a69d",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center' as const,
    },
    primaryButtonText: {
      color: "#fff",
      fontWeight: "600" as const,
      fontSize: 16,
    },
    // Destructive variant
    destructiveButton: {
      flex: 1,
      backgroundColor: "#dc3545",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center' as const,
    },
    destructiveButtonText: {
      color: "#fff",
      fontWeight: "600" as const,
      fontSize: 16,
    },
  };

  /**
   * Converts a User object to Patient format for use in the carousel.
   * Maps user properties to the patient card display format.
   * 
   * @param {User} user - The user object to convert
   * @returns {Patient} The converted patient object for carousel display
   */
  const convertUserToPatient = (user: User): Patient => ({
    id: user.userId,
    name: user.name,
    photo: user.imageId || "", // Leave empty if no imageId, PatientCard will handle placeholder
    pills: user.medications?.map(med => med.name) || [],
    description: user.description || "",
  });

  /**
   * Loads the caregiver's assigned patients from the server.
   * Handles loading states, error scenarios, and ensures the "Add Patient" button is always available.
   * 
   * @async
   * @function loadPatients
   * @returns {Promise<void>}
   */
  const loadPatients = useCallback(async () => {
    if (!userData?.userId) {
      // If no user data, still show the add button
      setPatients([{
        id: "add",
        name: "Add Patient",
        photo: "",
        pills: [],
        description: "",
      }]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        getRouteAPI("/getUserPatients"),
        fetchOptions<TypeBodyGetUserPatients>("POST", {
          userId: userData.userId,
        }),
      );

      if (response.ok) {
        const data: ResponseGetUserPatients = await response.json();
        if (data.patients) {
          const patientList = data.patients.map(convertUserToPatient);
          // Always add the "add patient" button at the end
          setPatients([...patientList, {
            id: "add",
            name: "Add Patient",
            photo: "",
            pills: [],
            description: "",
          }]);
        } else {
          // If no patients, still show the add button
          setPatients([{
            id: "add",
            name: "Add Patient",
            photo: "",
            pills: [],
            description: "",
          }]);
        }
      } else {
        // On error, still show the add button
        setPatients([{
          id: "add",
          name: "Add Patient",
          photo: "",
          pills: [],
          description: "",
        }]);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      // On error, still show the add button
      setPatients([{
        id: "add",
        name: "Add Patient",
        photo: "",
        pills: [],
        description: "",
      }]);
    } finally {
      setLoading(false);
    }
  }, [userData?.userId]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  /**
   * Handles unassigning a patient from the current caregiver.
   * Shows a confirmation modal before proceeding with the unassignment.
   * Updates the patient list after successful unassignment.
   * 
   * @async
   * @function handleUnassignPatient
   * @param {string} patientId - The ID of the patient to unassign
   * @returns {Promise<void>}
   */
  const handleUnassignPatient = useCallback(async (patientId: string) => {
    console.log("handleUnassignPatient called with patientId:", patientId);
    console.log("Current patients:", patients);
    console.log("Current userData:", userData);

    // Find the patient name for the confirmation dialog
    const patient = patients.find(p => p.id === patientId);
    const patientName = patient ? patient.name : t("unknown");

    console.log("Patient found:", patient);
    console.log("Opening confirmation modal");

    // Create confirmation modal content
    const ConfirmationModal = () => (
      <View style={modalStyles.container}>
        <Text style={modalStyles.title}>
          {t("unassignPatient")}
        </Text>
        <Text style={modalStyles.message}>
          {interpolateMessage(t("confirmUnassignPatient"), [patientName])}
        </Text>
      </View>
    );

    const ConfirmationButtons = () => (
      <View style={modalStyles.buttonsContainer}>
        <ButtonComponent
          handlePress={() => {
            console.log("User cancelled unassignment");
            closeModal();
          }}
          customStyles={{
            button: modalStyles.cancelButton,
            textButton: modalStyles.cancelButtonText
          }}
          children={t("cancel")}
        />
        <ButtonComponent
          handlePress={async () => {
            console.log("User confirmed unassignment");
            closeModal();
            try {
              console.log("Making API call to unassign patient");
              const response = await fetch(
                getRouteAPI("/unassignPatient"),
                fetchOptions<TypeBodyDeletePatient>("POST", {
                  caregiverId: userData?.userId || "",
                  patientId: patientId,
                }),
              );

              console.log("API response:", response);

              if (response.ok) {
                const data: ResponseDeletePatient = await response.json();
                console.log("API response data:", data);

                if (data.success) {
                  console.log("Unassignment successful, reloading patients");
                  await loadPatients(); // Refresh the list
                  // Show success message in a new modal
                  openModal(
                    t("success"),
                    <View style={modalStyles.container}>
                      <Text style={modalStyles.message}>
                        {interpolateMessage(t("patientUnassignedSuccessfully"), [patientName])}
                      </Text>
                    </View>,
                    <View style={modalStyles.buttonsContainer}>
                      <ButtonComponent
                        handlePress={closeModal}
                        customStyles={{
                          button: modalStyles.primaryButton,
                          textButton: modalStyles.primaryButtonText
                        }}
                        children={t("close")}
                      />
                    </View>
                  );
                } else {
                  console.error("API returned error:", data.error);
                  openModal(
                    t("error"),
                    <View style={modalStyles.container}>
                      <Text style={modalStyles.message}>
                        {data.error?.message || t("errorUnassigningPatient")}
                      </Text>
                    </View>,
                    <View style={modalStyles.buttonsContainer}>
                      <ButtonComponent
                        handlePress={closeModal}
                        customStyles={{
                          button: modalStyles.primaryButton,
                          textButton: modalStyles.primaryButtonText
                        }}
                        children={t("close")}
                      />
                    </View>
                  );
                }
              } else {
                console.error("HTTP error:", response.status);
                openModal(
                  t("error"),
                  <View style={modalStyles.container}>
                    <Text style={modalStyles.message}>{t("serverError")}</Text>
                  </View>,
                  <View style={modalStyles.buttonsContainer}>
                    <ButtonComponent
                      handlePress={closeModal}
                      customStyles={{
                        button: modalStyles.primaryButton,
                        textButton: modalStyles.primaryButtonText
                      }}
                      children={t("close")}
                    />
                  </View>
                );
              }
            } catch (error) {
              console.error("Error unassigning patient:", error);
              openModal(
                t("error"),
                <View style={modalStyles.container}>
                  <Text style={modalStyles.message}>{t("networkError")}</Text>
                </View>,
                <View style={modalStyles.buttonsContainer}>
                  <ButtonComponent
                    handlePress={closeModal}
                    customStyles={{
                      button: modalStyles.primaryButton,
                      textButton: modalStyles.primaryButtonText
                    }}
                    children={t("close")}
                  />
                </View>
              );
            }
          }}
          customStyles={{
            button: modalStyles.destructiveButton,
            textButton: modalStyles.destructiveButtonText
          }}
          children={t("unassign")}
        />
      </View>
    );

    openModal(
      t("unassignPatient"),
      <ConfirmationModal />,
      <ConfirmationButtons />
    );
  }, [userData?.userId, loadPatients, patients, openModal, closeModal, t]);

  /**
   * Handles the callback when a patient is successfully updated.
   * Refreshes the patient list and closes the modal.
   * 
   * @function handlePatientUpdated
   * @returns {void}
   */
  const handlePatientUpdated = useCallback(() => {
    loadPatients(); // Refresh the patient list
    closeModal(); // Close the modal after successful update
  }, [loadPatients, closeModal]);

  /**
   * Handles editing a patient by opening a modal with the patient edit form.
   * Fetches the current patient data from the server before opening the edit form.
   * 
   * @async
   * @function handleEditPatient
   * @param {string} patientId - The ID of the patient to edit
   * @returns {Promise<void>}
   */
  const handleEditPatient = useCallback(async (patientId: string) => {
    console.log("handleEditPatient called with patientId:", patientId);

    // Find the patient in the current list
    const patientToEdit = patients.find(p => p.id === patientId);
    if (!patientToEdit) {
      console.error("Patient not found in current list");
      return;
    }

    try {
      // Fetch the full patient data from the server
      const response = await fetch(
        getRouteAPI("/getUserPatients"),
        fetchOptions<TypeBodyGetUserPatients>("POST", {
          userId: userData?.userId || "",
        }),
      );

      if (response.ok) {
        const data: ResponseGetUserPatients = await response.json();
        // Use patientId to find the patient, since patientId should match userId in database
        const fullPatientData = data.patients?.find(p => p.userId === patientId);

        if (fullPatientData) {
          // Open edit modal with full patient data
          openModal(
            t("editPatient"),
            <PatientEditForm
              patient={fullPatientData}
              onPatientUpdated={handlePatientUpdated}
            />,
            <PatientModalFooter onSave={() => { }} />
          );
        } else {
          console.error("Full patient data not found. Available patients:", data.patients?.map(p => ({ userId: p.userId, name: p.name })));
        }
      } else {
        console.error("Error fetching patient data");
      }
    } catch (error) {
      console.error("Error in handleEditPatient:", error);
    }
  }, [patients, userData?.userId, openModal, closeModal, t, handlePatientUpdated]);

  // Handle patient created callback
  const handlePatientCreated = useCallback(() => {
    loadPatients(); // Refresh the patient list
    closeModal(); // Close the modal after successful creation
  }, [loadPatients, closeModal]);

  // Handle patient selected callback (for adding existing patients)
  const handlePatientSelected = useCallback(() => {
    loadPatients(); // Refresh the patient list
    closeModal(); // Close the modal after successful addition
  }, [loadPatients, closeModal]);

  // Handle modal save
  const handleModalSave = useCallback(() => {
    closeModal();
  }, [closeModal]);

  // Open modal for adding patients
  const openAddPatientModal = useCallback(() => {
    openModal(
      t("addPatient"),
      <PatientModalBody
        onPatientCreated={handlePatientCreated}
        onPatientSelected={handlePatientSelected}
      />,
      <PatientModalFooter onSave={handleModalSave} />,
    );
  }, [openModal, t, handleModalSave, handlePatientCreated, handlePatientSelected]);

  return (
    <View style={styles.container}>
      <HeaderComponent />
      <Text style={styles.greeting}>
        {interpolateMessage(t("greeting"), [userData?.name || t("dearUser")])}
      </Text>

      {/* User Image */}
      <View style={styles.userImagePlaceholder}>
        {userData?.imageId ? (
          <Image
            source={{ uri: getRouteImage(userData.imageId) }}
            style={styles.userImage}
            onError={() => console.log('Error loading user image:', userData.imageId)}
            onLoad={() => console.log('User image loaded successfully')}
          />
        ) : (
          <View style={[styles.userImage, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#999', fontSize: 12, textAlign: 'center' }}>
              Sin foto
            </Text>
          </View>
        )}
      </View>

      <PatientCarousel
        data={patients}
        styles={styles}
        translations={{
          addPatient: t("addPatient"),
          addPatientForm: t("addPatientForm"),
          close: t("close"),
        }}
        openModal={openAddPatientModal}
        closeModal={closeModal}
        onDeletePatient={handleUnassignPatient}
        onEditPatient={handleEditPatient}
        loading={loading}
      />
    </View>
  );
};

export default DashboardScreen;
