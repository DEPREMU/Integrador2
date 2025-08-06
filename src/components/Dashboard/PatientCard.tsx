// /src/components/Dashboard/PatientCard.tsx
import React from 'react';
import { useStylesPatientCard } from '@styles/components/stylesPatientCard';
import { View, Text, Image, Pressable, ViewStyle, TouchableOpacity } from 'react-native';
import { getRouteImage } from "@/utils";
import { Ionicons } from '@expo/vector-icons';

/**
 * Props interface for the PatientCard component.
 * @interface PatientCardProps
 * @property {string} name - The patient's name to display
 * @property {string} [photoUrl] - Optional URL for the patient's photo
 * @property {string[]} pills - List of pills or tags associated with the patient
 * @property {string} [description] - Optional description or medical notes for the patient
 * @property {() => void} onPress - Callback function to execute when the card is pressed
 * @property {() => void} [onDelete] - Optional callback function to execute when delete button is pressed
 * @property {() => void} [onEdit] - Optional callback function to execute when edit button is pressed
 * @property {ViewStyle} [style] - Optional custom style for the card container
 */
interface PatientCardProps {
  name: string;
  photoUrl?: string;
  pills: string[];
  description?: string;
  onPress: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  style?: ViewStyle;
}

/**
 * PatientCard is a reusable component that displays a patient's basic information,
 * including their name, optional photo, description, and a list of pills or tags.
 * The card can be pressed to trigger a callback function.
 *
 * Features:
 * - Displays patient photo with fallback for missing images
 * - Shows patient name, description, and associated pills
 * - Includes edit and delete action buttons for patient management
 * - Supports accessibility features with proper labels and roles
 * - Handles image loading errors gracefully
 *
 * @component
 * @param {PatientCardProps} props - The props for the PatientCard component
 * @param {string} props.name - The patient's name to display
 * @param {string} [props.photoUrl] - Optional URL for the patient's photo
 * @param {string[]} props.pills - List of pills or tags associated with the patient
 * @param {string} [props.description] - Optional description or medical notes for the patient
 * @param {function} props.onPress - Callback function to execute when the card is pressed
 * @param {function} [props.onDelete] - Optional callback function to execute when delete button is pressed
 * @param {function} [props.onEdit] - Optional callback function to execute when edit button is pressed
 * @param {ViewStyle} [props.style] - Optional custom style for the card container
 *
 * @returns {JSX.Element} The rendered PatientCard component
 *
 * @example
 * <PatientCard
 *   name="Jane Doe"
 *   photoUrl="https://example.com/photo.jpg"
 *   pills={["Aspirin", "Ibuprofen"]}
 *   description="Patient with chronic pain"
 *   onPress={() => console.log("Card pressed")}
 *   onDelete={() => console.log("Delete pressed")}
 *   onEdit={() => console.log("Edit pressed")}
 * />
 */
const PatientCard: React.FC<PatientCardProps> = ({ name, photoUrl, pills, description, onPress, onDelete, onEdit, style }) => {
  const styles = useStylesPatientCard();
  const [imageError, setImageError] = React.useState(false);

  return (
    <Pressable style={[styles.card, style]} onPress={onPress}>
      {/* Action buttons - only show if not add button */}
      {name !== "Add Patient" && (
        <>
          {/* Edit button */}
          {onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={(e) => {
                console.log("Edit button pressed for:", name);
                e.stopPropagation();
                onEdit();
              }}
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              accessibilityLabel={`Editar paciente ${name}`}
              accessibilityRole="button"
            >
              <Ionicons 
                name="pencil" 
                size={16} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}

          {/* Unassign button */}
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                console.log("Delete button pressed for:", name);
                e.stopPropagation();
                onDelete();
              }}
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              accessibilityLabel={`Desasignar paciente ${name}`}
              accessibilityRole="button"
            >
              <Ionicons 
                name="trash-outline" 
                size={16} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}
        </>
      )}

      <View style={styles.photoPlaceholder}>
        {photoUrl && !imageError ? (
          <Image
            source={{ uri: getRouteImage(photoUrl) }}
            style={styles.photo}
            onError={() => {
              console.log('Error loading image:', photoUrl);
              setImageError(true);
            }}
            onLoad={() => console.log('Image loaded successfully')}
          />
        ) : (
          <View style={[styles.photo, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#999', fontSize: 12, textAlign: 'center' }}>
              {imageError ? 'Error' : 'Sin foto'}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.name}>{name}</Text>
      {description && (
        <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
          {description}
        </Text>
      )}
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
