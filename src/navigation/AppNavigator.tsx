import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import Settings from "@/screens/Settings";
import HomeScreen from "@screens/HomeScreen";
import LoginScreen from "@screens/auth/LoginScreen";
import SigninScreen from "@/screens/auth/SignUpScreen";
import PatientScreen from "@screens/PatientScreen";
import DashboardScreen from "@screens/DashboardScreen";
import HowToCodeExample from "@screens/auth/HowToCodeExample";
import MedicationScheduler from "@screens/Schedule";
import React, { useEffect } from "react";
import { RootStackParamList } from "./navigationTypes";
import { BackgroundTaskProvider } from "@context/BackgroundTaskContext";
import { navigate, navigationRef } from "./navigationRef";
import { setupNotificationHandlers } from "@/utils";
import { NavigationContainer, RouteProp } from "@react-navigation/native";

const Stack = createNativeStackNavigator<RootStackParamList>();

type Screens = Record<
  keyof RootStackParamList,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.ComponentType<any>;
    options?:
      | NativeStackNavigationOptions
      | ((props: {
          route: RouteProp<RootStackParamList, "Login">;
          navigation: NativeStackNavigationProp<
            RootStackParamList,
            "Login",
            undefined
          >;
          theme: ReactNavigation.Theme;
        }) => NativeStackNavigationOptions);
  }
>;

/**
 * Centralized configuration object for all app screens.
 * This improves maintainability and scalability by allowing easy management of screen components and their options.
 * Add new screens or modify existing ones here to keep navigation logic clean and organized.
 */
const screens: Screens = {
  Home: { component: HomeScreen },
  Login: { component: LoginScreen },
  SignUp: { component: SigninScreen },
  Patient: { component: PatientScreen },
  Dashboard: { component: DashboardScreen },
  HowToCode: { component: HowToCodeExample },
  Schedule: {
    component: MedicationScheduler,
  },
  Settings: {
    component: Settings,
  },
};

const AppNavigator: React.FC = () => {
  useEffect(() => {
    const cleanup = setupNotificationHandlers(navigate);

    return cleanup;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <BackgroundTaskProvider>
        <Stack.Navigator initialRouteName="Patient">
          {Object.entries(screens).map(([name, { component, options }]) => (
            <Stack.Screen
              key={name}
              name={name as keyof RootStackParamList}
              component={component}
              options={
                (options as NativeStackNavigationOptions) ?? {
                  headerShown: false,
                }
              }
            />
          ))}
        </Stack.Navigator>
      </BackgroundTaskProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;
