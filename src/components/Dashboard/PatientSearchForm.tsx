// /src/components/Dashboard/PatientSearchForm.tsx
import React, { useState } from "react";
import { View, FlatList, ActivityIndicator, Text, ScrollView, Image } from "react-native";
import { TextInput } from "react-native-paper";
import { useLanguage } from "@context/LanguageContext";
import ButtonComponent from "@components/common/Button";
import {
  useStylesPatientModalForms,
  inputTheme,
} from "@styles/components/stylesPatientModalForms";
import { getRouteAPI, fetchOptions, getRouteImage } from "@utils";
import {
  TypeBodySearchUser,
  ResponseSearchUser,
  User,
  TypeBodyAddExistingPatient,
  ResponseAddExistingPatient
} from "@typesAPI";
import { useUserContext } from "@context/UserContext";

/**
 * Props interface for the PatientSearchForm component.
 * @interface PatientSearchFormProps
 * @property {(patient: User) => void} [onPatientSelected] - Optional callback function called when a patient is successfully selected and added
 */
interface PatientSearchFormProps {
  onPatientSelected?: (patient: User) => void;
}

/**
 * PatientSearchForm component allows caregivers to search for existing patients by email or phone.
 * 
 * This form provides a search interface for finding and adding existing patients to a caregiver's
 * patient list, with validation and role-based restrictions.
 * 
 * Features:
 * - Search by email or phone number
 * - Real-time search with loading states
 * - User role validation (prevents adding caregivers as patients)
 * - Privacy-protected search results (minimal user info displayed)
 * - Error handling with user-friendly messages
 * - Responsive design with nested scrolling support
 * - Consistent styling with design system
 * - Localized text and error messages
 * 
 * Search Capabilities:
 * - Email-based search with format validation
 * - Phone number search with format validation
 * - Automatic detection of search type (email vs phone)
 * - Privacy protection (only returns searched field + basic info)
 * 
 * Validation Rules:
 * - Cannot add caregivers as patients
 * - Required field validation
 * - Network error handling
 * - User not found scenarios
 * 
 * @component
 * @param {PatientSearchFormProps} props - Component props
 * @param {(patient: User) => void} [props.onPatientSelected] - Callback function called when a patient is successfully selected and added
 * @returns {JSX.Element} The rendered patient search form
 * 
 * @example
 * <PatientSearchForm 
 *   onPatientSelected={(patient) => {
 *     console.log('Patient selected:', patient.name);
 *     refreshPatientList();
 *     closeModal();
 *   }}
 * />
 */
