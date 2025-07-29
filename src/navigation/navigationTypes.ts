export type ScreensAvailable =
  | "Login"
  | "SignUp"
  | "Home"
  | "Dashboard"
  | "Patient"
  | "HowToCode"
  | "Schedule"
  | "Settings"
  | "PillboxSettings"
  | "Chatbot";

export type RootStackParamList = Record<ScreensAvailable, undefined>;
