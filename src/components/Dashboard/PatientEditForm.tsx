// /src/components/Dashboard/PatientEditForm.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, Image, Platform, Dimensions } from "react-native";
import { TextInput } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated";
import { useLanguage } from "@context/LanguageContext";
import { useUserContext } from "@context/UserContext";
import ButtonComponent from "@components/common/Button";
import { useStylesPatientModalForms, inputTheme } from "@styles/components/stylesPatientModalForms";
import { getRouteAPI, fetchOptions, getRouteImage, logError, pickImage, validatePatientUniqueness } from "@utils";
import {
  User,
  TypeBodyUpdateUserData,
  ResponseUpdateUserData,
  ResponseUploadImage
} from "@typesAPI";

/**
 * Screen height constant for responsive design.
 */
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Fixed form height as percentage of screen height.
 */
const FORM_HEIGHT = SCREEN_HEIGHT * 0.3; // Fixed 60% of screen height like other modals

/**
 * Props interface for the PatientEditForm component.
 * @interface PatientEditFormProps
 * @property {User} patient - The patient object containing existing data to be edited
 * @property {() => void} [onPatientUpdated] - Optional callback function called when patient is successfully updated
 */
interface PatientEditFormProps {
  patient: User;
  onPatientUpdated?: () => void;
}

/**
 * PatientEditForm component for editing existing patients.
 * 
 * This form provides a comprehensive interface for caregivers to edit existing patient profiles
 * with pre-populated data, validation, image upload capabilities, and real-time form validation.
 * 
 * Features:
 * - Form fields pre-populated with existing patient information
 * - Real-time validation with visual feedback and shake animations
 * - Image upload functionality for updating patient photos
 * - Uniqueness validation for phone and email (excluding current patient)
 * - Accessibility support with proper labels and error messages
 * - ScrollView for form scrollability on smaller screens
 * - Consistent styling with design system
 * - Loading states and error handling
 * - Proper data type conversion for arrays (conditions, allergies)
 * 
 * Form Fields:
 * - Name (required, pre-populated)
 * - Phone (required, pre-populated, must be unique)
 * - Email (optional, pre-populated, must be unique if provided)
 * - Age (optional, pre-populated, numeric validation)
 * - Description (optional, pre-populated)
 * - Medical conditions (optional, pre-populated from array)
 * - Allergies (optional, pre-populated from array)
 * - Profile photo (optional, shows existing photo, allows update)
 * 
 * @component
 * @param {PatientEditFormProps} props - Component props
 * @param {User} props.patient - The patient object containing existing data to be edited
 * @param {() => void} [props.onPatientUpdated] - Callback function called when patient is successfully updated
 * @returns {JSX.Element} The rendered patient edit form
 * 
 * @example
 * <PatientEditForm 
 *   patient={selectedPatient}
 *   onPatientUpdated={() => {
 *     console.log('Patient updated successfully');
 *     refreshPatientList();
 *     closeModal();
 *   }}
 * />
 */
