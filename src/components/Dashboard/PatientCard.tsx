import React from "react";
import { useStylesPatientCard } from "@styles/components/stylesPatientCard";
import { View, Text, Image, Pressable, ViewStyle } from "react-native";

interface PatientCardProps {
  name: string;
  photoUrl?: string;
  pills: string[];
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * PatientCard is a reusable component that displays a patient's basic information,
 * including their name, optional photo, and a list of pills or tags.
 * The card can be pressed to trigger a callback function.
 *
 * @param {string} name - The patient's name to display.
 * @param {string} [photoUrl] - Optional URL for the patient's photo.
 * @param {string[]} pills - List of pills or tags associated with the patient.
 * @param {function} onPress - Callback function to execute when the card is pressed.
 * @param {ViewStyle} [style] - Optional custom style for the card container.
 *
 * @returns {JSX.Element} The rendered PatientCard component.
 *
 * @example
 * <PatientCard
 *   name="Jane Doe"
 *   photoUrl="https://example.com/photo.jpg"
 *   pills={["Aspirin", "Ibuprofen"]}
 *   onPress={() => console.log("Card pressed")}
 * />
 */
const PatientCard: React.FC<PatientCardProps> = ({
  name,
  photoUrl,
  pills,
  onPress,
  style,
}) => {
  const styles = useStylesPatientCard();

  return (
    <Pressable style={[styles.card, style]} onPress={onPress}>
      <View style={styles.photoPlaceholder}>
        {photoUrl && <Image source={{ uri: photoUrl }} style={styles.photo} />}
      </View>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.pillList}>
        {pills.map((p, i) => (
          <View key={i} style={styles.pill}>
            <Text style={styles.pillText}>{p}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};

export default PatientCard;
