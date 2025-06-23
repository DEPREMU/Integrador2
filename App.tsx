import React from "react";
import AppProviders from "@context/AppProviders";
import MedicationScheduler from "./src/screens/ScheduleScreen";

const App = () => (
  <AppProviders>
    <MedicationScheduler />
  </AppProviders>
);

export default App;
