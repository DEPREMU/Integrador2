import { getCollection } from "../../database/functions.js";
import { Question, Topic, Topics } from "../../types/Chatbot.js";

/* eslint-disable indent */

const arrContainsSomeFromArr2 = (arr: unknown[], arr2: unknown[]): boolean =>
  arr.some((item) => arr2.includes(item));

const getMessageNormalized = (message: string): string => {
  return message.replace(/[?!.,;:()"'[\]{}]/g, "").trim();
};

const findBestMatchingQuestionEN = (
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
      message.toLowerCase().includes(q.question.toLowerCase())
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

const translateTopicEN = (topic: Topics): string => {
  switch (topic) {
    case "App Functionality":
      return "App Functionality";
    case "Medication Configuration":
      return "Medication Configuration";
    case "Medication Intake Recommendations":
      return "Medication Intake Recommendations";
    case "Medication Information":
      return "Medication Information";
    case "Side Effects":
      return "Side Effects";
    default:
      return "Unknown";
  }
};

const getTopicEN = async (
  message: string,
): Promise<{ topic: Topic; matchedQuestion: Question | null }> => {
  try {
    const collectionEn = await getCollection<Topic>("topics_en");
    let arrTopics: Topic[] = [];

    if (collectionEn) arrTopics = await collectionEn.find({}).toArray();

    if (!arrTopics || arrTopics.length === 0) {
      console.log("Using fallback TOPICS_DB");
      throw new Error("No topics found");
    }

    const messageNormalized = getMessageNormalized(message.toLowerCase());
    let bestTopic: Topic | null = null;
    let bestQuestion: Question | null = null;
    let maxScore = 0;

    for (const topic of arrTopics) {
      const matchedQuestion = findBestMatchingQuestionEN(
        messageNormalized,
        topic.questions,
      );

      if (matchedQuestion) {
        let topicScore = 0;

        switch (topic.topic as Topics) {
          case "App Functionality":
            if (
              messageNormalized.includes("app") ||
              messageNormalized.includes("application") ||
              messageNormalized.includes("work") ||
              messageNormalized.includes("how")
            ) {
              topicScore += 3;
            }
            break;
          case "Medication Configuration":
            if (
              messageNormalized.includes("add") ||
              messageNormalized.includes("configure") ||
              messageNormalized.includes("edit") ||
              messageNormalized.includes("medication")
            ) {
              topicScore += 3;
            }
            break;
          case "Medication Intake Recommendations":
            if (
              messageNormalized.includes("forgot") ||
              messageNormalized.includes("dose") ||
              messageNormalized.includes("take") ||
              messageNormalized.includes("food")
            ) {
              topicScore += 3;
            }
            break;
          case "Medication Information":
            if (
              messageNormalized.includes("paracetamol") ||
              messageNormalized.includes("ibuprofen") ||
              messageNormalized.includes("omeprazole") ||
              messageNormalized.includes("what is")
            ) {
              topicScore += 3;
            }
            break;
          case "Side Effects":
            if (
              messageNormalized.includes("effects") ||
              messageNormalized.includes("side") ||
              messageNormalized.includes("too much") ||
              messageNormalized.includes("excess")
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

export const generateMessageEN = async (
  messageLower: string,
  userName?: string,
): Promise<string> => {
  const greetingName = userName ? `, ${userName}` : "";
  const messageNormalized = getMessageNormalized(messageLower);

  const { topic, matchedQuestion } = await getTopicEN(messageNormalized);

  const messageResponse = [];

  if (
    arrContainsSomeFromArr2(messageNormalized.split(" "), [
      "hello",
      "hi",
      "good",
      "greetings",
    ])
  ) {
    messageResponse.push(`Hello${greetingName}! 👋\n\n`);
  }

  if (matchedQuestion) {
    messageResponse.push(matchedQuestion.answer);

    switch (topic.topic as Topics) {
      case "App Functionality":
        messageResponse.push(
          "\n\n💡 **Tip:** You can also ask about how to configure medications or add patients.",
        );
        break;
      case "Medication Configuration":
        messageResponse.push(
          "\n\n⚙️ **Remember:** Only caregivers can configure medications for patients.",
        );
        break;
      case "Medication Intake Recommendations":
        messageResponse.push(
          "\n\n⚠️ **Important:** Always consult your doctor before making changes to your medication.",
        );
        break;
      case "Medication Information":
        messageResponse.push(
          "\n\n🩺 **Note:** This information is general. Consult your doctor for specific recommendations.",
        );
        break;
      case "Side Effects":
        messageResponse.push(
          "\n\n🚨 **Warning:** If you experience serious side effects, contact your doctor immediately.",
        );
        break;
    }

    if (topic.questions.length > 1) {
      const otherQuestions = topic.questions.filter(
        (q) => q.question !== matchedQuestion.question,
      );
      if (otherQuestions.length > 0) {
        messageResponse.push(
          `\n\n❓ **Other frequently asked questions about ${translateTopicEN(topic.topic)}:**`,
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
        `I understand you have a question about **${translateTopicEN(topic.topic)}**. Here are some frequently asked questions that might help you:\n`,
      );

      const questionsToShow = topic.questions.slice(0, 3);
      questionsToShow.forEach((q, index) => {
        messageResponse.push(
          `\n${index + 1}. ${q.question}\n   *${q.answer}*\n`,
        );
      });

      messageResponse.push(
        "\n💬 Does any of these answers help you? You can ask a more specific question if you need more information.",
      );
    } else {
      messageResponse.push(
        `I understand your question${greetingName}. As a virtual medical assistant specialized in MediTime, I can help you with:\n\n`,
      );
      messageResponse.push("🏥 **App Functionality** - How to use MediTime\n");
      messageResponse.push(
        "⚙️ **Medication Configuration** - Adding and editing medications\n",
      );
      messageResponse.push(
        "💊 **Intake Recommendations** - What to do if you forget a dose\n",
      );
      messageResponse.push(
        "🔍 **Medication Information** - Details about common medications\n",
      );
      messageResponse.push(
        "⚠️ **Side Effects** - Information about reactions\n\n",
      );
      messageResponse.push(
        "Could you be more specific about which topic interests you?",
      );
    }
  }

  return messageResponse.join("");
};
