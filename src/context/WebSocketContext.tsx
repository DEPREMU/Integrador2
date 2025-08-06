/* eslint-disable indent */
/* eslint-disable no-undef */
import {
  log,
  logError,
  stringifyData,
  typeLanguages,
  URL_WEB_SOCKET,
} from "@utils";
import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  createContext,
} from "react";
import Button from "@components/common/Button";
import { User } from "@typesAPI";
import { useModal } from "./ModalContext";
import { useLanguage } from "./LanguageContext";
import { useUserContext } from "./UserContext";
import { WebSocketMessage, WebSocketResponse } from "@typesAPI";
import { sendNotification } from "@/utils/functions/notifications";

interface WebSocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: WebSocketMessage) => void;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  sendMessage: () => {},
});

const handleInitSuccessWebSocket = (
  openModal: (
    title: string,
    body: React.ReactNode,
    buttons: React.ReactNode,
  ) => void,
  closeModal: () => void,
  t: (key: keyof typeLanguages, options?: object) => string,
  userData: User | null,
  timeOutId: React.RefObject<NodeJS.Timeout | null>,
) => {
  if (timeOutId.current) clearTimeout(timeOutId.current);
  openModal(
    t("success"),
    t("welcomeUser", { name: userData?.name || t("dearUser") }),
    <Button handlePress={closeModal} label={t("close")} touchableOpacity />,
  );
  log("WebSocket initialized successfully.");
};

const handleReconnectWebSocket = (
  socket: WebSocket,
  timeOutId: React.RefObject<NodeJS.Timeout | null>,
  setSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>,
) => {
  if (socket.readyState === WebSocket.OPEN)
    return timeOutId.current && clearTimeout(timeOutId.current);
  timeOutId.current = setTimeout(() => {
    setSocket(null);
  }, 2000);
};

const getWebSocket = (
  userData: User | null,
  openModal: (
    title: string,
    body: React.ReactNode,
    buttons: React.ReactNode,
  ) => void,
  closeModal: () => void,
  t: (key: keyof typeLanguages, options?: object) => string,
  timeOutId: React.RefObject<NodeJS.Timeout | null>,
  setSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>,
) => {
  const socket = new WebSocket(URL_WEB_SOCKET);
  const pingInterval = setInterval(() => socket.ping(), 30000);

  socket.onopen = () => {
    const message: WebSocketMessage = {
      type: "init",
      userId: userData?.userId,
    };
    socket.send(JSON.stringify(message));
    log("WebSocket message sent:", message);
  };

  socket.onmessage = async (event) => {
    const parsedMessage: WebSocketResponse = JSON.parse(event.data);

    console.log("Message from server:", parsedMessage);
    if (!parsedMessage.type) {
      logError("Received message without type:", parsedMessage);
      return;
    }
    switch (parsedMessage.type) {
      case "init-success":
        handleInitSuccessWebSocket(
          openModal,
          closeModal,
          t,
          userData,
          timeOutId,
        );
        break;
      case "not-user-id":
        logError("No user ID provided:", parsedMessage.message);
        break;
      case "notification":
        await sendNotification(
          parsedMessage.notification?.reason,
          parsedMessage.notification?.title,
          parsedMessage.notification?.body,
          parsedMessage.notification?.trigger,
          parsedMessage.notification?.screen,
          parsedMessage.notification?.data,
        );
        break;
      case "error":
        logError("WebSocket error:", parsedMessage.message);
        logError("WebSocket error:", parsedMessage.message);
        break;
      case "pong":
        log("WebSocket pong received:", parsedMessage.timestamp);
        break;
      case "pillbox-config-saved":
      case "pillbox-config-loaded":
      case "pillbox-config-deleted":
        // Emit custom event for pillbox configuration messages
        const event = new CustomEvent("pillbox-config-message", {
          detail: parsedMessage,
        });
        window.dispatchEvent(event);
        log("Pillbox config message dispatched:", parsedMessage.type);
        break;
      default:
        log("Unknown message type:", parsedMessage);
    }
  };

  socket.onerror = (error) => {
    logError("WebSocket error:", error);
    clearInterval(pingInterval);
    handleReconnectWebSocket(socket, timeOutId, setSocket);
  };

  socket.ping = () => {
    if (socket.readyState !== WebSocket.OPEN)
      return handleReconnectWebSocket(socket, timeOutId, setSocket);
    const message: WebSocketMessage = { type: "ping" };
    socket.send(JSON.stringify(message));
    log("WebSocket ping sent.");
  };

  socket.onclose = (event) => {
    log("WebSocket connection closed:", event);
    clearInterval(pingInterval);
    handleReconnectWebSocket(socket, timeOutId, setSocket);
  };

  return socket;
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const { t } = useLanguage();
  const { userData } = useUserContext();
  const { openModal, closeModal } = useModal();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const timeOutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userData?.userId) return;
    if (socket && userData?.userId) return;

    const newSocket = getWebSocket(
      userData,
      openModal,
      closeModal,
      t,
      timeOutId,
      setSocket,
    );
    setSocket(newSocket);
  }, [userData, socket, openModal, closeModal, t]);

  const sendMessage = (message: WebSocketMessage) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(stringifyData(message));
  };

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
