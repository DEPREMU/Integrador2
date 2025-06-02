import React from 'react';
import { View, Text, Image, Pressable, ViewStyle } from 'react-native';
import { useStylesPatientCard } from '@/styles/components/stylesPatientCard';

interface PatientCardProps {
  name: string;
  photoUrl?: string;
  pills: string[];
  onPress: () => void;
  style?: ViewStyle;
}

export default function PatientCard({ name, photoUrl, pills, onPress, style }: PatientCardProps) {
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
}