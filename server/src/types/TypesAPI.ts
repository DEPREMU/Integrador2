import { Falsy } from "react-native";
import { MedicationApi, MedicationUser, User, UserConfig } from "./Database";

export type RoutesAPI =
  | "/login"
  | "/encrypt"
  | "/decrypt"
  | "/upload"
  | "/logs"
  | "/signup"
  | "/updateUserData"
  | "/getUserPatients"
  | "/getUserMedications"
  | "/getAllMedications"
  | "/addUserMedication"
  | "/deleteUserMedication";

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
  medications: MedicationUser[];
  error?: { message: string; timestamp: string };
};

export type TypeBodyGetUserMedications = {
  userId: string;
};

export type ResponseGetAllMedications = {
  medications: any[];
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
  success: boolean;
  medication?: MedicationUser;
  error?: { message: string; timestamp: string };
};
