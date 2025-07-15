import React, {
  useState,
  useEffect,
  ReactNode,
  useContext,
  createContext,
  useMemo,
} from "react";
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
  t: (key: keyof typeLanguages, options?: object) => string;
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

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    translations,
  }), [language, translations]);

  return (
<<<<<<< HEAD
    <LanguageContext.Provider value={contextValue}>
=======
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t: i18nextT as (key: keyof typeLanguages, options?: object) => string,
      }}
    >
>>>>>>> 665b55bc139760836941c0ca911ac16a92a794a8
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
