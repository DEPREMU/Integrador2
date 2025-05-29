export type LanguagesSupported = "en" | "es";

export const languagesNames: Record<LanguagesSupported, string> = {
  en: "English",
  es: "Español",
};

export const languagesSupported: LanguagesSupported[] = [
  ...Object.keys(languagesNames),
] as LanguagesSupported[];

/**
 * Represents the structure of language translations.
 *
 * @property key - The key for the translation.
 */
export type typeLanguages = {
  welcome: string;
};

/**
 * A record that maps supported languages to their respective translations.
 *
 * @constant
 * @type {Record<LanguagesSupported, typeLanguages>}
 *
 * @property {typeLanguages} language - Translations for any language.
 *
 * Example usage:
 * ```typescript
 * log(languages.en.welcome); // Output: "Welcome"
 * log(languages.es.welcome); // Output: "Bienvenido"
 * ```
 *
 * Practical example:
 * @example
 * const screen: React.FC = () => {
 * const { translations } = useLanguage();

 * return <Text>{translations.welcome}</Text>;
 * };

 */
export const languages: Record<LanguagesSupported, typeLanguages> = {
  en: {
    welcome: "Welcome",
  },
  es: {
    welcome: "Bienvenido",
  },
};
