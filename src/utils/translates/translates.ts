import { LanguagesSupported } from "./typesTranslations";

export const languagesNames: Record<LanguagesSupported, string> = {
  en: "English",
  es: "Español",
};

/**
 * An array containing all supported language codes.
 *
 * @see {@link LanguagesSupported}
 * @see {@link languagesNames}
 */
export const languagesSupported = [
  ...Object.keys(languagesNames),
] as LanguagesSupported[];
