export type UrgencyType = "low" | "medium" | "high";
export type RoleType = "caregiver" | "patient" | "both";

export type User = {
  _id?: string;
  userId: string;
  role: RoleType;
  name: string;
  patientUserIds?: string[];
  patientsUser?: User[];
  imageId: string;
  createdAt: string;
  phone: string;
  caregiverId?: string;
  medicationIds?: string[];
  medications?: MedicationUser[];
  description: string;
  age?: number;
  conditions?: string[];
  allergies?: string[];
};

export type MedicationApi = {
  _id?: string;
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

export type MedicationUser = {
  userId: string;
  _id?: string;
  grams: number;
  dosage: string;
  medicationId: string;
  intervalHours: number;
  days: string[];
  startHour: string;
  stock: number;
  requiredDoses?: number;
  urgency: UrgencyType;
  name: string;
  createdAt?: string;
};

export type ResponseGetUserMedications = {
  medications?: MedicationUser[];
  error?: { message: string; timestamp: string };
};

export type TypeBodyGetUserMedications = {
  userId: string;
};

export type ResponseGetUserPatients = {
  patients: User[];
  error?: { message: string; timestamp: string };
};

export type TypeBodyGetUserPatients = {
  userId: string;
};

export type ResponseGetAllMedications = {
  medications: MedicationApi[];
  error?: { message: string; timestamp: string };
};

export type TypeBodyGetAllMedications = {
  onlyGetTheseColumns?: (keyof MedicationApi)[];
  onlyGetTheseMedicationsById?: string[];
};

export type TypeBodyAddUserMedication = {
  medication: Omit<MedicationUser, "_id">;
};

export type ResponseAddUserMedication = {
  success?: boolean;
  medication?: MedicationUser;
  error?: { message: string; timestamp: string };
};

export type TypeBodyDeleteUserMedication = {
  medicationId: string;
};

export type ResponseDeleteUserMedication = {
  success?: boolean;
  error?: { message: string; timestamp: string };
};

export type UserConfig = {
  _id?: string;
  userId: string;
  language: string;
  pushNotifications: boolean;
  timeZone: string;
};

export type DataLogin = {
  message: string;
  user: User;
  userConfig?: UserConfig;
};

export type ResponseAuth = {
  data: DataLogin | null;
  error: { message: string; timestamp: string } | null;
};

export type TypeBodyLogin = {
  uuid: string;
  language?: string;
  pushNotifications?: boolean;
};

export type TypeBodySignup = User & {
  userConfig?: UserConfig;
};

export type TypeBodyUpdateUserData = {
  userId: string;
  userData: User;
};

export type ResponseUpdateUserData = {
  success: boolean;
  error?: { message: string; timestamp: string };
  user?: User;
};

// Pillbox Configuration Types
export type TimeSlot = {
  startTime: string;
  intervalHours: number;
};

export type Compartment = {
  id: number;
  medication: string;
  dosage: string;
  timeSlots: TimeSlot[];
};

export type PillboxConfig = {
  userId: string;
  patientId: string;
  pillboxId: string;
  compartments: Compartment[];
  lastUpdated: Date;
};

export type TypeBodySavePillboxConfig = {
  userId: string;
  patientId: string;
  pillboxId: string;
  compartments: Compartment[];
};

export type ResponseSavePillboxConfig = {
  success: boolean;
  config?: PillboxConfig;
  error?: { message: string; timestamp: string };
};

export type TypeBodyGetPillboxConfig = {
  userId: string;
  patientId: string;
};

export type ResponseGetPillboxConfig = {
  config?: PillboxConfig;
  error?: { message: string; timestamp: string };
};

export type TypeBodyDeletePillboxConfig = {
  userId: string;
  patientId: string;
};

export type ResponseDeletePillboxConfig = {
  success: boolean;
  error?: { message: string; timestamp: string };
};
