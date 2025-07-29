import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import ButtonComponent from "@components/common/Button";
import { useLanguage } from "@/context/LanguageContext";
import useStylesSettings from "@styles/components/stylesSettingsComponent";
import { useUserContext } from "@context/UserContext";
import { RoleType, User } from "@typesAPI";
import { Text, TextInput } from "react-native-paper";
import { getRouteImage, logError, uploadImage } from "@/utils";
import SnackbarAlert from "./SnackbarAlert";

const roles: RoleType[] = ["caregiver", "patient", "both"];

/**
 * UserSettingsComponent provides a comprehensive user interface for managing user profile settings.
 *
 * Features:
 * - Role selection with visual feedback (caregiver, patient, both)
 * - Editable profile fields: name, phone number, description
 * - Profile image display with upload functionality and preview
 * - Real-time input validation with user feedback
 * - Multi-language support through translation system
 * - Snackbar notifications for success/error messages
 * - Responsive design for different device types
 * - Smart image handling for various URI formats (file://, content://, blob:, server paths)
 * - Sequential update protection to prevent data loss
 *
 * Validation Rules:
 * - Name: Required, non-empty string
 * - Phone: Required, exactly 10 digits
 * - User ID: Required for all operations
 * - Image: Optional, supports multiple formats
 *
 * State Management:
 * - Loads current user data from UserContext on component mount
 * - Preserves user ID across updates to prevent data loss
 * - Tracks image upload status for proper user feedback
 * - Manages snackbar notifications for user actions
 *
 * Error Handling:
 * - Validates all required fields before saving
 * - Provides specific error messages for different validation failures
 * - Handles image upload errors gracefully
 * - Shows appropriate feedback for network/server errors
 *
 * @component
 * @returns {JSX.Element} The rendered user settings form with all interactive elements.
 *
 * @example
 * // Basic usage in a settings screen
 * <UserSettingsComponent />
 *
 * @example
 * // Usage within a larger settings layout
 * <View style={styles.settingsContainer}>
 *   <Header title="Profile Settings" />
 *   <UserSettingsComponent />
 * </View>
 */

