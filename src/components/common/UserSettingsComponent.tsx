import React, { useState, useEffect } from "react";
import { View, Alert, Image, ScrollView, Pressable } from "react-native";
import { useLanguage } from "@context/LanguageContext";
import ButtonComponent from "@components/common/Button";
import { useUserContext } from "@context/UserContext";
import { RoleType, User } from "@typesAPI";
import { Text, TextInput } from "react-native-paper";
import { getRouteImage, log, logError, uploadImage } from "@/utils";
import stylesSettings from "@/styles/components/stylesSettingsComponent";

const roles: RoleType[] = ["caregiver", "patient", "both"];

/**
 * UserSettingsComponent is a React functional component that provides a user interface
 * for viewing and editing user profile settings such as role, name, phone number,
 * description, and profile image. It loads the current user data from context on mount,
 * allows the user to update their information, and validates input before saving.
 *
 * Features:
 * - Role selection with visual feedback.
 * - Editable fields for name, phone, and description.
 * - Profile image display and upload functionality.
 * - Input validation for required fields and phone format.
 * - Uses translations for multi-language support.
 * - Responsive styles for different device types.
 *
 * Contexts & Hooks:
 * - Uses `useUserContext` for accessing and updating user data.
 * - Uses `useLanguage` for translations.
 * - Uses `stylesSettings` for responsive styling.
 *
 * @component
 * @returns {JSX.Element} The rendered user settings form.
 */
const UserSettingsComponent: React.FC = () => {
  const { userData, updateUserData } = useUserContext();
  const { styles, isPhone, isTablet, isWeb } = stylesSettings();
  const { translations } = useLanguage();

  const [role, setRole] = useState<RoleType>("caregiver");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageId, setImageId] = useState<string>("");

  const handlerUploadImage = () => {
    if (!userData) return;
    uploadImage(userData.userId);
  };

  useEffect(() => {
    if (!userData) return;

    setRole(userData.role);
    setName(userData.name);
    setPhone(userData.phone);
    setDescription(userData.description);
    setImageId(userData.imageId);
  }, [userData]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    if (!phone?.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert(
        "Error",
        "El teléfono debe contener solo números y tener 10 dígitos"
      );
      return;
    }

    const updatedUserData: User = {
      role,
      name,
      phone,
      description,
      imageId,
    } as User;

    await updateUserData(updatedUserData, (success, error) => {
      if (error) logError(error);
      if (success) Alert.alert("Éxito", "Datos actualizados correctamente");
    });
  };

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
              {translations[r]}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderImage = () => {
    return (
      <View style={styles.imageContainer}>
        {imageId ? (
          <Image
            source={{ uri: getRouteImage(imageId) }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {translations.noImage}
            </Text>
          </View>
        )}
        <ButtonComponent
          replaceStyles={{
            button: styles.button,
            textButton: styles.textButton,
          }}
          handlePress={handlerUploadImage}
          label={translations.uploadImage}
          touchableOpacity
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>{translations.role}</Text>
      {renderRoleButtons()}

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        label={translations.fullName}
        autoCapitalize="words"
        underlineColor="#00a69d"
        activeUnderlineColor="#00a69d"
      />

      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        label={translations.mumberPhone}
        keyboardType="phone-pad"
        underlineColor="#00a69d"
        activeUnderlineColor="#00a69d"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        label={translations.description}
        multiline
        numberOfLines={2}
        underlineColor="#00a69d"
        activeUnderlineColor="#00a69d"
      />

      <Text style={styles.label}>{translations.userImage}</Text>
      {renderImage()}

      <ButtonComponent
        replaceStyles={{ button: styles.button, textButton: styles.textButton }}
        label={translations.save}
        handlePress={handleSave}
        touchableOpacity
      />
    </ScrollView>
  );
};

export default UserSettingsComponent;
