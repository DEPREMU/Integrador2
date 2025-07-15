import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, View } from "react-native";
import ButtonComponent from "@components/common/Button";
import { useLanguage } from "@/context/LanguageContext";
import useStylesSettings from "@styles/components/stylesSettingsComponent";
import { useUserContext } from "@context/UserContext";
import { RoleType, User } from "@typesAPI";
import { Text, TextInput } from "react-native-paper";
import { getRouteImage, logError, uploadImage } from "@/utils";

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
  const { t } = useLanguage();
  const { styles } = useStylesSettings();
  const { userData, updateUserData } = useUserContext();

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
        "El teléfono debe contener solo números y tener 10 dígitos",
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
              {t(r as keyof typeof t)}
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
    <ScrollView style={styles.container}>
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
        replaceStyles={{ button: styles.button, textButton: styles.textButton }}
        label={t("save")}
        handlePress={handleSave}
        touchableOpacity
      />
    </ScrollView>
  );
};

export default UserSettingsComponent;
