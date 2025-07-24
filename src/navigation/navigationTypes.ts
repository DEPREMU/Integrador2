export type ScreensAvailable =
  | "Login"
  | "SignUp"
  | "Home"
  | "Dashboard"
  | "Patient"
  | "HowToCode"
  | "Schedule"
  | "Settings"
  | "Chatbot";

export type RootStackParamList = Record<ScreensAvailable, undefined>;
