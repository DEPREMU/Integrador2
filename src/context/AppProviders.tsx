import { ModalProvider } from "@context/ModalContext";
import { LayoutProvider } from "@context/LayoutContext";
import { LanguageProvider } from "@context/LanguageContext";

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <LanguageProvider>
      <ModalProvider>{children}</ModalProvider>
    </LanguageProvider>
  </LayoutProvider>
);

export default AppProviders;
