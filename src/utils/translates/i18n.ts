// i18n.ts
import en from "./English";
import es from "./Spanish";
import i18n from "i18next";
import { checkLanguage } from "../functions";
import { initReactI18next } from "react-i18next";
import { LanguagesSupported, typeLanguages } from "./typesTranslations";

export const languages: Record<LanguagesSupported, typeLanguages> = {
  en,
  es,
};

checkLanguage().then((lng) => {
  i18n.use(initReactI18next).init({
    lng,
    fallbackLng: "en",
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    interpolation: {
      escapeValue: false,
    },
  });
});

export { i18n };
