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
  login: string;
  languages: string;
  capsysDescription: string;
  greeting: string;
  close: string;
  addPatientForm: string;
  addPatient: string;
  capsysDescription: string; patientName: string;
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
  // Header and Menu
  headerTitle: string;
  menuHome: string;
  menuProfile: string;
  menuLogout: string;
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
    login: "Login",
    languages: "Languages",
    capsysDescription:
      "The smart pillbox is a connected device designed to facilitate daily medication management. It syncs with our mobile app to send automatic reminders, personalized alerts, and real-time notifications. Thanks to its functional design and integrated technology, it allows caregivers and users to maintain precise and error-free control over schedules, doses, and administration, improving treatment adherence and peace of mind",
    greeting: "Hello, Admin User",
    addPatient: "Add Patient",
    close: "Close",
    addPatientForm: "Here would be the form to add a patient",
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
    login: "Iniciar sesión",
    languages: "Lenguajes",
    capsysDescription:
      "El pastillero inteligente es un dispositivo conectado diseñado para facilitar la gestión diaria de medicamentos. Se sincroniza con nuestra app móvil para enviar recordatorios automáticos, alertas personalizadas y notificaciones en tiempo real. Gracias a su diseño funcional y tecnología integrada, permite a cuidadores y usuarios llevar un control preciso y sin errores sobre horarios, dosis y administración, mejorando la adherencia al tratamiento y la tranquilidad en el cuidado",
    greeting: "Hola, Usuario Administrador",
    addPatient: "Agregar Paciente",
    close: "Cerrar",
    addPatientForm: "Aquí estaría el formulario para agregar un paciente",
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

