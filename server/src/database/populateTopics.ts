import { getCollection } from "../database/functions.js";

type Question = {
  question: string;
  answer: string;
};

type Topics =
  | "App Functionality"
  | "Medication Configuration"
  | "Medication Intake Recommendations"
  | "Medication Information"
  | "Side Effects"
  | "Unknown";

type Topic = {
  _id?: string;
  topic: Topics;
  questions: Question[];
};

const TOPICS_ES: Topic[] = [
  {
    _id: "687c2e7f9aca168a56ee1728",
    topic: "App Functionality",
    questions: [
      {
        question: "¿Cómo funciona la app?",
        answer:
          "La app permite al cuidador programar el horario de toma de medicamentos. El paciente recibe la indicación mediante un dispositivo con LEDs y display que muestran qué pastilla tomar y cuántas.",
      },
      {
        question: "¿Quién puede configurar los medicamentos?",
        answer:
          "Solo el cuidador o administrador del perfil puede configurar la medicación desde la app.",
      },
      {
        question: "¿Qué hace la app exactamente?",
        answer:
          "La app gestiona la toma de medicamentos del paciente, enviando alertas y mostrando información con un dispositivo con luces LED y display.",
      },
      {
        question: "¿Cómo me avisa la app?",
        answer:
          "La app envía una señal al dispositivo que muestra qué medicamento tomar y en qué cantidad usando LEDs y una pantalla.",
      },
    ],
  },
  {
    _id: "687c2e7f9aca168a56ee1729",
    topic: "Medication Configuration",
    questions: [
      {
        question: "¿Cómo se agregan los medicamentos?",
        answer:
          "El cuidador o administrador puede registrar los medicamentos desde la app usando un formulario sencillo.",
      },
      {
        question: "¿Se pueden editar los medicamentos ya configurados?",
        answer:
          "Sí, el cuidador puede editar, eliminar o actualizar los medicamentos asignados al paciente en cualquier momento.",
      },
    ],
  },
  {
    _id: "687c2e7f9aca168a56ee172a",
    topic: "Medication Intake Recommendations",
    questions: [
      {
        question: "¿Qué hacer si olvidé tomar una pastilla?",
        answer:
          "Si olvidaste tomar una pastilla, consulta a tu médico antes de tomar una dosis doble. La app te enviará recordatorios si olvidas una toma.",
      },
      {
        question: "¿Debo tomar los medicamentos con comida?",
        answer:
          "Algunos medicamentos requieren tomarse con alimentos. Consulta las indicaciones del médico o del prospecto del medicamento.",
      },
      {
        question: "¿Puedo tomar la pastilla después de la hora?",
        answer:
          "Si olvidaste una dosis, no tomes el doble. Consulta con tu médico. La app enviará recordatorios de las dosis pendientes.",
      },
      {
        question: "¿Qué hago si me salté una dosis?",
        answer:
          "Es mejor consultar con tu médico. La app te recordará si olvidas una dosis.",
      },
    ],
  },
  {
    _id: "687c2e7f9aca168a56ee172b",
    topic: "Medication Information",
    questions: [
      {
        question: "¿Qué es el paracetamol?",
        answer:
          "El paracetamol es un analgésico y antipirético comúnmente usado para aliviar el dolor y reducir la fiebre.",
      },
      {
        question: "¿Qué efectos secundarios tiene el ibuprofeno?",
        answer:
          "El ibuprofeno puede causar malestar estomacal, acidez o incluso úlceras si se toma en exceso o sin protección gástrica.",
      },
      {
        question: "¿Qué es el ibuprofeno?",
        answer:
          "El ibuprofeno es un antiinflamatorio que también sirve para aliviar el dolor y la fiebre. Puede tener efectos secundarios si se abusa.",
      },
      {
        question: "¿Qué hace el omeprazol?",
        answer:
          "El omeprazol reduce la producción de ácido estomacal. Se usa para tratar reflujo y úlceras.",
      },
    ],
  },
  {
    _id: "687c2e7f9aca168a56ee172c",
    topic: "Side Effects",
    questions: [
      {
        question: "¿Qué efectos puede tener el paracetamol?",
        answer:
          "En general es seguro, pero en dosis altas puede dañar el hígado. No excedas la dosis recomendada.",
      },
      {
        question: "¿Qué pasa si tomo mucho ibuprofeno?",
        answer:
          "El exceso de ibuprofeno puede causar daño estomacal, úlceras y problemas renales.",
      },
    ],
  },
];

export const populateTopicsDatabase = async () => {
  try {
    const collection = await getCollection<Topic>("topics_es");
    if (!collection) {
      console.error("Failed to connect to topics_es collection");
      return;
    }

    await collection.deleteMany({});

    await collection.insertMany(TOPICS_ES);

    console.log("Topics database populated successfully!");
    console.log(`Inserted ${TOPICS_ES.length} topics`);

    const count = await collection.countDocuments();
    console.log(`Total documents in topics_es: ${count}`);
  } catch (error) {
    console.error("Error populating topics database:", error);
  }
};
