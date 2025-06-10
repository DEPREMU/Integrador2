import { Falsy } from "react-native";

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
  token: string;
  user: {
    id: string;
  };
}; //! Verify this type

export type ResponseLogin = {
  data: DataLogin | null;
  error: { message: string; timestamp: string } | null;
};

export type TypeLoginResponse = {
  data: DataLogin | Falsy;
  error: Falsy | { message: string; timestamp: string };
};

export type TypeBodyLogin = {
  username?: "string";
  password?: "string";
};
