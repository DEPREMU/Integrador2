import React from "react";
import PatientScreen from "./screens/PatientScreen";
import { LanguageProvider } from "./context/LanguageContext";

const App = () => {
  return (
    <LanguageProvider>
      <PatientScreen />
    </LanguageProvider>
  );
};

export default App;