export type ScreensAvailable =
  | "Login"
  | "Signin"
  | "Home"
  | "Patient"
  | "ForgotPassword"
  | "SignUp" 
  | "Dashboard";


export type RootStackParamList = Record<ScreensAvailable, undefined>;
