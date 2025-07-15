import React from "react";
import { UserProvider } from "@context/UserContext";
import { ModalProvider } from "@context/ModalContext";
import { LayoutProvider } from "@context/LayoutContext";
import { LanguageProvider } from "@context/LanguageContext";
import { WebSocketProvider } from "./WebSocketContext";

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <LanguageProvider>
      <UserProvider>
        <ModalProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </ModalProvider>
      </UserProvider>
    </LanguageProvider>
  </LayoutProvider>
);

export default AppProviders;
