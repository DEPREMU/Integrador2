// /src/components/Dashboard/PatientModalFooter.tsx
import React from "react";
import { View } from "react-native";
import ButtonComponent from "@components/common/Button";
import { useModal } from "@context/ModalContext";
import { useLanguage } from "@context/LanguageContext";
import { useStylesPatientModalButtons } from "@styles/components/stylesPatientModalButtons";

/**
 * Props interface for the PatientModalFooter component.
 * @interface PatientModalFooterProps
 * @property {() => void} onSave - Callback function to execute when the save button is pressed
 */
interface PatientModalFooterProps {
  onSave: () => void;
}

/**
 * PatientModalFooter component renders the footer section of patient modals.
 * 
 * This component provides a consistent footer interface for patient-related modals,
 * containing action buttons for modal management and form submission.
 * 
 * Features:
 * - Cancel button that closes the modal using ModalContext
 * - Consistent styling with design system
 * - Proper accessibility support
 * - Localized text using LanguageContext
 * - Responsive button layout
 * 
 * Note: The Save button functionality was removed in favor of individual form
 * submission handling within each form component for better user experience.
 * 
 * @component
 * @param {PatientModalFooterProps} props - Component props
 * @param {() => void} props.onSave - Callback function to execute when save action is triggered (currently unused)
 * @returns {JSX.Element} The rendered modal footer with action buttons
 * 
 * @example
 * <PatientModalFooter
 *   onSave={() => {
 *     console.log('Save action triggered');
 *     // Handle save logic
 *   }}
 * />
 */
const PatientModalFooter: React.FC<PatientModalFooterProps> = ({ onSave }) => {
  const { closeModal } = useModal();
  const { t } = useLanguage();
  const styles = useStylesPatientModalButtons();

  return (
    <View style={styles.footerContainer}>
      <ButtonComponent
        label={t("close")}
        handlePress={closeModal}
        customStyles={{ button: styles.cancel, textButton: styles.cancelText }}
      />
    </View>
  );
};

export default PatientModalFooter;
