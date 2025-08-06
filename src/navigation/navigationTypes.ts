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

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Dashboard: undefined;
  Patient: { patientId?: string } | undefined;
  HowToCode: undefined;
  Schedule: { patientId?: string } | undefined;
  Settings: undefined;
  Chatbot: undefined;
};
