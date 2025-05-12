import {
  languages,
  typeLanguages,
  LanguagesSupported,
} from "@/utils/translates";
import React, {
  useState,
  useEffect,
  ReactNode,
  useContext,
  createContext,
} from "react";
import { checkLanguage } from "@/utils";

interface LanguageContextProps {
  language: LanguagesSupported;
  setLanguage: (language: LanguagesSupported) => void;
  translations: typeLanguages;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<LanguagesSupported>("en");

  useEffect(() => {
    const loadLanguage = async () => {
      const data = await checkLanguage();
      setLanguage(data);
    };

    loadLanguage();
  }, []);

  const translations = languages[language || "en"];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
