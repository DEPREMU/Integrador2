// /src/styles/components/stylesPatientModalForms.ts
import { StyleSheet } from "react-native";

/**
 * Custom theme for all TextInput components in patient forms.
 * To be passed as: theme={inputTheme}
 */
export const inputTheme = {
  colors: {
    background: "#ecebea",
    surface: "#ecebea",
    onSurface: "#333333",
    primary: "#00a69d", // Color principal (era morado, ahora verde azulado)
    onSurfaceVariant: "#666666",
    placeholder: "#666666",
  },
};

/**
 * Shared styles for both patient search and creation forms.
 * Includes consistent inputs, labels, and result items.
 */
export const useStylesPatientModalForms = () => {
  return StyleSheet.create({
    formContainer: {
      width: "100%",
      maxWidth: "100%",
      backgroundColor: "transparent",
      padding: 0,
      gap: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: "#2c3e50",
    },

    // Container around the TextInput itself
    inputContainer: {
      width: 350,
      maxWidth: 350,
      alignSelf: "center",
      backgroundColor: "#ecebea",
      borderRadius: 16,
      borderBottomWidth: 2,
      borderBottomColor: "#00a69d",
      shadowColor: "#00a69d",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 1,
      minHeight: 60,
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
    },

    // Style for the TextInput inside the container
    input: {
      width: "100%",
      minHeight: 40,
      fontSize: 14,
      color: "#333333",
      backgroundColor: "transparent",
      borderWidth: 0,
      outlineWidth: 0,
    },

    // Error text styles
    errorText: {
      color: "#e74c3c",
      fontSize: 12,
      marginTop: 4,
      marginLeft: 12,
    },

    // Helper text styles
    helperText: {
      color: "#6c757d",
      fontSize: 12,
      marginTop: 4,
      marginLeft: 12,
    },

    // Validation error styles
    validationSection: {
      marginTop: 10,
      marginBottom: 5,
    },
    validationContainer: {
      marginTop: 8,
      padding: 8,
    },
    validationTitle: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: 4,
      marginBottom: 8,
    },
    validationText: {
      fontSize: 11,
      marginTop: 4,
      marginBottom: 8,
    },

    // General result item for patient cards
    resultItem: {
      backgroundColor: "#fff",
      marginBottom: 16,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      padding: 16,
      width: 350,
      maxWidth: 350,
      alignSelf: "center",
    },

    // User info section styles
    userInfoSection: {
      backgroundColor: "#f8f9fa",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: "#00a69d",
    },
    userName: {
      fontSize: 18,
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: 4,
    },
    userPhone: {
      fontSize: 16,
      color: "#6c757d",
      fontWeight: "500",
    },

    // Section titles (for grouping content)
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: 8,
      marginTop: 16,
    },

    // Buttons in forms
    button: {
      backgroundColor: "#00a69d",
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      marginTop: 12,
      alignItems: "center",
      shadowColor: "#00a69d",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      minWidth: 140,
    },
    buttonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
    },

    // Button wrapper for submission
    buttonWrapper: {
      marginTop: 20,
      alignItems: "center",
      width: 350,
      maxWidth: 350,
      alignSelf: "center",
    },

    // Error container and text
    errorContainer: {
      marginTop: 8,
      padding: 8,
      backgroundColor: "#ffebee",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#f44336",
      width: 350,
      maxWidth: 350,
      alignSelf: "center",
    },

    // Result container and items
    resultContainer: {
      marginTop: 16,
      width: "100%",
      alignItems: "center",
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: 4,
    },
    resultText: {
      fontSize: 14,
      color: "#2c3e50",
    },

    // Image upload styles
    imageUploadContainer: {
      alignItems: "center",
      marginBottom: 16,
      gap: 8,
    },
    imageSection: {
      position: "relative",
      alignItems: "center",
    },
    selectedImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 8,
    },
    selectedImageContainer: {
      position: "relative",
      alignItems: "center",
    },
    placeholderImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "#ecebea",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    imagePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "#ecebea",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      borderWidth: 2,
      borderColor: "#d0d0d0",
      borderStyle: "dashed",
    },
    imagePlaceholderIcon: {
      fontSize: 32,
      opacity: 0.6,
      color: "#6c757d",
    },
    imagePlaceholderText: {
      fontSize: 12,
      color: "#6c757d",
      marginTop: 4,
      textAlign: "center",
    },
    imageUploadButton: {
      backgroundColor: "#00a69d",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginTop: 8,
    },
    imageUploadButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "500",
    },
    removeImageButton: {
      position: "absolute",
      top: -5,
      right: -5,
      backgroundColor: "#e74c3c",
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#ffffff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    removeImageButtonExternal: {
      backgroundColor: "transparent",
      borderRadius: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignSelf: "flex-end",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "#6c757d",
    },
    removeImageText: {
      color: "#6c757d",
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 14,
    },

    // Additional styles for edit form
    imageContainer: {
      alignItems: "center",
      marginBottom: 16,
    },
    imageButtonsContainer: {
      flexDirection: "row",
      gap: 8,
      marginTop: 8,
    },
    imageButton: {
      backgroundColor: "#00a69d",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    imageButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "500",
    },
    removeImageButtonEdit: {
      backgroundColor: "#e74c3c",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    removeImageButtonTextEdit: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "500",
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: 24,
      textAlign: "center",
    },
    container: {
      padding: 16,
      backgroundColor: "#f8f9fa",
    },
    imageHint: {
      fontSize: 12,
      color: "#6c757d",
      textAlign: "center",
      marginTop: 8,
      fontStyle: "italic",
    },

    // Input error styles
    inputError: {
      borderBottomColor: "#e74c3c",
      shadowColor: "#e74c3c",
    },

    // Text area styles
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },

    // Button container
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
      gap: 16,
    },

    // Cancel button styles
    cancelButton: {
      backgroundColor: "#6c757d",
      flex: 1,
    },
    cancelButtonText: {
      color: "#ffffff",
    },

    // Create/Update button styles
    createButton: {
      backgroundColor: "#00a69d",
      flex: 1,
    },

    // Fixed container for modal forms (like PatientModalBody)
    fixedContainer: {
      width: "100%",
      height: "100%",
      alignSelf: "center",
      overflow: "hidden",
    },

    // Form wrapper for ScrollView content
    formWrapper: {
      padding: 16,
      paddingBottom: 80,
      width: "100%",
    },

    // Scroll hint indicator
    scrollHint: {
      position: "absolute",
      right: 4,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      borderRadius: 1,
    },

    // Error notification banner
    errorBanner: {
      backgroundColor: "#ffebee",
      borderLeftWidth: 4,
      borderLeftColor: "#e74c3c",
      padding: 12,
      marginBottom: 16,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#e74c3c",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    errorBannerText: {
      color: "#c62828",
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
      textAlign: "center",
    },
    errorBannerIcon: {
      marginRight: 8,
      fontSize: 18,
      color: "#e74c3c",
    },

    // Flex grow style for content areas
    flexGrow: {
      flex: 1,
      width: "100%",
      maxWidth: "100%",
    },
  });
};
