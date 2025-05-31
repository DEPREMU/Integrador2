export type ScreensAvailable =
  | "Login"
  | "Signin"
  | "Home"
  | "ForgotPassword"
  | "Register";

export type RootStackParamList = {
  Login: undefined;
  Signin: undefined;
  Home: undefined;
  ForgotPassword: undefined; // Add this
  Register: undefined; // Add this
};
