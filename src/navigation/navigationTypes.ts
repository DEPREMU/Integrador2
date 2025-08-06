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
  Patient: { patientId?: string };
  HowToCode: undefined;
  Schedule: { patientId?: string };
  Settings: undefined;
  Chatbot: undefined;
};