export type ScreensAvailable =
  | "Login"
  | "SignUp"
  | "Home"
  | "Dashboard"
  | "Patient"
  | "HowToCode";

export type RootStackParamList = Record<ScreensAvailable, undefined>;
