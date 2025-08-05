import { StyleSheet } from "react-native";

/**
 * Styles for the SnackbarAlert component.
 *
 * This style function provides consistent styling for snackbar notifications
 * across the application, supporting both success and error message types.
 *
 * Features:
 * - Absolute positioning for overlay display
 * - High z-index/elevation for proper layering above other components
 * - Consistent color scheme for success (green) and error (red) states
 * - Rounded corners for modern appearance
 * - Horizontal margins for proper spacing from screen edges
 * - Cross-platform elevation handling (zIndex for iOS, elevation for Android)
 *
 * Color Palette:
 * - Success: #388e3c (Material Design Green 700)
 * - Error: #d32f2f (Material Design Red 700)
 *
 * Layout:
 * - Positioned at top of screen (40px from top)
 * - Full width with horizontal margins
 * - High z-index (9999) and elevation (10) for proper stacking
 *
 * @returns {Object} Object containing the StyleSheet styles
 *
 * @example
 * // Usage in SnackbarAlert component
 * const { styles } = stylesSnackbarComponent();
 *
 * @example
 * // Applying success style
 * <Snackbar style={styles.snackbarSuccess} />
 *
 * @example
 * // Applying error style
 * <Snackbar style={styles.snackbarError} />
 */
const stylesSnackbarComponent = () => {
  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      top: 120,
      left: 0,
      right: 0,
      zIndex: 9999,
      elevation: 10,
    },
    snackbarSuccess: {
      backgroundColor: "#388e3c",
      borderRadius: 8,
      marginHorizontal: 16,
      minHeight: 60,
    },
    snackbarError: {
      backgroundColor: "#d32f2f",
      borderRadius: 8,
      marginHorizontal: 16,
      minHeight: 60,
    },
  });

  return { styles };
};

export default stylesSnackbarComponent;
