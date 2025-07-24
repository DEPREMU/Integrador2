// /src/components/Dashboard/PatientModalBody.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useLanguage } from "@context/LanguageContext";
import PatientSearchForm from "./PatientSearchForm";
import PatientCreateForm from "./PatientCreateForm";
import { useStylesPatientModalBody } from "@styles/components/stylesPatientModalBody";

/**
 * Screen height constant for responsive design.
 */
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Fixed form height as percentage of screen height.
 */
const FORM_HEIGHT = SCREEN_HEIGHT * 0.4; // fixed 70% of screen

/**
 * Props interface for the PatientModalBody component.
 * @interface PatientModalBodyProps
 * @property {() => void} [onPatientCreated] - Optional callback function called when a patient is successfully created
 * @property {() => void} [onPatientSelected] - Optional callback function called when an existing patient is selected
 */
interface PatientModalBodyProps {
  onPatientCreated?: () => void;
  onPatientSelected?: () => void;
}

/**
 * PatientModalBody component renders a tabbed modal body with a fixed-height content area.
 * 
 * This component provides a dual-mode interface for patient management, allowing users to either
 * search for existing patients or create new ones through a tabbed interface.
 * 
 * Features:
 * - Tabbed interface with "Search Existing" and "Create New" modes
 * - Fixed-height content area for consistent modal sizing
 * - Responsive design with proper scrolling behavior
 * - Nested scroll support for forms within the modal
 * - Visual scroll hint indicator
 * - Consistent styling with design system
 * 
 * Tabs:
 * - Search Existing: Allows searching for existing patients by email or phone
 * - Create New: Provides form for creating new patient profiles
 * 
 * @component
 * @param {PatientModalBodyProps} props - Component props
 * @param {() => void} [props.onPatientCreated] - Callback function called when a patient is successfully created
 * @param {() => void} [props.onPatientSelected] - Callback function called when an existing patient is selected
 * @returns {JSX.Element} The rendered tabbed modal body
 * 
 * @example
 * <PatientModalBody
 *   onPatientCreated={() => {
 *     console.log('New patient created');
 *     closeModal();
 *     refreshPatientList();
 *   }}
 *   onPatientSelected={() => {
 *     console.log('Existing patient selected');
 *     closeModal();
 *     refreshPatientList();
 *   }}
 * />
 */
const PatientModalBody: React.FC<PatientModalBodyProps> = ({ onPatientCreated, onPatientSelected }) => {
  const { t } = useLanguage();
  const styles = useStylesPatientModalBody();
  const [mode, setMode] = useState<"search" | "create">("search");

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, mode === "search" && styles.tabActive]}
          onPress={() => setMode("search")}
        >
          <Text style={[styles.tabText, mode === "search" && styles.tabTextActive]}>
            {t("searchExisting")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, mode === "create" && styles.tabActive]}
          onPress={() => setMode("create")}
        >
          <Text style={[styles.tabText, mode === "create" && styles.tabTextActive]}>
            {t("createNew")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fixed-height content area */}
      <View style={[styles.fixedContainer, { height: FORM_HEIGHT }]}>
        {mode === "search" ? (
          // Search form with its FlatList; wrapped in flex to fill height
          <View style={styles.flexGrow}>
            <PatientSearchForm onPatientSelected={onPatientSelected} />
          </View>
        ) : (
          // Create form inside a ScrollView
          <View style={styles.flexGrow}>
            <ScrollView
              contentContainerStyle={styles.formWrapper}
              showsVerticalScrollIndicator={false}
            >
              <PatientCreateForm onPatientCreated={onPatientCreated} />
            </ScrollView>
          </View>
        )}
        {/* Always show the hint track */}
        <View style={styles.scrollHint} />
      </View>
    </View>
  );
};

export default PatientModalBody;
