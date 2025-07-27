export type UrgencyType = 'low' | 'medium' | 'high';
export type MedicationSchedule = {
  _id: string;
  medication: string;
  dose: string;
  days: string[];
  time: string;
  dosageType?: string;
};

export type Patient = {
  _id: string;
  name: string;
  age: number;
  conditions: string[];
};

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DaysOfWeek = Record<DayOfWeek, string>;
export type DaysOfWeekPartial = Partial<DaysOfWeek>;

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
  urgency: string;
};
