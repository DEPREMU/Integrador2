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
  patientName: string;
  patientDescription: string;
  addMedication: string;
  noMedications: string;
  close: string;
  more: string;
  // Days of the week
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  // Header and Menu (add these if used in Header/Menu components)
  headerTitle?: string;
  menuHome?: string;
  menuProfile?: string;
  menuLogout?: string;
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
    patientName: "Patient Name",
    patientDescription: "Patient Description",
    addMedication: "Add medication",
    noMedications: "No medications",
    close: "Close",
    more: "more",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    headerTitle: "Header",
    menuHome: "Home",
    menuProfile: "Profile",
    menuLogout: "Logout",
  },
  es: {
    welcome: "Bienvenido",
    patientName: "Nombre del paciente",
    patientDescription: "Descripción del paciente",
    addMedication: "Agregar medicamento",
    noMedications: "Sin medicamentos",
    close: "Cerrar",
    more: "más",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
    headerTitle: "Encabezado",
    menuHome: "Inicio",
    menuProfile: "Perfil",
    menuLogout: "Cerrar sesión",
  },
};
