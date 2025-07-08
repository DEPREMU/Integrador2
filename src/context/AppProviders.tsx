import { UserProvider } from "@context/UserContext";
import { ModalProvider } from "@context/ModalContext";
import { LayoutProvider } from "@context/LayoutContext";
import { LanguageProvider } from "@context/LanguageContext";

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <LanguageProvider>
      <UserProvider>
        <ModalProvider>{children}</ModalProvider>
      </UserProvider>
    </LanguageProvider>
  </LayoutProvider>
);

export default AppProviders;
