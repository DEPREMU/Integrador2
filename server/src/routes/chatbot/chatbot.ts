import {
  RequestSendMessage,
  ResponseSendMessage,
  RequestGetConversations,
  ResponseGetConversations,
  RequestClearHistory,
  ResponseClearHistory,
} from "../../types/TypesAPI.js";
import { getCollection } from "../../database/functions.js";
import { Request, Response } from "express";
import { generateMessageES } from "./ChatbotSpanish.js";
import { generateMessageEN } from "./ChatbotEnglish.js";
import { Conversation, Message } from "../../types/Database.js";

const generateBotResponse = async (
  message: string,
  language: string,
  userName?: string,
): Promise<string> => {
  const messageLower = message.toLowerCase();

  if (language === "es") return await generateMessageES(messageLower, userName);
  if (language === "en") return await generateMessageEN(messageLower, userName);

  return "Sorry, I don't support your language yet. Please try in Spanish (es) or English (en).";
};

export const getConversationsHandler = async (req: Request, res: Response) => {
  try {
    const { userId }: RequestGetConversations = req.body;

    if (!userId) {
      const response: ResponseGetConversations = {
        conversations: [],
        error: {
          message: "userId is required",
          timestamp: new Date().toISOString(),
        },
      };
      res.status(400).json(response);
      return;
    }

    const conversationsCollection =
      await getCollection<Conversation>("conversations");
    if (!conversationsCollection) {
      const response: ResponseGetConversations = {
        conversations: [],
        error: {
          message: "Database connection failed",
          timestamp: new Date().toISOString(),
        },
      };
      res.status(500).json(response);
      return;
    }

    const conversations = await conversationsCollection
      .find({ userId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .toArray();

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      date: conv.date,
      messages: conv.messages,
    }));

    const response: ResponseGetConversations = {
      conversations: formattedConversations,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting conversations:", error);
    const response: ResponseGetConversations = {
      conversations: [],
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    };
    res.status(500).json(response);
  }
};

export const sendMessageHandler = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      message,
      language,
      userName,
      conversationId,
    }: RequestSendMessage = req.body;

    if (!userId || !message || !language) {
      const response: ResponseSendMessage = {
        conversation: { id: "", date: "", messages: [] },
        error: {
          message: "userId, message, and language are required",
          timestamp: new Date().toISOString(),
        },
      };
      res.status(400).json(response);
      return;
    }

    const conversationsCollection =
      await getCollection<Conversation>("conversations");
    if (!conversationsCollection) {
      const response: ResponseSendMessage = {
        conversation: { id: "", date: "", messages: [] },
        error: {
          message: "Database connection failed",
          timestamp: new Date().toISOString(),
        },
      };
      res.status(500).json(response);
      return;
    }

    const now = new Date();
    const userMessage: Message = {
      id: `user-${now.getTime()}`,
      text: message,
      sender: "user",
      timestamp: now,
    };

    const botResponseText = await generateBotResponse(
      message,
      language,
      userName,
    );
    const botMessage: Message = {
      id: `bot-${now.getTime() + 1}`,
      text: botResponseText,
      sender: "bot",
      timestamp: new Date(now.getTime() + 1000),
    };

    let conversation: Conversation;

    if (conversationId) {
      const existingConv = await conversationsCollection.findOne({
        userId,
        id: conversationId,
        isDeleted: false,
      });

      if (existingConv) {
        const updatedMessages = [
          ...existingConv.messages,
          userMessage,
          botMessage,
        ];

        await conversationsCollection.updateOne(
          { _id: existingConv._id },
          {
            $set: {
              messages: updatedMessages,
              updatedAt: now,
            },
          },
        );

        conversation = {
          ...existingConv,
          messages: updatedMessages,
          updatedAt: now,
        };
      } else {
        const newConvId = now.getTime().toString();
        const initialBotMessage: Message = {
          id: "bot-0",
          text:
            language === "es"
              ? "¡Hola! Soy tu asistente médico virtual. ¿En qué puedo ayudarte hoy?"
              : "Hello! I'm your virtual medical assistant. How can I help you today?",
          sender: "bot",
          timestamp: new Date(now.getTime() - 2000),
        };

        conversation = {
          userId,
          id: newConvId,
          date: now.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
            dateStyle: "long",
            timeStyle: "short",
          }),
          messages: [initialBotMessage, userMessage, botMessage],
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        };

        await conversationsCollection.insertOne(conversation);
      }
    } else {
      const newConvId = now.getTime().toString();
      const initialBotMessage: Message = {
        id: "bot-0",
        text:
          language === "es"
            ? "¡Hola! Soy tu asistente médico virtual. ¿En qué puedo ayudarte hoy?"
            : "Hello! I'm your virtual medical assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(now.getTime() - 2000),
      };

      conversation = {
        userId,
        id: newConvId,
        date: now.toISOString(),
        messages: [initialBotMessage, userMessage, botMessage],
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      };

      await conversationsCollection.insertOne(conversation);
    }

    const response: ResponseSendMessage = {
      conversation: {
        id: conversation.id,
        date: conversation.date,
        messages: conversation.messages,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error sending message:", error);
    const response: ResponseSendMessage = {
      conversation: { id: "", date: "", messages: [] },
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    };
    res.status(500).json(response);
  }
};

export const clearHistoryHandler = async (req: Request, res: Response) => {
  try {
    const { userId }: RequestClearHistory = req.body;

    if (!userId) {
      const response: ResponseClearHistory = {
        success: false,
        error: {
          message: "userId is required",
          timestamp: new Date().toISOString(),
        },
      };
      res.status(400).json(response);
      return;
    }

    const conversationsCollection =
      await getCollection<Conversation>("conversations");
    if (!conversationsCollection) {
      const response: ResponseClearHistory = {
        success: false,
        error: {
          message: "Database connection failed",
          timestamp: new Date().toISOString(),
        },
      };
      res.status(500).json(response);
      return;
    }

    await conversationsCollection.updateMany(
      { userId, isDeleted: false },
      { $set: { isDeleted: true, updatedAt: new Date() } },
    );

    const response: ResponseClearHistory = {
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error clearing history:", error);
    const response: ResponseClearHistory = {
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    };
    res.status(500).json(response);
  }
};
