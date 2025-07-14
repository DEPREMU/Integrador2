/* eslint-disable indent */
import {
  UserWebSocket,
  WebSocketMessage,
  WebSocketResponse,
} from "./types/WebSocket.js";
import { getDatabase } from "./database/functions.js";
import { getTranslations } from "./translates/getTranslations.js";
import { User, UserConfig } from "./types/Database.js";
import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

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
      ws: clients[user.userId]?.ws || null,
      wsCapsy: clients[user.userId]?.wsCapsy || null,
      user,
      userConfig:
        userConfigs.find((config) => config.userId === user.userId) || null,
      intervalCapsy: clients[user.userId]?.intervalCapsy || undefined,
    };
  });

  console.log(
    `WebSocket clients initialized: ${Object.keys(localClients).length} users`,
  );
  clients = localClients;
};

initClients();
setInterval(initClients, 60000);

const handleInitWebSocket = (
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
): string | undefined => {
  let response: WebSocketResponse = {
    type: "not-user-id",
    message: "Missing userId, please login first",
    timestamp: new Date().toISOString(),
  };
  if (parsedMessage.type !== "init") return;

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

const handlePongWebSocket = (ws: WebSocket) => {
  const response: WebSocketResponse = {
    type: "pong",
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(response));
};

const handleTestWebSocket = (
  clientId: string,
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
) => {
  if (parsedMessage.type !== "test" || !parsedMessage.testing) return;
  let response: WebSocketResponse;
  const intervalsCapsy = clients[clientId]?.intervalCapsy;
  const newIntervalsCapsy: Record<
    string,
    {
      id: NodeJS.Timeout | number | null;
      type: "interval" | "timeout";
    }
  > = {};

  console.log(
    `Handling test message for client ${clientId}:`,
    parsedMessage.testing,
  );

  const handler = () => {
    const response: WebSocketResponse = {
      type: "notification",
      notification: {
        reason: "Medication Reminder",
        title: "It's time for your medication",
        body: "You have a medication scheduled for this time.",
        screen: "Home",
        trigger: null,
      },
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
  };
  const userConfig = clients[clientId]?.userConfig;

  const translations = getTranslations(userConfig?.language || "en");
  const t = (key: keyof typeof translations) => translations[key];

  switch (parsedMessage.testing) {
    case "notification":
      response = {
        type: "notification",
        notification: {
          reason: "Medication Reminder",
          title: t("testNotificationTitle"),
          body: t("testNotificationBody"),
          screen: "Schedule",
          trigger: {
            type: "timeInterval",
            seconds: 10,
            repeats: false,
          } as unknown as undefined,
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(response));
      break;
    case "ping":
      response = {
        type: "pong",
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(response));
      break;
    case "waitForCapsy":
      if (intervalsCapsy)
        Object.values(intervalsCapsy).forEach((value) => {
          if (!value?.id) return;
          if (value.type === "timeout") clearTimeout(value.id);
          else if (value.type === "interval") clearInterval(value.id);
        });
      Object.entries(parsedMessage.data || {}).forEach(([key, value]) => {
        if (!value?.id || !value?.type || !value?.timeout) return;
        const id =
          value.type === "timeout"
            ? setTimeout(handler, value.timeout)
            : setInterval(handler, value.timeout);
        newIntervalsCapsy[key] = {
          id,
          type: value.type,
        };
      });

      clients[clientId].intervalCapsy = newIntervalsCapsy;
      break;
  }
};

const handleCapsyWebSocket = (
  clientId: string,
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
) => {
  if (parsedMessage.type !== "capsy") return;
  let response: WebSocketResponse;

  if (!clients[clientId]?.wsCapsy) {
    clients[clientId].wsCapsy = ws;
    response = {
      type: "error-capsy",
      message: "Capsy WebSocket initialized successfully",
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
    return;
  }

  response = {
    type: "capsy",
    message: "Capsy WebSocket was initialized correctly",
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(response));
};

export const setupWebSocket = async (server: HTTPServer) => {
  let tries = 0;
  while (!clients || Object.keys(clients).length === 0) {
    await new Promise((r) => setTimeout(r, 1000 * (tries * 0.5 + 1)));
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
        console.log("Message from client:", parsedMessage);

        switch (parsedMessage.type) {
          case "init":
            clientId = handleInitWebSocket(ws, parsedMessage);
            break;
          case "ping":
            handlePongWebSocket(ws);
            break;
          case "test":
            if (!clientId) break;
            handleTestWebSocket(clientId, ws, parsedMessage);
            break;
          case "capsy":
            if (!clientId) break;
            handleCapsyWebSocket(clientId, ws, parsedMessage);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        const response: WebSocketResponse = {
          type: "error",
          message: "Invalid message format",
          timestamp: new Date().toISOString(),
        };
        ws.send(JSON.stringify(response));
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
