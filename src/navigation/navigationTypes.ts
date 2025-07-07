export type ScreensAvailable =
  | "Login"
  | "SignUp"
  | "Home"
  | "Dashboard"
  | "Patient"
  | "HowToCode"
  | "Schedule"
  | "Settings";

export type RootStackParamList = Record<ScreensAvailable, undefined>;
