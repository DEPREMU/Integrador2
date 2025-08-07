import "./src/utils/translates/i18n";
import "core-js/features/structured-clone";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppProviders from "./src/context/AppProviders";
import AppNavigator from "./src/navigation/AppNavigator";

const App: React.FC = () => (
  <SafeAreaProvider>
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  </SafeAreaProvider>
);

export default App;
