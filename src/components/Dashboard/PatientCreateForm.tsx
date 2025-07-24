// /src/components/Dashboard/PatientCreateForm.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, Alert, Image, Pressable, Platform, Dimensions } from "react-native";
import { TextInput } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated";
import { useLanguage } from "@context/LanguageContext";
import { useUserContext } from "@context/UserContext";
import ButtonComponent from "@components/common/Button";
import { useStylesPatientModalForms, inputTheme } from "@styles/components/stylesPatientModalForms";
import { getRouteAPI, fetchOptions, uploadImage, getRouteImage, logError, validatePatientUniqueness } from "@utils";
import {
  TypeBodyCreatePatient,
  ResponseCreatePatient
} from "@typesAPI";

/**
 * Props interface for the PatientCreateForm component.
 * @interface PatientCreateFormProps
 * @property {() => void} [onPatientCreated] - Optional callback function called when a patient is successfully created
 */
interface PatientCreateFormProps {
  onPatientCreated?: () => void;
}

/**
 * PatientCreateForm component for creating new patients.
 * 
 * This form provides a comprehensive interface for caregivers to create new patient profiles
 * with validation, image upload capabilities, and real-time form validation.
 * 
 * Features:
 * - Complete form fields for patient information (name, phone, email, age, etc.)
 * - Real-time validation with visual feedback and shake animations
 * - Image upload functionality for patient photos
 * - Uniqueness validation for phone and email
 * - Accessibility support with proper labels and error messages
 * - ScrollView for form scrollability on smaller screens
 * - Consistent styling with design system
 * - Loading states and error handling
 * 
 * Form Fields:
 * - Name (required)
 * - Phone (required, must be unique)
 * - Email (optional, must be unique if provided)
 * - Age (optional, numeric validation)
 * - Description (optional)
 * - Medical conditions (optional)
 * - Allergies (optional)
 * - Profile photo (optional, with upload capability)
 * 
 * @component
 * @param {PatientCreateFormProps} props - Component props
 * @param {() => void} [props.onPatientCreated] - Callback function called when patient is successfully created
 * @returns {JSX.Element} The rendered patient create form
 * 
 * @example
 * <PatientCreateForm 
 *   onPatientCreated={() => {
 *     console.log('Patient created successfully');
 *     refreshPatientList();
 *   }}
 * />
 */
