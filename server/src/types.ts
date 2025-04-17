import { Falsy } from "react-native";

export type DataLogin = {
  token: string;
  user: {
    id: string;
  };
};

export type TypeLoginResponse = {
  data: DataLogin | Falsy;
  error: Falsy | { message: string; timestamp: string };
};

export type TypeBodyLogin =
  | {
      username?: "string";
      password?: "string";
    }
  | Falsy;
