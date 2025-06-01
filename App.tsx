import React from "react";
import PatientScreen from "./src/screens/PatientScreen";
import { LanguageProvider } from "./src/context/LanguageContext";
import { ModalProvider } from "./src/context/ModalContext"; // <-- Asegúrate de importar esto

// Renderiza solo PatientScreen, sin navegación ni providers globales
const App = () => (
  <LanguageProvider>
    <ModalProvider>
      <PatientScreen />
    </ModalProvider>
  </LanguageProvider>
);

export default App;
