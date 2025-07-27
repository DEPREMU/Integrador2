import React, { useState, useEffect, ReactNode, useContext, createContext } from "react";
import en from "../utils/translates/English";
import es from "../utils/translates/Spanish";
import { i18n } from "@utils";
import { useTranslation } from "react-i18next";
import {
  checkLanguage,
  saveData,
  KEYS_STORAGE,
  LanguagesSupported,
} from "@utils";
import { typeLanguages } from "@utils";

interface LanguageContextProps {
  language: LanguagesSupported;
  changeLanguage: (lang: LanguagesSupported) => Promise<void>;
  t: (key: string, options?: object) => string;
  translations: typeLanguages;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<LanguagesSupported>("en");
  const { t: i18nextT } = useTranslation();
  // Importar traducciones
  const translationsMap: Record<LanguagesSupported, typeLanguages> = {
    en,
    es,
  };
  const translations: typeLanguages = translationsMap[language];

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await checkLanguage();
      setLanguage(storedLang);
      await i18n.changeLanguage(storedLang);
    };

    loadLanguage();
  }, []);

  const changeLanguage = async (lang: LanguagesSupported) => {
    await saveData(KEYS_STORAGE.LANGUAGE_KEY_STORAGE, lang);
    await i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t: i18nextT as (key: string, options?: object) => string,
        translations,
      }}
    >
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
