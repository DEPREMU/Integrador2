export type MedicationUser = {
  _id?: string;
  medicationId: string;
  name: string;
  userId: string;
  dosage: string;
  startHour: string;
  days: string[];
  grams: number;
  intervalHours: number;
  stock: number;
  requiredDoses: number;
  urgency: string;
};
