import { Falsy } from "react-native";
import { User, UserConfig } from "./Database";

export type RoutesAPI =
  | "/login"
  | "/encrypt"
  | "/decrypt"
  | "/upload"
  | "/logs"
  | "/signup"
  | "/updateUserData";

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

export type ResponseLogin = {
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
}