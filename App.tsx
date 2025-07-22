import "./src/utils/translates/i18n";
import "core-js/features/structured-clone";
import React from "react";
import AppProviders from "./src/context/AppProviders";
import AppNavigator from "./src/navigation/AppNavigator";

const App: React.FC = () => (
  <AppProviders>
    <AppNavigator />
  </AppProviders>
);

export default App;
