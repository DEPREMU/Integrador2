import { LanguageProvider } from "@/context/LanguageContext";
import { LayoutProvider } from "@/context/LayoutContext";
import AppNavigator from "@/navigation/AppNavigator";

const App = () => (
  <LanguageProvider>
    <LayoutProvider>
      <AppNavigator />;
    </LayoutProvider>
  </LanguageProvider>
);

export default App;
