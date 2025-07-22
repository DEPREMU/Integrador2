import { Falsy } from "react-native";
import { MedicationApi, User, UserConfig } from "./Database";

export type RoutesAPI =
  | "/login"
  | "/encrypt"
  | "/decrypt"
  | "/upload"
  | "/uploadOnly"
  | "/logs"
  | "/signup"
  | "/updateUserData"
  | "/getUserPatients"
  | "/getUserMedications"
  | "/getAllMedications"
  | "/createPatient"
  | "/deletePatient"
  | "/unassignPatient"
  | "/addExistingPatient"
  | "/searchUser"
  | "/validatePatientUniqueness";

export type ResponseEncrypt = {
  dataEncrypted?: string;
  error?: { message: string; timestamp: string };
};

export type ResponseDecrypt = {
  dataDecrypted?: string;
  error?: { message: string; timestamp: string };
};

export type RequestEncrypt = {
  dataToEncrypt: string;
};

export type RequestDecrypt = {
  dataToDecrypt: string;
};

export type RequestLogs = {
  log: string;
  timestamp: string;
};

export type RequestBody = RequestEncrypt | RequestDecrypt | RequestLogs;

export type DataLogin = {
  message: string;
  user: User;
  userConfig?: UserConfig;
};

export type ResponseAuth = {
  data: DataLogin | null;
  error: { message: string; timestamp: string } | null;
};

export type TypeLoginResponse = {
  data: DataLogin | Falsy;
  error: Falsy | { message: string; timestamp: string };
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

export type ResponseUploadImage = {
  files: string[];
  success: boolean;
  error?: { message: string; timestamp: string };
};

export type ResponseGetUserPatients = {
  patients: User[];
  error?: { message: string; timestamp: string };
};

export type TypeBodyGetUserPatients = {
  userId: string;
};

export type ResponseGetUserMedications = {
  medications: User[];
  error?: { message: string; timestamp: string };
};

export type TypeBodyGetUserMedications = {
  userId: string;
};

export type ResponseGetAllMedications = {
  medications: Partial<MedicationApi>[];
  error?: { message: string; timestamp: string };
};

export type TypeBodyGetAllMedications = {
  onlyGetTheseColumns?: (keyof MedicationApi)[];
  onlyGetTheseMedicationsById?: string[];
};

// Patient management types
export type TypeBodyCreatePatient = {
  caregiverId: string;
  patientData: {
    name: string;
    phone: string;
    email: string;
    age: number;
    description: string;
    conditions: string[];
    allergies: string[];
    imageId: string;
    medications: any[];
    caregiverId: string;
  };
};

export type ResponseCreatePatient = {
  success: boolean;
  patient?: User;
  error?: { message: string; timestamp: string };
};

export type TypeBodyDeletePatient = {
  patientId: string;
  caregiverId: string;
};

export type ResponseDeletePatient = {
  success: boolean;
  error?: { message: string; timestamp: string };
};

export type TypeBodyUnassignPatient = {
  patientId: string;
  caregiverId: string;
};

export type ResponseUnassignPatient = {
  success: boolean;
  error?: { message: string; timestamp: string };
};

export type TypeBodyAddExistingPatient = {
  patientUserId: string;
  caregiverId: string;
};

export type ResponseAddExistingPatient = {
  success: boolean;
  patient?: User;
  error?: { message: string; timestamp: string };
};

export type TypeBodySearchUser = {
  email?: string;
  phone?: string;
};

export type ResponseSearchUser = {
  user?: User;
  message?: string;
  error?: { message: string; timestamp: string };
};

export type TypeBodyValidatePatientUniqueness = {
  email?: string;
  phone?: string;
  excludeUserId?: string;
};

export type ResponseValidatePatientUniqueness = {
  isUnique: boolean;
  conflicts?: {
    email: boolean;
    phone: boolean;
  };
  error?: { message: string; timestamp: string };
};
