export type ScreensAvailable =
  | "Login"
  | "Signin"
  | "Home"
  | "Patient"
  | "ForgotPassword"
  | "SignUp";

export type RootStackParamList = Record<ScreensAvailable, undefined>;
