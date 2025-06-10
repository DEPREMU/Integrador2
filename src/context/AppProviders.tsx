import { UserProvider } from "@context/UserContext";
import { ModalProvider } from "@context/ModalContext";
import { LayoutProvider } from "@context/LayoutContext";
import { LanguageProvider } from "@context/LanguageContext";

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <UserProvider>
      <LanguageProvider>
        <ModalProvider>{children}</ModalProvider>
      </LanguageProvider>
    </UserProvider>
  </LayoutProvider>
);

export default AppProviders;
