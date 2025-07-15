import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { capitalize, log } from "@/utils";
import Button from "@components/common/Button";
import { MedicationUser } from "@types";
import { useLanguage } from "@context/LanguageContext";

const RenderScheduleItem: React.FC<{
  data: MedicationUser[];
  styles: Record<string, object>;
  deleteSchedule: (medicationId: string) => void;
}> = ({ data, styles, deleteSchedule }) => {
  const { translations } = useLanguage();
  
  return (
  <>
    {data.map((item) => {
      log(item);
      return (
        <View
          key={item.medicationId + item.startHour}
          style={styles.scheduleItem}
        >
          <View style={styles.scheduleInfo}>
            <Text style={styles.medName}>{item.name}</Text>
            <Text style={styles.doseText}>
              {item.grams}-{item.dosage || "mg"} {item.startHour} -{" "}
              {item.intervalHours}
            </Text>
            <Text style={styles.requiredDosesText}>
              {translations.requiredDoses || "Required Doses"}: {item.requiredDoses || 0}
            </Text>
          </View>
          <View style={styles.daysIndicator}>
            {item.days.map((day) => (
              <Text
                key={day}
                style={[
                  styles.dayIndicator,
                  item.days.includes(day) && styles.activeDayIndicator,
                ]}
              >
                {capitalize(day.slice(0, 2))}
              </Text>
            ))}
          </View>
          <Button
            label="✕"
            replaceStyles={{
              button: styles.deleteButton,
              textButton: styles.deleteButtonText,
            }}
            handlePress={() =>
              deleteSchedule(
                (item._id || item.medicationId) as unknown as string,
              )
            }
            forceReplaceStyles
            touchableOpacity
          />
        </View>
      );
    })}
  </>
  );
};

const RenderScheduleItemMemo = React.memo(
  RenderScheduleItem,
  (prevProps, nextProps) => {
    const isEqualsData =
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
    const isEqualsStyles =
      JSON.stringify(prevProps.styles) === JSON.stringify(nextProps.styles);
    const isEqualsFunctions =
      prevProps.deleteSchedule === nextProps.deleteSchedule;
    return isEqualsData && isEqualsStyles && isEqualsFunctions;
  },
);

export default RenderScheduleItemMemo;