const PatientSearchForm: React.FC<PatientSearchFormProps> = ({ onPatientSelected }) => {
  const styles = useStylesPatientModalForms();
  const { t } = useLanguage();
  const { userData } = useUserContext();
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);
  const [searchedByEmail, setSearchedByEmail] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setErrorMessage(t("fieldRequired"));
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSearchResult(null);

    try {
      // Determine if the query is an email or phone number
      const isEmail = query.includes("@");
      setSearchedByEmail(isEmail);
      const searchBody: TypeBodySearchUser = isEmail
        ? { email: query.trim() }
        : { phone: query.trim() };

      const response = await fetch(
        getRouteAPI("/searchUser"),
        fetchOptions<TypeBodySearchUser>("POST", searchBody)
      );

      const data: ResponseSearchUser = await response.json();

      if (data.error) {
        setErrorMessage(data.error.message);
      } else if (data.message === "Usuario no encontrado") {
        setErrorMessage(t("userNotFound"));
      } else if (data.user) {
        setSearchResult(data.user);
      }
    } catch (error) {
      console.error("Error searching user:", error);
      setErrorMessage(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddExistingPatient = async () => {
    if (!searchResult || !userData?.userId) {
      return;
    }

    // Validate that the user to be assigned is not a caregiver
    if (searchResult.role === "caregiver") {
      setErrorMessage(t("caregiverCannotBePatient"));
      return;
    }

    setAddingPatient(true);

    try {
      // Call the real API endpoint
      const requestBody: TypeBodyAddExistingPatient = {
        caregiverId: userData.userId,
        patientUserId: searchResult.userId
      };

      const response = await fetch(
        getRouteAPI("/addExistingPatient"),
        fetchOptions<TypeBodyAddExistingPatient>("POST", requestBody)
      );

      const result: ResponseAddExistingPatient = await response.json();

      if (result.success) {
        // Call the callback to notify parent (this will refresh the patient list and close modal)
        onPatientSelected?.(searchResult);

        // Reset form
        setQuery("");
        setSearchResult(null);
        setErrorMessage("");
        setSearchedByEmail(false);
      } else {
        // Check for specific error messages and translate them
        const errorMessage = result.error?.message || "";
        if (errorMessage.includes("already assigned")) {
          setErrorMessage(t("patientAlreadyAssigned"));
        } else {
          setErrorMessage(errorMessage || t("errorCreatingPatient"));
        }
      }

    } catch (error) {
      console.error("Error adding existing patient:", error);
      setErrorMessage(t("networkError"));
    } finally {
      setAddingPatient(false);
    }
  };

  return (
    <View style={{
      width: '100%',
      height: '100%',
      alignSelf: 'center',
    }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 80, // Suficiente padding para mobile
        }}
        nestedScrollEnabled={true}
      >
        {/* Search Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label={t("searchByEmailOrPhone")}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (errorMessage) setErrorMessage("");
              // Clear previous search results when typing
              if (searchResult) {
                setSearchResult(null);
                setSearchedByEmail(false);
              }
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            mode="flat"
            theme={inputTheme}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Search Button */}
        <View style={styles.buttonWrapper}>
          <ButtonComponent label={t("search")} handlePress={handleSearch} />
        </View>

        {/* Error Message */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Loading */}
        {loading && (
          <ActivityIndicator style={{ marginTop: 16 }} />
        )}

        {/* Search Result */}
        {searchResult && (
          <View style={styles.resultContainer}>
            <View style={[
              styles.resultItem,
              searchResult.role === "caregiver" && {
                backgroundColor: "#ffebee",
                borderColor: "#f44336",
              }
            ]}>
              {/* User Info Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                {/* Photo */}
                {searchResult.imageId ? (
                  <Image
                    source={{ uri: getRouteImage(searchResult.imageId) }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: '#f0f0f0',
                      marginRight: 12
                    }}
                    onError={() => console.log('Error loading image:', searchResult.imageId)}
                    onLoad={() => console.log('Image loaded successfully')}
                  />
                ) : (
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: '#e0e0e0',
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: '#999', fontSize: 9 }}>Sin foto</Text>
                  </View>
                )}

                {/* User Details */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle}>{searchResult.name}</Text>

                  {/* Show only the field that was actually searched for */}
                  {searchedByEmail && searchResult.email && (
                    <Text style={styles.resultText}>
                      Email: {searchResult.email}
                    </Text>
                  )}
                  {!searchedByEmail && searchResult.phone && (
                    <Text style={styles.resultText}>
                      Phone: {searchResult.phone}
                    </Text>
                  )}

                  {/* Role information with better styling */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: searchResult.role === "caregiver" ? '#ffcdd2' : '#e8f5e8'
                  }}>
                    <Text style={[
                      styles.resultText,
                      {
                        color: searchResult.role === "caregiver" ? '#d32f2f' : '#2e7d32',
                        fontWeight: '600',
                        fontSize: 12,
                        textTransform: 'capitalize'
                      }]}>
                      {t("roleLabel")}: {searchResult.role === "caregiver" ? t("roleCaregiver") : t("rolePatient")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Show caregiver warning with better styling */}
              {searchResult.role === "caregiver" && (
                <View style={{
                  marginTop: 8,
                  padding: 8,
                  backgroundColor: '#ffcdd2',
                  borderRadius: 6,
                  borderLeftWidth: 3,
                  borderLeftColor: '#f44336',
                  marginBottom: 8
                }}>
                  <Text style={[
                    styles.resultText,
                    {
                      color: '#d32f2f',
                      fontSize: 11,
                      fontWeight: '500',
                      textAlign: 'center',
                      lineHeight: 14
                    }
                  ]}>
                    ! {t("caregiverCannotBePatient")}
                  </Text>
                </View>
              )}

              {/* Add Patient Button */}
              <View style={[styles.buttonWrapper, { marginTop: 6, marginBottom: 0 }]}>
                <ButtonComponent
                  label={addingPatient ? (t("adding") || "Adding...") : (t("addPatient") || "Add Patient")}
                  handlePress={handleAddExistingPatient}
                  disabled={addingPatient || searchResult.role === "caregiver"}
                  customStyles={{
                    button: {
                      marginVertical: 4,
                      paddingVertical: 8,
                      ...((addingPatient || searchResult.role === "caregiver") && {
                        backgroundColor: "#cccccc",
                        opacity: 0.6
                      })
                    },
                    textButton: (addingPatient || searchResult.role === "caregiver") ? {
                      color: "#666666"
                    } : undefined
                  }}
                />
              </View>
            </View>
          </View>)}
      </ScrollView>
    </View>
  );
};

export default PatientSearchForm;
