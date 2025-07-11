/* eslint-disable indent */
import { getDatabase } from "./database/functions.js";
import { User, UserConfig } from "./types/Database.js";
import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import {
  UserWebSocket,
  WebSocketMessage,
  WebSocketResponse,
} from "./types/WebSocket.js";

let clients: Record<string, UserWebSocket> = {};

const initClients = async () => {
  const localClients = {} as Record<string, UserWebSocket>;
  const db = await getDatabase();
  const [users, userConfigs] = await Promise.all([
    db.collection<User>("users")?.find({}).toArray(),
    db.collection<UserConfig>("userConfig")?.find({}).toArray(),
  ]);

  users.forEach((user) => {
    localClients[user.userId] = {
      ws: null,
      user,
      userConfig:
        userConfigs.find((config) => config.userId === user.userId) || null,
    };
  });

  clients = localClients;
};

initClients().catch((error) => {
  console.error("Error initializing WebSocket clients:", error);
  throw error;
});

const handleInitWebSocket = (
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
): string | undefined => {
  let response: WebSocketResponse = {
    type: "not-user-id",
    message: "Missing userId, please login first",
    timestamp: new Date().toISOString(),
  };

  if (!parsedMessage.userId) {
    console.error("No userId provided in init message");
    ws.send(JSON.stringify(response));
    return;
  }
  if (!clients?.[parsedMessage.userId]) {
    console.error("User not found:", parsedMessage.userId);
    ws.send(JSON.stringify(response));
    return;
  }
  response = {
    type: "init-success",
    message: "WebSocket it's correctly initialized",
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(response));
  console.log(`WebSocket initialized for userId: ${parsedMessage.userId}`);
  clients[parsedMessage.userId].ws = ws;

  return parsedMessage.userId;
};

export const setupWebSocket = async (server: HTTPServer) => {
  let tries = 0;
  while (!clients || Object.keys(clients).length === 0) {
    await new Promise((r) => setTimeout(r, 1000));
    console.log(
      "Waiting for WebSocket clients to initialize...",
      tries > 10
        ? "This is taking longer than expected. Please verify your IP address is added to the allowed list in mongo."
        : "",
    );
    tries++;
  }

  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    let clientId: string | undefined;

    ws.on("message", async (buffer: Buffer) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(buffer.toString());

        switch (parsedMessage.type) {
          case "init":
            clientId = handleInitWebSocket(ws, parsedMessage);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        ws.send(
          JSON.stringify({
            success: false,
            error: {
              message: "Invalid message format",
              timestamp: new Date().toISOString(),
            },
          }),
        );
        ws.close();
        return;
      }
    });

    ws.on("close", (code, reason) => {
      console.log(
        `WebSocket connection closed: ${clientId} code: ${code}, reason: ${reason.toString()}`,
      );
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for ${clientId}:`, error);
      if (clientId) clients[clientId].ws = null;

      ws.close();
    });
  });

  wss.on("error", (error) => {
    console.error("WebSocket Server error:", error);
  });

  console.log("WebSocket server setup complete");
};

export const broadcastToAll = (message: WebSocketResponse) => {
  Object.values(clients)?.forEach((userWebSocket) => {
    const ws = userWebSocket.ws;
    if (!ws) return;

    if (ws.readyState !== WebSocket.OPEN) return;

    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(
        `Error broadcasting to ${userWebSocket.user.userId}:`,
        error,
      );
    }
  });
};

export const sendToClient = (
  clientId: string,
  message: WebSocketResponse,
): boolean => {
  const client = clients[clientId]?.ws;
  if (client && client.readyState === WebSocket.OPEN) {
    try {
      client.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Error sending to ${clientId}:`, error);
      return false;
    }
  }
  return false;
};

export const getConnectedClients = (): string[] => {
  return Object.keys(clients).filter(
    (clientId) => clients[clientId]?.ws?.readyState === WebSocket.OPEN,
  );
};
