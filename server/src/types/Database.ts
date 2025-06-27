import { ObjectId } from "mongodb";

export type CollectionName =
  | "logs"
  | "users"
  | "imagePaths"
  | "userConfig"
  | "medicationsApi"
  | "medicationsUser";

// types.ts

export type RoleType = "caregiver" | "patient" | "both";

export type User = {
  _id?: ObjectId;
  userId: string;
  role: RoleType;
  name: string;
  patientUserIds?: string[];
  patientsUser?: User[];
  imageId: string;
  createdAt: string;
  phone: string;
  caregiverId?: string;
  medicationIds?: ObjectId[];
  medications?: MedicationUser[];
  description: string;
  age?: number;
  conditions?: string[];
  allergies?: string[];
};

export type MedicationApi = {
  _id?: ObjectId;
  namesTranslations: Record<string, string>;
  name: string;
  name_es: string;
  name_fr: string;
  manufacturer: string;
  active_ingredient: string;
  purpose: string;
  description: string;
  indications: string;
  warnings: string;
  contraindications: string;
  when_using: string;
  stop_use: string;
  keep_out: string;
  side_effects: string;
  dosage: string;
  storage: string;
  inactive_ingredients: string;
  questions: string;
};

export type UrgencyType = "low" | "medium" | "high";

export type MedicationUser = {
  userId: string;
  _id?: ObjectId;
  grams: number;
  dosage: string;
  medicationId: ObjectId | string;
  intervalHours: number;
  days: string[];
  startHour: string;
  stock: number;
  urgency: UrgencyType;
  name: string;
};

export type ImagePath = {
  _id?: ObjectId;
  userId: string;
  path: string;
};

export type UserConfig = {
  _id?: ObjectId;
  userId: string;
  language: string;
  pushNotifications: boolean;
};

export { ObjectId };