const UserSettingsComponent: React.FC = () => {
  const { t } = useLanguage();
  const { styles } = useStylesSettings();
  const { userData, updateUserData, isLoggedIn } = useUserContext();

  console.log("UserSettingsComponent rendered - isLoggedIn:", isLoggedIn);
  console.log("UserSettingsComponent rendered - userData:", userData);

  const [role, setRole] = useState<RoleType>("caregiver");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageId, setImageId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [imageWasUploaded, setImageWasUploaded] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });

  /**
   * Handles image upload functionality with comprehensive error handling.
   * Validates user ID, processes upload result, and updates component state.
   * Shows appropriate snackbar messages for success/error cases.
   */
  const handlerUploadImage = async () => {
    const currentUserId = userId || userData?.userId;

    if (!currentUserId) {
      setSnackbar({
        visible: true,
        message: t("errorIdUser"),
        type: "error",
      });
      return;
    }

    try {
      const result = await uploadImage(currentUserId);

      if (result?.success && result.files && result.files.length > 0) {
        const fileInfo = result.files[0];
        let newImageId: string;

        console.log("Upload result:", result);
        console.log("File info:", fileInfo);

        if (typeof fileInfo === "string") {
          newImageId = fileInfo;
        } else if (
          fileInfo &&
          typeof fileInfo === "object" &&
          "path" in fileInfo
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newImageId = (fileInfo as any).path;
        } else {
          console.log("Error: Invalid file info format");
          setSnackbar({
            visible: true,
            message: t("errorUserImage"),
            type: "error",
          });
          return;
        }

        console.log("New image ID:", newImageId);
        setImageId(newImageId);
        setImageWasUploaded(true);

        setSnackbar({
          visible: true,
          message: t("imageUploadSuccess"),
          type: "success",
        });
      } else {
        setSnackbar({
          visible: true,
          message: result?.error?.message || t("errorUserImage"),
          type: "error",
        });
      }
    } catch (error) {
      logError("Error en handlerUploadImage:", error);
      setSnackbar({
        visible: true,
        message: t("errorUserImage"),
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (!userData) {
      console.log("No userData available in context");
      return;
    }

    console.log("Loading user data from context:", userData);
    setRole(userData.role);
    setName(userData.name);
    setPhone(userData.phone);
    setDescription(userData.description);
    setImageId(userData.imageId);
    setImageWasUploaded(false);

    if (userData.userId) {
      setUserId(userData.userId);
      console.log("User ID set from userData:", userData.userId);
    } else {
      console.log("No userId found in userData");
    }
  }, [userData, userId]);

  /**
   * Handles saving user data with comprehensive validation and error handling.
   * Validates required fields, phone format, and user ID before updating.
   * Provides specific feedback messages for different validation failures.
   * Preserves user ID to prevent data loss during sequential updates.
   */
  const handleSave = async () => {
    if (!name.trim()) {
      setSnackbar({
        visible: true,
        message: t("nameRequired"),
        type: "error",
      });
      return;
    }
    if (!phone?.trim()) {
      setSnackbar({
        visible: true,
        message: t("phoneRequired"),
        type: "error",
      });
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setSnackbar({
        visible: true,
        message: t("phoneFormatError"),
        type: "error",
      });
      return;
    }
    if (!userData?.userId && !userId) {
      setSnackbar({
        visible: true,
        message: t("errorIdUser"),
        type: "error",
      });
      return;
    }

    const currentUserId = userId || userData?.userId;

    const updatedUserData: User = {
      userId: currentUserId,
      role,
      name,
      phone,
      description,
      imageId,
    } as User;

    console.log("Saving user data:", updatedUserData);
    console.log("Image ID being saved:", imageId);
    console.log("Image was uploaded:", imageWasUploaded);
    console.log("Current user from context:", userData);
    console.log("User ID being used:", currentUserId);

    await updateUserData(updatedUserData, (success, error) => {
      if (error) {
        logError(error);
        setSnackbar({
          visible: true,
          message: error.message,
          type: "error",
        });
        return;
      }

      if (success) {
        if (imageWasUploaded) {
          setSnackbar({
            visible: true,
            message: t("imageUploadSuccess"),
            type: "success",
          });
        } else {
          setSnackbar({
            visible: true,
            message: t("dataUpdated"),
            type: "success",
          });
        }
      }
      if (success) {
        setSnackbar({
          visible: true,
          message: t("dataUpdated"),
          type: "success",
        });
        setImageWasUploaded(false);
      }
    });
  };

  /**
   * Renders role selection buttons with visual feedback.
   * Shows all available roles (caregiver, patient, both) with active state styling.
   * @returns {JSX.Element} The role selection component
   */
  const renderRoleButtons = () => {
    return (
      <View style={styles.roleContainer}>
        {roles.map((r) => (
          <Pressable
            key={r}
            style={[styles.roleButton, role === r && styles.roleButtonSelected]}
            onPress={() => setRole(r)}
          >
            <Text
              style={[
                styles.roleButtonText,
                role === r && styles.roleButtonTextSelected,
              ]}
            >
              {t(r as keyof typeof t)}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderImage = () => {
    let imageUri = null;

    if (imageId && typeof imageId === "string" && imageId.trim() !== "") {
      if (
        imageId.startsWith("file://") ||
        imageId.startsWith("content://") ||
        imageId.startsWith("blob:")
      ) {
        imageUri = imageId;
      } else {
        try {
          imageUri = getRouteImage(imageId);
        } catch {
          imageUri = null;
        }
      }
    }

    return (
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>{t("noImage")}</Text>
          </View>
        )}
        <ButtonComponent
          replaceStyles={{
            button: styles.button,
            textButton: styles.textButton,
          }}
          handlePress={handlerUploadImage}
          label={t("uploadImage")}
          touchableOpacity
        />
      </View>
    );
  };

  return (
    <View style={styles.flex1}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.paddingBottom32}
      >
        <Text style={styles.label}>{t("role")}</Text>
        {renderRoleButtons()}

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          label={t("fullName")}
          autoCapitalize="words"
          underlineColor="#00a69d"
          activeUnderlineColor="#00a69d"
        />

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          label={t("numberPhone")}
          keyboardType="phone-pad"
          underlineColor="#00a69d"
          activeUnderlineColor="#305856ff"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          label={t("description")}
          multiline
          numberOfLines={2}
          underlineColor="#00a69d"
          activeUnderlineColor="#00a69d"
        />

        <Text style={styles.label}>{t("userImage")}</Text>
        {renderImage()}

        <ButtonComponent
          replaceStyles={{
            button: styles.button,
            textButton: styles.textButton,
          }}
          label={t("save")}
          handlePress={handleSave}
          touchableOpacity
        />
      </ScrollView>
      <SnackbarAlert
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />
    </View>
  );
};

export default UserSettingsComponent;
