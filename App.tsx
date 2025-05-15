import AppNavigator from "@/navigation/AppNavigator";
import { ModalProvider } from "@context/ModalContext";
import { LayoutProvider } from "@context/LayoutContext";
import { LanguageProvider } from "@context/LanguageContext";

const App = () => (
  <LayoutProvider>
    <LanguageProvider>
      <ModalProvider>
        <AppNavigator />;
      </ModalProvider>
    </LanguageProvider>
  </LayoutProvider>
);

export default App;
