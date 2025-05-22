import React from "react";
import HomeScreen from "@screens/HomeScreen";
import LoginScreen from "@screens/auth/LoginScreen";
import SigninScreen from "@screens/auth/SigninScreen";
import { RootStackParamList } from "./navigationTypes";
import { NavigationContainer } from "@react-navigation/native";
import { BackgroundTaskProvider } from "@context/BackgroundTaskContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <BackgroundTaskProvider>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signin"
          component={SigninScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </BackgroundTaskProvider>
  </NavigationContainer>
);

export default AppNavigator;