const PatientCreateForm: React.FC<PatientCreateFormProps> = ({ onPatientCreated }) => {
  const styles = useStylesPatientModalForms();
  const { t } = useLanguage();
  const { userData } = useUserContext();

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [conditions, setConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
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
    phoneUnique: useSharedValue(0),
    emailUnique: useSharedValue(0),
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
    phoneUnique: useAnimatedStyle(() => ({
      transform: [{ translateX: shakeAnimations.phoneUnique.value }],
    })),
    emailUnique: useAnimatedStyle(() => ({
      transform: [{ translateX: shakeAnimations.emailUnique.value }],
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

  // Validation functions
  const isValidName = (value: string) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return value.trim().length > 0 && nameRegex.test(value.trim());
  };

  const isValidPhone = (value: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  };

  const isValidEmail = (value: string) => {
    if (value.trim() === '') return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  };

  const isValidAge = (value: string) => {
    if (value.trim() === '') return true;
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
    if (errors.phone && isValidPhone(numericValue)) {
      setErrors(prev => ({ ...prev, phone: false }));
    }
    if (errors.phoneUnique) {
      setErrors(prev => ({ ...prev, phoneUnique: false }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email && isValidEmail(value)) {
      setErrors(prev => ({ ...prev, email: false }));
    }
    if (errors.emailUnique) {
      setErrors(prev => ({ ...prev, emailUnique: false }));
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
    console.log("validateForm started with values:", { name, phone, email, age });

    const newErrors = {
      name: !isValidName(name),
      phone: !isValidPhone(phone),
      email: !isValidEmail(email),
      age: !isValidAge(age),
      phoneUnique: false,
      emailUnique: false,
    };

    // Check uniqueness for phone and email separately
    try {
      // Only check phone uniqueness if phone format is valid
      if (!newErrors.phone && phone.trim()) {
        console.log("[FORM] Checking phone uniqueness for:", phone);
        const phoneValidation = await validatePatientUniqueness(
          phone.trim(),
          "" // Empty email to check only phone
          // No excludeUserId for create form since it's a new patient
        );

        console.log("[FORM] Phone validation result:", phoneValidation);

        if (!phoneValidation.isUnique && phoneValidation.conflicts?.phone) {
          newErrors.phoneUnique = true;
          newErrors.phone = true;
          console.log("[FORM] Phone conflict detected, setting errors");
        } else {
          console.log("[FORM] Phone is unique");
        }
      }

      // Only check email uniqueness if email format is valid and not empty
      if (!newErrors.email && email.trim()) {
        console.log("[FORM] Checking email uniqueness for:", email);
        const emailValidation = await validatePatientUniqueness(
          "", // Empty phone to check only email
          email.trim()
          // No excludeUserId for create form since it's a new patient
        );

        console.log("[FORM] Email validation result:", emailValidation);

        if (!emailValidation.isUnique && emailValidation.conflicts?.email) {
          newErrors.emailUnique = true;
          newErrors.email = true;
          console.log("[FORM] Email conflict detected, setting errors");
        } else {
          console.log("[FORM] Email is unique");
        }
      }
    } catch (error) {
      console.error("[FORM] Error validating uniqueness:", error);
      // Continue with form validation even if uniqueness check fails
    }

    // Trigger shake animations for fields with errors
    Object.entries(newErrors).forEach(([field, hasError]) => {
      if (hasError) {
        triggerShake(field as keyof typeof shakeAnimations);
      }
    });

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);

    const isValid = !Object.values(newErrors).some(error => error);
    console.log("Form valid:", isValid);

    return isValid;
  };

  // Check if there are any validation errors
  const hasValidationErrors = Object.values(errors).some(error => error);

  /**
   * Handles image selection (not upload) - only selects and shows locally.
   * Image will be uploaded only when patient creation is confirmed.
   */
  const handlerSelectImage = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(t("error"), t("permissionCameraRequired"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setLocalImageUri(selectedAsset.uri);
        setImageWasUploaded(false);
        Alert.alert(t("success"), t("imageSelectedWillUpload"));
      }
    } catch (error) {
      logError("Error in handlerSelectImage:", error);
      Alert.alert(t("error"), t("errorSelectingImage"));
    }
  };

  /**
   * Uploads a pre-selected image URI to the server
   */
  const uploadSelectedImage = async (imageUri: string, userId: string) => {
    console.log("uploadSelectedImage started with:", { imageUri, userId });
    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        console.log("Modo web, procesando blob...");
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const file = new File([blob], 'patient-image.jpg', {
          type: "image/jpeg",
        });
        formData.append("images", file);
      } else {
        console.log("Modo nativo, creando formValue...");
        const formValue = {
          uri: imageUri,
          name: 'patient-image.jpg',
          type: "image/jpeg",
        } as any;
        formData.append("images", formValue);
      }

      formData.append("userId", userId);
      console.log("FormData prepared, sending request...");

      const uploadResponse = await fetch(getRouteAPI("/uploadOnly"), {
        method: "POST",
        body: formData,
      });

      console.log("Response received, status:", uploadResponse.status);
      const data = await uploadResponse.json();
      console.log("Response data:", data);

      return { files: data.files, success: data.success };
    } catch (error) {
      console.error("Error in uploadSelectedImage:", error);
      logError("Error uploading selected image:", error);
      return {
        files: [],
        success: false,
        error: {
          message: "Error uploading image",
          timestamp: new Date().toISOString(),
        },
      };
    }
  };

  // Handle form submission
  const handleCreatePatient = async () => {
    console.log("handleCreatePatient started");

    if (!(await validateForm())) {
      console.log("Form validation failed");
      return;
    }

    if (!userData?.userId) {
      console.log("userData not available:", userData);
      Alert.alert(t("error"), t("userDataNotAvailable"));
      return;
    }

    console.log("Starting patient creation...");
    setLoading(true);

    try {
      let finalImageId = selectedImageId;

      // If there's a local selected image but not uploaded, upload it now
      if (localImageUri && !imageWasUploaded) {
        console.log("Uploading local image:", localImageUri);
        try {
          const result = await uploadSelectedImage(localImageUri, userData.userId);
          console.log("Upload result:", result);

          if (result?.success && result.files && result.files.length > 0) {
            const fileInfo = result.files[0];
            console.log("File uploaded successfully:", fileInfo);

            if (typeof fileInfo === "string") {
              finalImageId = fileInfo;
            } else if (
              fileInfo &&
              typeof fileInfo === "object" &&
              "path" in fileInfo
            ) {
              finalImageId = (fileInfo as any).path;
            }

            setSelectedImageId(finalImageId);
            setImageWasUploaded(true);
            console.log("Final image ID assigned:", finalImageId);
          } else {
            console.error("Error in upload result:", result);
            Alert.alert(
              t("error"),
              t("errorUploadingImagePatientCreated")
            );
            finalImageId = "";
          }
        } catch (error) {
          console.error("Error uploading image during patient creation:", error);
          logError("Error uploading image during patient creation:", error);
          Alert.alert(
            t("error"),
            t("errorUploadingImagePatientCreated")
          );
          finalImageId = "";
        }
      } else {
        console.log("No local image to upload, using existing imageId:", selectedImageId);
      }

      console.log("Creating patient with imageId:", finalImageId);

      const patientData = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || "",
        age: age ? parseInt(age) : 0,
        description: description.trim() || "",
        conditions: conditions ? conditions.split(",").map(c => c.trim()).filter(c => c) : [],
        allergies: allergies ? allergies.split(",").map(a => a.trim()).filter(a => a) : [],
        imageId: finalImageId,
        medications: [],
        caregiverId: userData.userId,
      };

      console.log("Patient data to send:", patientData);

      const response = await fetch(
        getRouteAPI("/createPatient"),
        fetchOptions<TypeBodyCreatePatient>("POST", {
          caregiverId: userData.userId,
          patientData,
        }),
      );

      console.log("Server response:", response.status);
      const data: ResponseCreatePatient = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        // Reset form
        setName("");
        setPhone("");
        setEmail("");
        setAge("");
        setDescription("");
        setConditions("");
        setAllergies("");
        setSelectedImageId("");
        setLocalImageUri("");
        setImageWasUploaded(false);
        setErrors({
          name: false,
          phone: false,
          email: false,
          age: false,
          phoneUnique: false,
          emailUnique: false
        });

        Alert.alert(
          t("success"),
          t("patientCreatedSuccessfully") || "Patient created successfully",
        );

        // Notify parent component
        if (onPatientCreated) {
          onPatientCreated();
        }
      } else {
        Alert.alert(
          t("error"),
          data.error?.message || t("failedToCreatePatient"),
        );
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      Alert.alert(t("error"), t("networkErrorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renders image display with selection functionality.
   * Shows current selected image or placeholder with select button.
   * @returns {JSX.Element} The image component
   */
  const renderImage = () => {
    // Prioritize local selected image, then uploaded image
    let imageUri = localImageUri || null;

    if (!imageUri && selectedImageId && typeof selectedImageId === "string" && selectedImageId.trim() !== "") {
      if (
        selectedImageId.startsWith("file://") ||
        selectedImageId.startsWith("content://") ||
        selectedImageId.startsWith("blob:")
      ) {
        imageUri = selectedImageId;
      } else {
        try {
          imageUri = getRouteImage(selectedImageId);
        } catch (error) {
          imageUri = null;
        }
      }
    }

    return (
      <View style={styles.imageUploadContainer}>
        {imageUri && (
          <Pressable
            style={styles.removeImageButtonExternal}
            onPress={() => {
              setLocalImageUri("");
              setSelectedImageId("");
              setImageWasUploaded(false);
            }}
          >
            <Text style={styles.removeImageText}>X {t("removeImage")}</Text>
          </Pressable>
        )}
        {imageUri ? (
          <View style={styles.selectedImageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.selectedImage}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>+</Text>
            <Text style={styles.imagePlaceholderText}>{t("noImage")}</Text>
          </View>
        )}
        <ButtonComponent
          replaceStyles={{
            button: styles.imageUploadButton,
            textButton: styles.imageUploadButtonText,
          }}
          handlePress={handlerSelectImage}
          label={localImageUri ? t("changeImage") : t("selectImage")}
          touchableOpacity
          disabled={loading}
        />
      </View>
    );
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
          paddingBottom: 80,
        }}
        nestedScrollEnabled={true}
      >
        <View style={styles.formContainer}>
          {/* Name Field */}
          <Animated.View style={[styles.inputContainer, animatedStyles.name]}>
            <TextInput
              label={`${t("name")} *`}
              value={name}
              onChangeText={handleNameChange}
              mode="flat"
              theme={inputTheme}
              style={styles.input}
              error={errors.name}
              disabled={loading}
            />
            {errors.name && (
              <Text style={styles.errorText}>
                {t("invalidName")}
              </Text>
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
              error={errors.age}
              disabled={loading}
              maxLength={2}
            />
            {errors.age && (
              <Text style={styles.errorText}>
                {t("invalidAge")}
              </Text>
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
              numberOfLines={2}
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
              disabled={loading}
            />
            <Text style={styles.helperText}>
              {t("separateWithCommas")}
            </Text>
          </View>

          {/* Image Upload */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("userImage")}</Text>
            {renderImage()}
          </View>

          {/* Submit Button */}
          <View style={styles.buttonWrapper}>
            <ButtonComponent
              label={loading ? (t("creating") || "Creating...") : (t("createPatient") || "Create Patient")}
              handlePress={() => {
                console.log("Button pressed!");
                handleCreatePatient();
              }}
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
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientCreateForm;
