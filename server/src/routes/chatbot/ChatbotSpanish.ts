/* eslint-disable indent */
import { getCollection } from "../../database/functions.js";
import { Question, Topic, Topics } from "../../types/Chatbot.js";

const arrContainsSomeFromArr2 = (arr: unknown[], arr2: unknown[]): boolean =>
  arr.some((item) => arr2.includes(item));

const tildes = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n" } as const;

const getMessageNormalized = (message: string): string => {
  return message
    .replace(/[áéíóúñ]/g, (c) => tildes[c as keyof typeof tildes])
    .replace(/[¿?¡!.,;:()"'[\]{}]/g, "")
    .trim();
};

const findBestMatchingQuestionES = (
  message: string,
  questions: Question[],
): Question | null => {
  const messageWords = message.toLowerCase().split(" ");
  let bestMatch: Question | null = null;
  let maxScore = 0;

  for (const q of questions) {
    const questionWords = q.question.toLowerCase().split(" ");
    let score = 0;

    for (const word of messageWords) {
      if (questionWords.some((qw) => qw.includes(word) || word.includes(qw))) {
        score++;
      }
    }

    if (
      q.question.toLowerCase().includes(message.toLowerCase()) ||
      message
        .toLowerCase()
        .includes(q.question.toLowerCase().split("¿")[1]?.split("?")[0] || "")
    ) {
      score += 5;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = q;
    }
  }

  return maxScore >= 1 ? bestMatch : null;
};

const translateTopicES = (topic: Topics): string => {
  switch (topic) {
    case "App Functionality":
      return "Funcionalidades de la app";
    case "Medication Configuration":
      return "Configuración de Medicamentos";
    case "Medication Intake Recommendations":
      return "Recomendaciones de Toma de Medicamentos";
    case "Medication Information":
      return "Información de Medicamentos";
    case "Side Effects":
      return "Efectos Secundarios";
    default:
      return "Desconocido";
  }
};

const getTopicES = async (
  message: string,
): Promise<{ topic: Topic; matchedQuestion: Question | null }> => {
  try {
    const collectionEs = await getCollection<Topic>("topics_es");
    let arrTopics: Topic[] = [];

    if (collectionEs) arrTopics = await collectionEs.find({}).toArray();

    if (!arrTopics || arrTopics.length === 0) {
      console.log("Using fallback TOPICS_DB");
      throw new Error("No topics found");
    }

    const messageNormalized = getMessageNormalized(message.toLowerCase());
    let bestTopic: Topic | null = null;
    let bestQuestion: Question | null = null;
    let maxScore = 0;

    for (const topic of arrTopics) {
      const matchedQuestion = findBestMatchingQuestionES(
        messageNormalized,
        topic.questions,
      );

      if (matchedQuestion) {
        let topicScore = 0;

        switch (topic.topic as Topics) {
          case "App Functionality":
            if (
              messageNormalized.includes("app") ||
              messageNormalized.includes("aplicacion") ||
              messageNormalized.includes("funciona") ||
              messageNormalized.includes("como")
            ) {
              topicScore += 3;
            }
            break;
          case "Medication Configuration":
            if (
              messageNormalized.includes("agregar") ||
              messageNormalized.includes("configurar") ||
              messageNormalized.includes("editar") ||
              messageNormalized.includes("medicamento")
            ) {
              topicScore += 3;
            }
            break;
          case "Medication Intake Recommendations":
            if (
              messageNormalized.includes("olvide") ||
              messageNormalized.includes("dosis") ||
              messageNormalized.includes("tomar") ||
              messageNormalized.includes("comida")
            ) {
              topicScore += 3;
            }
            break;
          case "Medication Information":
            if (
              messageNormalized.includes("paracetamol") ||
              messageNormalized.includes("ibuprofeno") ||
              messageNormalized.includes("omeprazol") ||
              messageNormalized.includes("que es")
            ) {
              topicScore += 3;
            }
            break;
          case "Side Effects":
            if (
              messageNormalized.includes("efectos") ||
              messageNormalized.includes("secundarios") ||
              messageNormalized.includes("mucho") ||
              messageNormalized.includes("exceso")
            ) {
              topicScore += 3;
            }
            break;
          default:
            topicScore = 1;
            break;
        }

        if (topicScore > maxScore) {
          maxScore = topicScore;
          bestTopic = topic;
          bestQuestion = matchedQuestion;
        }
      }
    }

    if (bestTopic && bestQuestion)
      return { topic: bestTopic, matchedQuestion: bestQuestion };

    for (const topic of arrTopics) {
      const messageWords = messageNormalized.split(" ");
      for (const question of topic.questions) {
        const questionWords = question.question.toLowerCase().split(" ");
        const commonWords = messageWords.filter((word) =>
          questionWords.some((qw) => qw.includes(word) && word.length > 3),
        );

        if (commonWords.length > 0) {
          return { topic, matchedQuestion: question };
        }
      }
    }

    return {
      topic: { topic: "Unknown", questions: [] },
      matchedQuestion: null,
    };
  } catch (error) {
    console.error("Error in getTopic:", error);
    return {
      topic: { topic: "Unknown", questions: [] },
      matchedQuestion: null,
    };
  }
};

export const generateMessageES = async (
  messageLower: string,
  userName?: string,
): Promise<string> => {
  const greetingName = userName ? `, ${userName}` : "";
  const messageNormalized = getMessageNormalized(messageLower);

  const { topic, matchedQuestion } = await getTopicES(messageNormalized);

  const messageResponse = [];

  if (
    arrContainsSomeFromArr2(messageNormalized.split(" "), [
      "hola",
      "buenos",
      "buenas",
      "saludos",
    ])
  ) {
    messageResponse.push(`¡Hola${greetingName}! 👋\n\n`);
  }

  if (matchedQuestion) {
    messageResponse.push(matchedQuestion.answer);

    switch (topic.topic as Topics) {
      case "App Functionality":
        messageResponse.push(
          "\n\n💡 **Tip:** También puedes preguntar sobre cómo configurar medicamentos o agregar pacientes.",
        );
        break;
      case "Medication Configuration":
        messageResponse.push(
          "\n\n⚙️ **Recuerda:** Solo los cuidadores pueden configurar los medicamentos de los pacientes.",
        );
        break;
      case "Medication Intake Recommendations":
        messageResponse.push(
          "\n\n⚠️ **Importante:** Siempre consulta con tu médico antes de hacer cambios en tu medicación.",
        );
        break;
      case "Medication Information":
        messageResponse.push(
          "\n\n🩺 **Nota:** Esta información es general. Consulta con tu médico para recomendaciones específicas.",
        );
        break;
      case "Side Effects":
        messageResponse.push(
          "\n\n🚨 **Advertencia:** Si experimentas efectos secundarios graves, contacta inmediatamente a tu médico.",
        );
        break;
    }

    if (topic.questions.length > 1) {
      const otherQuestions = topic.questions.filter(
        (q) => q.question !== matchedQuestion.question,
      );
      if (otherQuestions.length > 0) {
        messageResponse.push(
          `\n\n❓ **Otras preguntas frecuentes sobre ${translateTopicES(topic.topic)}:**`,
        );
        const suggestedQuestions = otherQuestions.slice(0, 2);
        suggestedQuestions.forEach((q) => {
          messageResponse.push(`\n• ${q.question}`);
        });
      }
    }
  } else {
    if (topic.topic !== "Unknown" && topic.questions.length > 0) {
      messageResponse.push(
        `Entiendo que tienes una pregunta sobre **${translateTopicES(topic.topic)}**. Aquí tienes algunas preguntas frecuentes que podrían ayudarte:\n`,
      );

      const questionsToShow = topic.questions.slice(0, 3);
      questionsToShow.forEach((q, index) => {
        messageResponse.push(
          `\n${index + 1}. ${q.question}\n   *${q.answer}*\n`,
        );
      });

      messageResponse.push(
        "\n💬 ¿Te ayuda alguna de estas respuestas? Puedes hacer una pregunta más específica si necesitas más información.",
      );
    } else {
      messageResponse.push(
        `Entiendo tu consulta${greetingName}. Como asistente médico virtual especializado en MediTime, puedo ayudarte con:\n\n`,
      );
      messageResponse.push(
        "🏥 **Funcionalidades de la app** - Cómo usar MediTime\n",
      );
      messageResponse.push(
        "⚙️ **Configuración de medicamentos** - Agregar y editar medicinas\n",
      );
      messageResponse.push(
        "💊 **Recomendaciones de toma** - Qué hacer si olvidas una dosis\n",
      );
      messageResponse.push(
        "🔍 **Información de medicamentos** - Detalles sobre medicinas comunes\n",
      );
      messageResponse.push(
        "⚠️ **Efectos secundarios** - Información sobre reacciones\n\n",
      );
      messageResponse.push(
        "¿Podrías ser más específico sobre qué tema te interesa?",
      );
    }
  }

  return messageResponse.join("");
};
