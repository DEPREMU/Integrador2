import React from "react";
import PatientScreen from "./src/screens/PatientScreen";
import { LanguageProvider } from "./src/context/LanguageContext";

const App = () => {
  return (
    <LanguageProvider>
      <PatientScreen />
    </LanguageProvider>
  );
};

export default App;