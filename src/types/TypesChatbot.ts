export type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp?: Date;
};

export type Conversation = {
  id: string;
  date: string;
  messages: Message[];
};

// Tipos para las requests de la API del chatbot
export type RequestSendMessage = {
  userId: string;
  message: string;
  language: string;
  userName?: string;
  conversationId?: string;
};

export type ResponseSendMessage = {
  conversation: Conversation;
  error?: { message: string; timestamp: string };
};

export type RequestGetConversations = {
  userId: string;
};

export type ResponseGetConversations = {
  conversations: Conversation[];
  error?: { message: string; timestamp: string };
};

export type RequestClearHistory = {
  userId: string;
};

export type ResponseClearHistory = {
  success: boolean;
  error?: { message: string; timestamp: string };
};
