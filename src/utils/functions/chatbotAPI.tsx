/* eslint-disable react-native/no-inline-styles */
import { View } from "react-native";
import { Text } from "react-native-paper";
import React, { JSX } from "react";
import { LanguagesSupported } from "../translates";
import { getRouteAPI, fetchOptions } from "./APIManagement";
import {
  RequestSendMessage,
  ResponseSendMessage,
  RequestGetConversations,
  ResponseGetConversations,
  RequestClearHistory,
  ResponseClearHistory,
} from "@typesAPI";

/**
 * Obtiene todas las conversaciones del usuario desde el servidor
 * @param userId - ID del usuario
 * @returns Promise con las conversaciones del usuario
 */
export const getConversations = async (
  userId: string,
): Promise<ResponseGetConversations> => {
  try {
    const requestBody: RequestGetConversations = { userId };
    const options = fetchOptions<RequestGetConversations>("POST", requestBody);

    const response = await fetch(
      getRouteAPI("/chatbot/getConversations"),
      options,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ResponseGetConversations = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting conversations:", error);
    return {
      conversations: [],
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
    };
  }
};

/**
 * Envía un mensaje al chatbot y obtiene la respuesta
 * @param userId - ID del usuario
 * @param message - Mensaje del usuario
 * @param language - Idioma de la conversación
 * @param userName - Nombre del usuario (opcional)
 * @param conversationId - ID de la conversación existente (opcional)
 * @returns Promise con la conversación actualizada
 */
export const sendMessage = async (
  userId: string,
  message: string,
  language: LanguagesSupported,
  userName?: string,
  conversationId?: string,
): Promise<ResponseSendMessage> => {
  try {
    const requestBody: RequestSendMessage = {
      userId,
      message,
      language,
      userName,
      conversationId,
    };
    const options = fetchOptions<RequestSendMessage>("POST", requestBody);

    const response = await fetch(getRouteAPI("/chatbot/sendMessage"), options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ResponseSendMessage = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      conversation: { id: "", date: "", messages: [] },
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
    };
  }
};

/**
 * Limpia el historial de conversaciones del usuario (marca como eliminadas)
 * @param userId - ID del usuario
 * @returns Promise con el resultado de la operación
 */
export const clearHistory = async (
  userId: string,
): Promise<ResponseClearHistory> => {
  try {
    const requestBody: RequestClearHistory = { userId };
    const options = fetchOptions<RequestClearHistory>("POST", requestBody);

    const response = await fetch(getRouteAPI("/chatbot/clearHistory"), options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ResponseClearHistory = await response.json();
    return data;
  } catch (error) {
    console.error("Error clearing history:", error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
    };
  }
};

export const getBoldText = (part: string, index: number): JSX.Element => {
  part = part.replace(/\*\*/g, "");
  const hasItalic = part.search(/_[^_]+_/g) > -1;
  if (hasItalic) part = part.replace(/_/g, "") || "";

  return (
    <Text
      key={index}
      style={{
        fontWeight: "bold",
        fontStyle: hasItalic ? "italic" : "normal",
      }}
    >
      {part.trim()}
    </Text>
  );
};

export const getSeparator = (index: number): JSX.Element => (
  <View
    key={index}
    style={{ height: 1, backgroundColor: "#ccc", width: "100%" }}
  />
);

export const getListItem = (part: string, index: number): JSX.Element => {
  part = part.replace("*", "\u2022").trim();
  let partInBold;
  const hasBold = part.search(/\*\*[^*]+\*\*/g) > -1;
  if (hasBold) {
    partInBold = part.match(/\*\*[^*]+\*\*/g)?.[0];
    part = part
      .replace(partInBold || "", "")
      .replace("\u2022", "")
      .trim();
    partInBold = partInBold ? partInBold.slice(2, -2) : "";
    partInBold = ["\u2022", partInBold].join(" ");
  }

  return (
    <Text
      style={{
        fontStyle: "italic",
      }}
      key={index}
    >
      {hasBold && <Text style={{ fontWeight: "bold" }}>{partInBold}</Text>}
      {part}
      {"\n"}
    </Text>
  );
};

export const getItalicText = (part: string, index: number): JSX.Element => {
  const italicText = part.slice(1, -1);
  return (
    <Text style={{ fontStyle: "italic" }} key={index}>
      {italicText}
      {"\n"}
    </Text>
  );
};

export const getTitleText = (part: string, index: number): JSX.Element => {
  const headerLevel = part.match(/^#+/) as RegExpMatchArray;

  const level = headerLevel[0].length;
  const headerText = part.slice(level).replace(/\*\*/g, "").trim();
  return (
    <Text
      key={index}
      style={{
        fontSize: 22 - level * 2,
        fontWeight: "bold",
        marginVertical: 5,
      }}
    >
      {headerText}
    </Text>
  );
};

export const parseTextChatbot = (
  input: string,
  isUserMessage: boolean = false,
): JSX.Element[] => {
  if (isUserMessage) return [<Text key={0}>{input}</Text>];

  const parts = input
    .split(
      /(\*\*[^*]+\*\*)|(---)|(\*[^\n]+)|(_[^\n]+_)|(#[^\n]+)|(##[^\n]+)|(###[^\n]+)/g,
    )
    .filter(Boolean);

  return parts.map((part, index) => {
    // Bold text
    if (part.startsWith("**") && part.endsWith("**"))
      return getBoldText(part, index);
    // Separator
    if (part === "---") return getSeparator(index);
    // List item
    if (part.startsWith("*")) return getListItem(part, index);
    // Italic text
    if (part.startsWith("_") && part.endsWith("_"))
      return getItalicText(part, index);
    // Title text
    if (part.startsWith("#")) return getTitleText(part, index);
    // If none of the above, return as normal text
    return <Text key={index}>{part}</Text>;
  });
};
