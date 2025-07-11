import React from "react";
import { UserProvider } from "@context/UserContext";
import { ModalProvider } from "@context/ModalContext";
import { LayoutProvider } from "@context/LayoutContext";
import { LanguageProvider } from "@context/LanguageContext";
import { WebSocketProvider } from "./WebSocketContext";

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <UserProvider>
      <LanguageProvider>
        <ModalProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </ModalProvider>
      </LanguageProvider>
    </UserProvider>
  </LayoutProvider>
);

export default AppProviders;