const PatientEditForm: React.FC<PatientEditFormProps> = ({
  patient,
  onPatientUpdated
}) => {
  const styles = useStylesPatientModalForms();
  const { t } = useLanguage();
  const { userData } = useUserContext();

  // Form state - initialize with patient data
  const [name, setName] = useState(patient.name || "");
  const [phone, setPhone] = useState(patient.phone || "");
  const [email, setEmail] = useState(patient.email || "");
  const [age, setAge] = useState(patient.age?.toString() || "");
  const [description, setDescription] = useState(patient.description || "");
  const [conditions, setConditions] = useState(
    Array.isArray(patient.conditions) ? patient.conditions.join(", ") : ""
  );
  const [allergies, setAllergies] = useState(
    Array.isArray(patient.allergies) ? patient.allergies.join(", ") : ""
  );
  const [selectedImageId, setSelectedImageId] = useState(patient.imageId || "");
  const [localImageUri, setLocalImageUri] = useState("");
  const [imageWasUploaded, setImageWasUploaded] = useState<boolean>(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    email: false,
    age: false,
    phoneUnique: false,
    emailUnique: false,
  });

  // Animation state for input validation
  const shakeAnimations = {
    name: useSharedValue(0),
    phone: useSharedValue(0),
    email: useSharedValue(0),
    age: useSharedValue(0),
  };

  // Animated styles for shake effect
  const animatedStyles = {
    name: useAnimatedStyle(() => ({
      transform: [{ translateX: shakeAnimations.name.value }],
    })),
    phone: useAnimatedStyle(() => ({
      transform: [{ translateX: shakeAnimations.phone.value }],
    })),
    email: useAnimatedStyle(() => ({
      transform: [{ translateX: shakeAnimations.email.value }],
    })),
    age: useAnimatedStyle(() => ({
      transform: [{ translateX: shakeAnimations.age.value }],
    })),
  };

  // Trigger shake animation for validation errors
  const triggerShake = (field: keyof typeof shakeAnimations) => {
    const valueToMove = 5;
    const duration = 50;

    shakeAnimations[field].value = withSequence(
      withTiming(-valueToMove, { duration }),
      withTiming(valueToMove, { duration: duration * 2 }),
      withTiming(-valueToMove, { duration: duration * 2 }),
      withTiming(valueToMove, { duration: duration * 2 }),
      withTiming(0, { duration }),
    );
  };

  // Validation functions (same as create form)
  const isValidName = (value: string) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return value.trim().length > 0 && nameRegex.test(value.trim());
  };

  const isValidPhone = (value: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  };

  const isValidEmail = (value: string) => {
    if (value.trim() === '') return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  };

  const isValidAge = (value: string) => {
    if (value.trim() === '') return true; // Optional field
    const ageRegex = /^\d{1,2}$/;
    const numAge = parseInt(value);
    return ageRegex.test(value) && numAge > 0 && numAge <= 99;
  };

  // Real-time validation handlers
  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name && isValidName(value)) {
      setErrors(prev => ({ ...prev, name: false }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setPhone(numericValue);
    if ((errors.phone || errors.phoneUnique) && isValidPhone(numericValue)) {
      setErrors(prev => ({ ...prev, phone: false, phoneUnique: false }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if ((errors.email || errors.emailUnique) && isValidEmail(value)) {
      setErrors(prev => ({ ...prev, email: false, emailUnique: false }));
    }
  };

  const handleAgeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 2);
    setAge(numericValue);
    if (errors.age && isValidAge(numericValue)) {
      setErrors(prev => ({ ...prev, age: false }));
    }
  };

  // Validation
  const validateForm = async () => {
    const newErrors = {
      name: !isValidName(name),
      phone: !isValidPhone(phone),
      email: !isValidEmail(email),
      age: !isValidAge(age),
      phoneUnique: false,
      emailUnique: false,
    };

    try {
      console.log("[EDIT] Current patient info:", {
        userId: patient.userId,
        _id: patient._id,
        phone: patient.phone,
        email: patient.email
      });

      if (!newErrors.phone && phone.trim() && phone.trim() !== patient.phone) {
        console.log(`[EDIT] Checking phone uniqueness for: ${phone.trim()}, excluding userId: ${patient.userId}`);
        const phoneValidation = await validatePatientUniqueness(
          phone.trim(),
          "",
          patient.userId
        );

        console.log("[EDIT] Phone validation result:", phoneValidation);

        if (!phoneValidation.isUnique && phoneValidation.conflicts?.phone) {
          newErrors.phoneUnique = true;
          newErrors.phone = true;
          console.log("[EDIT] Phone conflict detected, setting errors");
        } else {
          console.log("[EDIT] Phone is unique");
        }
      } else if (phone.trim() === patient.phone) {
        console.log("[EDIT] Phone unchanged, skipping uniqueness check");
      }

      if (!newErrors.email && email.trim() && email.trim() !== patient.email) {
        console.log(`[EDIT] Checking email uniqueness for: ${email.trim()}, excluding userId: ${patient.userId}`);
        const emailValidation = await validatePatientUniqueness(
          "",
          email.trim(),
          patient.userId
        );

        console.log("[EDIT] Email validation result:", emailValidation);

        if (!emailValidation.isUnique && emailValidation.conflicts?.email) {
          newErrors.emailUnique = true;
          newErrors.email = true;
          console.log("[EDIT] Email conflict detected, setting errors");
        } else {
          console.log("[EDIT] Email is unique");
        }
      } else if (email.trim() === patient.email) {
        console.log("[EDIT] Email unchanged, skipping uniqueness check");
      }
    } catch (error) {
      console.error("Error validating uniqueness:", error);
    }

    Object.entries(newErrors).forEach(([field, hasError]) => {
      if (hasError && field in shakeAnimations) {
        triggerShake(field as keyof typeof shakeAnimations);
      }
    });

    console.log("[EDIT] Final validation errors:", newErrors);
    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(error => error);
    console.log("[EDIT] Form is valid:", !hasErrors);
    return !hasErrors;
  };  // Check if there are any validation errors
  const hasValidationErrors = Object.values(errors).some(error => error);

  /**
   * Handles image selection using expo-image-picker
   */
  const handlerSelectImage = async () => {
    try {
      const result = await pickImage(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setLocalImageUri(imageUri);
        console.log(t("imageSelectedWillUpload"));
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert(t("error"), t("errorSelectingImage"));
    }
  };

  /**
   * Handles patient update
   */
  const handleUpdate = async () => {
    console.log("handleUpdate iniciado");

    if (!(await validateForm())) {
      console.log("Formulario no válido");
      return;
    }

    if (!userData?.userId) {
      Alert.alert(t("error"), t("userDataNotAvailable"));
      return;
    }

    setLoading(true);

    try {
      let finalImageId = selectedImageId;

      if (localImageUri) {
        console.log("Uploading new image...");

        try {
          const formData = new FormData();

          if (Platform.OS === "web") {
            console.log("Web mode, processing blob...");
            const response = await fetch(localImageUri);
            const blob = await response.blob();
            const file = new File([blob], 'patient_image.jpg', {
              type: 'image/jpeg'
            });
            formData.append('images', file);
          } else {
            console.log("Native mode, creating formValue...");
            const formValue = {
              uri: localImageUri,
              name: 'patient_image.jpg',
              type: "image/jpeg",
            } as any;
            formData.append('images', formValue);
          }

          formData.append('userId', patient.userId);

          const uploadResponse = await fetch(getRouteAPI("/uploadOnly"), {
            method: "POST",
            body: formData,
          });

          const uploadResult: ResponseUploadImage = await uploadResponse.json();

          if (uploadResult?.success && uploadResult.files && uploadResult.files.length > 0) {
            const fileInfo = uploadResult.files[0];
            finalImageId = typeof fileInfo === "string" ? fileInfo : (fileInfo as any).path;
            setImageWasUploaded(true);
            console.log("Image uploaded successfully:", finalImageId);
          } else {
            console.warn("Image upload failed, continuing without new image");
          }
        } catch (uploadError) {
          console.warn("Image upload error:", uploadError);
        }
      }

      // Prepare updated patient data
      const updatedPatientData: Partial<User> = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        age: age.trim() ? parseInt(age) : undefined,
        description: description.trim(),
        conditions: conditions.trim() ? conditions.split(',').map(c => c.trim()).filter(c => c) : [],
        allergies: allergies.trim() ? allergies.split(',').map(a => a.trim()).filter(a => a) : [],
        imageId: finalImageId,
      };

      console.log("Updating patient with data:", updatedPatientData);
      console.log("Patient userId:", patient.userId);

      const response = await fetch(
        getRouteAPI("/updateUserData"),
        fetchOptions<TypeBodyUpdateUserData>("POST", {
          userId: patient.userId,
          userData: updatedPatientData as User
        })
      );

      const result: ResponseUpdateUserData = await response.json();

      if (result.success) {
        console.log("Patient updated successfully");

        onPatientUpdated?.();

        Alert.alert(
          t("success"),
          t("patientUpdatedSuccessfully")
        );
      } else {
        console.error("Error updating patient:", result.error);
        Alert.alert(
          t("error"),
          result.error?.message || t("errorUpdatingPatient")
        );
      }
    } catch (error) {
      console.error("Error in handleUpdate:", error);
      logError("Error updating patient", error);
      Alert.alert(t("error"), t("errorUpdatingPatient"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renders the image section
   */
  const renderImageSection = () => {
    let imageUri = null;

    if (localImageUri) {
      imageUri = localImageUri;
    } else if (selectedImageId && selectedImageId.trim() !== "") {
      try {
        imageUri = getRouteImage(selectedImageId);
      } catch (error) {
        console.warn("Error loading image:", error);
        imageUri = null;
      }
    }

    return (
      <>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>{t("noImage")}</Text>
            </View>
          )}
          <View style={styles.imageButtonsContainer}>
            <ButtonComponent
              label={selectedImageId || localImageUri ? t("changeImage") : t("selectImage")}
              handlePress={handlerSelectImage}
              customStyles={{
                button: styles.imageButton,
                textButton: styles.imageButtonText,
              }}
              touchableOpacity
            />
            {(selectedImageId || localImageUri) && (
              <ButtonComponent
                label={t("removeImage")}
                handlePress={() => {
                  setSelectedImageId("");
                  setLocalImageUri("");
                }}
                customStyles={{
                  button: [styles.imageButton, styles.removeImageButtonEdit],
                  textButton: [styles.imageButtonText, styles.removeImageButtonTextEdit],
                }}
                touchableOpacity
              />
            )}
          </View>
        </View>
        {localImageUri && (
          <Text style={styles.imageHint}>{t("imageSelectedWillUpload")}</Text>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.fixedContainer, { height: FORM_HEIGHT }]}>
        <ScrollView
          contentContainerStyle={styles.formWrapper}
          showsVerticalScrollIndicator={false}
        >
          {/* Name Field */}
          <Animated.View style={[styles.inputContainer, animatedStyles.name]}>
            <TextInput
              label={`${t("fullName")} *`}
              value={name}
              onChangeText={handleNameChange}
              mode="flat"
              theme={inputTheme}
              style={styles.input}
              autoCapitalize="words"
              error={errors.name}
              disabled={loading}
            />
            {errors.name && (
              <Text style={styles.errorText}>{t("invalidName")}</Text>
            )}
          </Animated.View>

          {/* Phone Field */}
          <Animated.View style={[styles.inputContainer, animatedStyles.phone]}>
            <TextInput
              label={`${t("numberPhone")} *`}
              value={phone}
              onChangeText={handlePhoneChange}
              mode="flat"
              theme={inputTheme}
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
              disabled={loading}
            />
            {errors.phone && (
              <Text style={styles.errorText}>
                {errors.phoneUnique ? t("phoneAlreadyExists") : t("invalidPhone")}
              </Text>
            )}
          </Animated.View>

          {/* Email Field */}
          <Animated.View style={[styles.inputContainer, animatedStyles.email]}>
            <TextInput
              label={`${t("email")} (${t("optional")})`}
              value={email}
              onChangeText={handleEmailChange}
              mode="flat"
              theme={inputTheme}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              disabled={loading}
            />
            {errors.email && (
              <Text style={styles.errorText}>
                {errors.emailUnique ? t("emailAlreadyExists") : t("invalidEmail")}
              </Text>
            )}
          </Animated.View>

          {/* Age Field */}
          <Animated.View style={[styles.inputContainer, animatedStyles.age]}>
            <TextInput
              label={`${t("age")} (${t("optional")}) - 1-99`}
              value={age}
              onChangeText={handleAgeChange}
              mode="flat"
              theme={inputTheme}
              style={styles.input}
              keyboardType="numeric"
              maxLength={2}
              error={errors.age}
              disabled={loading}
            />
            {errors.age && (
              <Text style={styles.errorText}>{t("invalidAge")}</Text>
            )}
          </Animated.View>

          {/* Description Field */}
          <View style={styles.inputContainer}>
            <TextInput
              label={`${t("description")} (${t("optional")})`}
              value={description}
              onChangeText={setDescription}
              mode="flat"
              theme={inputTheme}
              style={styles.input}
              multiline
              numberOfLines={3}
              disabled={loading}
            />
          </View>

          {/* Conditions Field */}
          <View style={styles.inputContainer}>
            <TextInput
              label={`${t("conditions")} (${t("optional")})`}
              value={conditions}
              onChangeText={setConditions}
              mode="flat"
              theme={inputTheme}
              style={styles.input}
              multiline
              numberOfLines={2}
              disabled={loading}
            />
            <Text style={styles.helperText}>
              {t("separateWithCommas")}
            </Text>
          </View>

          {/* Allergies Field */}
          <View style={styles.inputContainer}>
            <TextInput
              label={`${t("allergies")} (${t("optional")})`}
              value={allergies}
              onChangeText={setAllergies}
              mode="flat"
              theme={inputTheme}
              style={styles.input}
              multiline
              numberOfLines={2}
              disabled={loading}
            />
            <Text style={styles.helperText}>
              {t("separateWithCommas")}
            </Text>
          </View>

          {/* Image Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("userImage")}</Text>
            {renderImageSection()}
          </View>

          {/* Submit Button */}
          <View style={styles.buttonWrapper}>
            <ButtonComponent
              label={loading ? t("updating") : t("updatePatient")}
              handlePress={handleUpdate}
              disabled={loading}
            />
          </View>

          {/* Error Banner */}
          {hasValidationErrors && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerIcon}>!</Text>
              <Text style={styles.errorBannerText}>
                {t("errorEmpty")}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.scrollHint} />
      </View>
    </View>
  );
};

export default PatientEditForm;
