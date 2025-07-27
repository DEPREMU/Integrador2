import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MedicationUser } from "@types";

interface RenderScheduleItemMemoProps {
  data: MedicationUser[];
  styles: any;
  deleteSchedule: (id: string) => void;
  // Puedes agregar onEditSchedule si lo necesitas
}

const RenderScheduleItemMemo: React.FC<RenderScheduleItemMemoProps> = ({
  data,
  styles,
  deleteSchedule,
}) => {
  return (
    <View>
      {data.map((schedule) => (
        <View key={schedule._id || schedule.medicationId} style={styles.scheduleCard}>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleName}>{schedule.name}</Text>
            <Text style={styles.scheduleDetails}>
              {schedule.dosage} | {schedule.days?.join(", ")} | {schedule.startHour}
            </Text>
          </View>
          <Pressable
            style={styles.deleteButton}
            onPress={() => deleteSchedule((schedule._id || schedule.medicationId) as string)}
          >
            <Ionicons name="trash" size={20} color="#ff6b6b" />
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default React.memo(RenderScheduleItemMemo);
