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

export interface User {
  _id?: ObjectId;
  userId: string;
  role: RoleType;
  name: string;
  patientUserIds?: ObjectId[];
  imageId: string;
  createdAt: string;
  phone: string;
  caregiverId?: ObjectId;
  medicationIds?: ObjectId[];
  description: string;
}

export interface MedicationApi {
  _id?: ObjectId;
  namesTranslations: Record<string, string>;
  name: string;
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
}

export interface MedicationUser {
  userId: string;
  _id?: ObjectId;
  grams: number;
  dosage: string;
  intervalHours: number;
  days: number;
  startHour: string;
  stock: number;
  urgency: "low" | "medium" | "high";
}

export interface ImagePath {
  _id?: ObjectId;
  userId: string;
  path: string;
}

export interface UserConfig {
  _id?: ObjectId;
  userId: string;
  language: string;
  pushNotifications: boolean;
}

export { ObjectId };
