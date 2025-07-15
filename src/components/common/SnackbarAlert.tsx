import React from "react";
import { View } from "react-native";
import { Snackbar } from "react-native-paper";
import stylesSnackbarComponent from "@/styles/components/stylesSnackbarComponent";

/**
 * Props for the SnackbarAlert component.
 */
interface SnackbarAlertProps {
  /**
   * Controls the visibility of the snackbar.
   */
  visible: boolean;

  /**
   * Callback function invoked when the snackbar is dismissed.
   */
  onDismiss: () => void;

  /**
   * The message text to display in the snackbar.
   */
  message: string;

  /**
   * The type of alert which determines the styling.
   * @default "success"
   */
  type?: "success" | "error";
}

/**
 * SnackbarAlert component that displays temporary notification messages.
 *
 * Features:
 * - Displays success or error messages with appropriate styling
 * - Auto-dismisses after 3 seconds
 * - Includes an "OK" action button for manual dismissal
 * - Uses react-native-paper's Snackbar component
 * - Supports pointer events to avoid blocking interactions
 *
 * @param {SnackbarAlertProps} props - Props for the SnackbarAlert component.
 * @param {boolean} props.visible - Whether the snackbar is visible.
 * @param {() => void} props.onDismiss - Function to call when dismissing the snackbar.
 * @param {string} props.message - The message text to display.
 * @param {"success" | "error"} [props.type="success"] - The alert type for styling.
 * @returns {JSX.Element} The rendered snackbar alert component.
 *
 * @example
 * // Success message
 * <SnackbarAlert
 *   visible={true}
 *   onDismiss={() => setVisible(false)}
 *   message="Operation completed successfully!"
 *   type="success"
 * />
 *
 * @example
 * // Error message
 * <SnackbarAlert
 *   visible={true}
 *   onDismiss={() => setVisible(false)}
 *   message="An error occurred"
 *   type="error"
 * />
 */

const SnackbarAlert: React.FC<SnackbarAlertProps> = ({
  visible,
  onDismiss,
  message,
  type = "success",
}) => {
  const { styles } = stylesSnackbarComponent();

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        duration={3000}
        style={type === "error" ? styles.snackbarError : styles.snackbarSuccess}
        action={{ label: "OK", onPress: onDismiss }}
      >
        {message}
      </Snackbar>
    </View>
  );
};

export default SnackbarAlert;
