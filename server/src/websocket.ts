/* eslint-disable indent */
import {
  CapsyWebSocket,
  UserWebSocket,
  WebSocketMessage,
  WebSocketResponse,
  TimerType,
  IdCapsyCase,
} from "./types/WebSocket.js";
import { getDatabase } from "./database/functions.js";
import { getTranslations } from "./translates/getTranslations.js";
import { User, UserConfig } from "./types/Database.js";
import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

let clients: Record<string, UserWebSocket> = {};
const clientsCapsy: Record<string, CapsyWebSocket> = {};

const getMexicoTime = (): Date => {
  const now = new Date();
  const mexicoTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }),
  );
  return mexicoTime;
};

const createMexicoDate = (hours: number, minutes: number): Date => {
  const mexicoNow = getMexicoTime();
  const mexicoDate = new Date(mexicoNow);
  mexicoDate.setHours(hours, minutes, 0, 0);
  return mexicoDate;
};

const getNextScheduledTime = (
  startTime: string,
  intervalMs: number,
): number => {
  const [hours, minutes] = startTime.split(":").map(Number);

  const now = getMexicoTime();
  const baseTime = createMexicoDate(hours, minutes);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Mexico_City",
    });
  };

  const serverNow = new Date();
  const timezoneOffset = serverNow.getTimezoneOffset();
  const mexicoOffset = 6 * 60;

  console.log(
    `🌍 Server time: ${serverNow.toLocaleTimeString("es-ES", { hour12: false })}`,
  );
  console.log(`🌍 Mexico time: ${formatTime(now)}`);
  console.log(`🌍 Server timezone offset: ${timezoneOffset} minutes from UTC`);

  if (Math.abs(timezoneOffset - mexicoOffset) > 60) {
    console.warn(
      "⚠️  TIMEZONE MISMATCH: Using Mexico timezone for calculations!",
    );
  }
  console.log(
    `⏰ getNextScheduledTime - startTime: ${startTime}, intervalMs: ${intervalMs}ms (${intervalMs / 3600000}h)`,
  );
  console.log(
    `⏰ Current time: ${formatTime(now)} (${now.getTime()}), Target time: ${formatTime(baseTime)} (${baseTime.getTime()})`,
  );
  console.log(
    `⏰ Debug - Current hour: ${now.getHours()}, Current minute: ${now.getMinutes()}, Target hour: ${hours}, Target minute: ${minutes}`,
  );

  if (baseTime > now) {
    const timeUntil = baseTime.getTime() - now.getTime();
    console.log(
      `⏰ Time until target (future): ${timeUntil}ms (${Math.round(timeUntil / 60000)} minutes)`,
    );
    return timeUntil;
  }

  const timeSinceBase = now.getTime() - baseTime.getTime();
  console.log(
    `⏰ Time since base (past): ${timeSinceBase}ms (${Math.round(timeSinceBase / 60000)} minutes)`,
  );

  if (timeSinceBase > 0) {
    const intervalsPassed = Math.floor(timeSinceBase / intervalMs);
    console.log(
      `⏰ Complete intervals passed since base time: ${intervalsPassed}`,
    );

    const nextOccurrence =
      baseTime.getTime() + (intervalsPassed + 1) * intervalMs;
    const timeUntilNext = nextOccurrence - now.getTime();

    const nextOccurrenceDate = new Date(nextOccurrence);
    console.log(
      `⏰ Next occurrence at: ${formatTime(nextOccurrenceDate)} (in ${timeUntilNext}ms = ${Math.round(timeUntilNext / 60000)} minutes)`,
    );

    if (timeUntilNext < 60000) {
      const nextAfterThat = nextOccurrence + intervalMs;
      const timeUntilNextAfterThat = nextAfterThat - now.getTime();
      const nextAfterThatDate = new Date(nextAfterThat);
      console.log(
        `⏰ Next occurrence too soon, using subsequent one at: ${formatTime(nextAfterThatDate)} (in ${timeUntilNextAfterThat}ms = ${Math.round(timeUntilNextAfterThat / 60000)} minutes)`,
      );
      return timeUntilNextAfterThat;
    }

    return timeUntilNext;
  }

  console.log(`⏰ Fallback: using full interval ${intervalMs}ms`);
  return intervalMs;
};

export const isConnectedUser = (clientId: string): boolean => {
  return clients[clientId]?.ws?.readyState === WebSocket.OPEN;
};

export const isConnectedCapsy = (clientId: string): boolean => {
  return clientsCapsy[clientId]?.ws?.readyState === WebSocket.OPEN;
};

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
      wsCapsy: clients[user.userId]?.wsCapsy || undefined,
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
  let id = parsedMessage.userId;

  if (id) {
    if (!clients?.[id]) {
      console.error("User not found:", id);
      ws.send(JSON.stringify(response));
      return;
    }
    response = {
      type: "init-success",
      message: "WebSocket it's correctly initialized",
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
    console.log(`WebSocket initialized for userId: ${id}`);
    clients[id].ws = ws;

    return id;
  }
  id = parsedMessage.capsyId;
  if (!id) {
    console.error("No userId or capsyId provided in init message");
    ws.send(JSON.stringify(response));
    return;
  }

  clientsCapsy[id] = {
    ws,
    id,
  };

  response = {
    type: "init-success",
    message: "Capsy WebSocket initialized correctly",
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(response));
  console.log(`Capsy WebSocket initialized for capsyId: ${id}`);

  return id;
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
      type: TimerType;
    }
  > = {};

  console.log(
    `Handling test message for client ${clientId}:`,
    parsedMessage.testing,
  );

  const userConfig = clients[clientId]?.userConfig;

  const translations = getTranslations(userConfig?.language || "en");
  const t = (key: keyof typeof translations) => translations[key];

  const handler = () => {
    const response: WebSocketResponse = {
      type: "notification",
      notification: {
        body: t("medicationReminderBody"),
        title: t("medicationReminderTitle"),
        reason: "Medication Reminder",
        screen: "Home",
        trigger: null,
      },
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
  };

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
  const intervalsCapsy = clients[clientId]?.intervalCapsy;
  const newIntervalsCapsy: Record<
    string,
    {
      id: NodeJS.Timeout | number | null;
      type: TimerType;
    }
  > = {};

  if (intervalsCapsy)
    Object.values(intervalsCapsy).forEach((value) => {
      if (!value?.id) return;
      if (value.type === "timeout") clearTimeout(value.id);
      else if (value.type === "interval") clearInterval(value.id);
    });

  if (!clients[clientId]?.wsCapsy) {
    clients[clientId].wsCapsy = {};
  }

  const translations = getTranslations(
    clients[clientId]?.userConfig?.language || "en",
  );
  const t = (key: keyof typeof translations) => translations[key];

  parsedMessage.pastilla.forEach((value) => {
    if (!value?.id || !value?.type || !value?.timeout || !value?.cantidad)
      return;
    const id =
      value.type === "timeout"
        ? setTimeout(() => {
            const response: WebSocketResponse = {
              type: "notification",
              notification: {
                reason: "Medication Reminder",
                title: t("medicationReminderTitle"),
                body: t("medicationReminderBody"),
                screen: "Home",
                trigger: null,
              },
              timestamp: new Date().toISOString(),
            };
            ws.send(JSON.stringify(response));
          }, value.timeout)
        : setInterval(() => {
            const response: WebSocketResponse = {
              type: "notification",
              notification: {
                reason: "Medication Reminder",
                title: t("medicationReminderTitle"),
                body: t("medicationReminderBody"),
                screen: "Home",
                trigger: null,
              },
              timestamp: new Date().toISOString(),
            };
            ws.send(JSON.stringify(response));
          }, value.timeout);
    newIntervalsCapsy[value.id] = {
      id,
      type: value.type,
    };
  });

  clients[clientId].intervalCapsy = newIntervalsCapsy;

  const finalResponse = {
    type: "capsy",
    message: "Capsy WebSocket was initialized correctly",
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(finalResponse));
};

const handleAddCapsyWebSocket = (
  clientId: string,
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
) => {
  if (parsedMessage.type !== "add-capsy" || !parsedMessage.capsyId) return;
  const capsyId = parsedMessage.capsyId;
  let response: WebSocketResponse = {
    type: "error-capsy",
    message: "Capsy not found",
    timestamp: new Date().toISOString(),
  };

  if (!clientsCapsy[capsyId]) {
    response = {
      type: "error-capsy",
      message: "Capsy device not found or not connected",
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
    return;
  }

  if (!clients[clientId].wsCapsy) {
    clients[clientId].wsCapsy = {};
  }
  clients[clientId].wsCapsy[capsyId] = {
    ...clientsCapsy[capsyId],
    userId: clientId,
  };

  clientsCapsy[capsyId].userId = clientId;

  response = {
    type: "notification",
    notification: {
      reason: "Initial Notification",
      title: `Capsy ${capsyId} vinculado`,
      body: "El dispositivo Capsy se ha vinculado correctamente a tu cuenta.",
      screen: "Dashboard",
      trigger: null,
    },
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(response));
};

const handleCapsyIndividualConfig = (
  clientId: string,
  capsyId: string,
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
) => {
  if (parsedMessage.type !== "capsy-individual") return;

  const userClient = clients[clientId];
  if (!userClient) return;

  const translations = getTranslations(userClient.userConfig?.language || "en");
  const t = (key: keyof typeof translations) => translations[key];

  if (userClient.intervalCapsy) {
    Object.keys(userClient.intervalCapsy).forEach((key) => {
      if (key.startsWith(`${capsyId}_`)) {
        const interval = userClient.intervalCapsy?.[key];
        if (interval?.id) {
          if (interval.type === "timeout" || interval.type === "scheduled")
            clearTimeout(interval.id as NodeJS.Timeout);
          else if (interval.type === "interval")
            clearInterval(interval.id as NodeJS.Timeout);
        }
        if (userClient.intervalCapsy) {
          delete userClient.intervalCapsy[key];
        }
      }
    });
  } else {
    userClient.intervalCapsy = {};
  }

  parsedMessage.pastilla.forEach((value) => {
    if (!value?.id || !value?.type || !value?.cantidad) return;

    const handler = () => {
      const capsyDevice = clientsCapsy[capsyId];
      if (!capsyDevice || capsyDevice.ws?.readyState !== WebSocket.OPEN) {
        const response: WebSocketResponse = {
          type: "notification",
          notification: {
            reason: "Capsy not connected",
            title: t("capsyNotConnectedTitle"),
            body: t("capsyNotConnectedBody"),
            screen: "Home",
          },
          timestamp: new Date().toISOString(),
        };
        userClient.ws?.send(JSON.stringify(response));
        return;
      }

      const userNotification: WebSocketResponse = {
        type: "notification",
        notification: {
          reason: "Medication Reminder",
          title: t("medicationReminderTitle"),
          body: `${t("medicationReminderBody")} - Capsy ${capsyId}`,
          screen: "Home",
          trigger: null,
        },
        timestamp: new Date().toISOString(),
      };
      userClient.ws?.send(JSON.stringify(userNotification));

      const capsyRequest: WebSocketResponse = {
        type: "capsy-alert",
        pastilla: { id: value.id, cantidad: value.cantidad },
        timestamp: new Date().toISOString(),
      };
      capsyDevice.ws?.send(JSON.stringify(capsyRequest));
    };

    let timerId: NodeJS.Timeout | number;
    let timerType: TimerType = value.type;

    switch (value.type) {
      case "timeout":
        if (!value.timeout) return;
        timerId = setTimeout(handler, value.timeout);
        break;

      case "interval":
        if (!value.timeout) return;
        timerId = setInterval(handler, value.timeout);
        break;

      case "scheduled": {
        if (!value.startTime || !value.intervalMs) return;

        const timeUntilStart = getNextScheduledTime(
          value.startTime,
          value.intervalMs,
        );
        timerId = setTimeout(() => {
          handler();

          const intervalId = setInterval(handler, value.intervalMs || 0);

          const uniqueKey = `${capsyId}_${value.id}`;
          if (userClient.intervalCapsy) {
            userClient.intervalCapsy[uniqueKey] = {
              id: intervalId,
              type: "interval",
            };
          }
        }, timeUntilStart);
        timerType = "scheduled";
        break;
      }

      default:
        return;
    }

    const uniqueKey = `${capsyId}_${value.id}`;
    if (userClient.intervalCapsy) {
      userClient.intervalCapsy[uniqueKey] = {
        id: timerId,
        type: timerType,
      };
    }
  });

  const response = {
    type: "capsy",
    message: `Capsy ${capsyId} configured successfully with individual schedule`,
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(response));
};

const handleCapsyPillRequest = (
  capsyId: string,
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
) => {
  if (parsedMessage.type !== "capsy-pill-request") return;

  const capsy = clientsCapsy[capsyId];
  if (!capsy || !capsy.userId) return;

  const userId = capsy.userId;
  const userClient = clients[userId];

  if (!userClient || !userClient.ws) return;

  const userConfig = userClient.userConfig;
  const translations = getTranslations(userConfig?.language || "en");
  const t = (key: keyof typeof translations) => translations[key];

  const userNotification: WebSocketResponse = {
    type: "notification",
    notification: {
      reason: "Medication Reminder",
      title: t("medicationReminderTitle"),
      body: t("medicationReminderBody"),
      screen: "Home",
      trigger: null,
    },
    timestamp: new Date().toISOString(),
  };
  userClient.ws.send(JSON.stringify(userNotification));

  const capsyAlert: WebSocketResponse = {
    type: "capsy-alert",
    pastilla: parsedMessage.pastilla[0],
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(capsyAlert));
};

const startPillboxSchedule = async (
  clientId: string,
  pillboxId: string,
  compartments: {
    id: string;
    medication: string;
    timeSlots: { startTime: string; intervalHours: number }[];
    dosage: string;
  }[],
) => {
  console.log("🚀 Starting pillbox schedule for:", pillboxId);

  const userClient = clients[clientId];
  if (!userClient) {
    console.error("❌ User client not found:", clientId);
    return;
  }

  const translations = getTranslations(userClient.userConfig?.language || "en");
  const t = (key: keyof typeof translations) => translations[key];

  if (userClient.intervalCapsy) {
    Object.keys(userClient.intervalCapsy).forEach((key) => {
      if (key.startsWith(`${pillboxId}_`)) {
        const interval = userClient.intervalCapsy?.[key];
        if (interval?.id) {
          if (interval.type === "timeout" || interval.type === "scheduled") {
            clearTimeout(interval.id as NodeJS.Timeout);
          } else if (interval.type === "interval") {
            clearInterval(interval.id as NodeJS.Timeout);
          }
        }
        if (userClient.intervalCapsy) {
          delete userClient.intervalCapsy[key];
        }
      }
    });
  } else {
    userClient.intervalCapsy = {};
  }

  const pastillaArray = compartments
    .filter((comp) => comp.medication && comp.medication.trim() !== "")
    .map((comp) => {
      const timeSlot = comp.timeSlots?.[0];

      console.log(`🔍 Processing compartment ${comp.id}:`, {
        medication: comp.medication,
        timeSlot: timeSlot,
        hasStartTime: !!timeSlot?.startTime,
        intervalHours: timeSlot?.intervalHours,
      });

      if (!timeSlot) {
        console.log(`⚠️ No time slot configured for compartment ${comp.id}`);
        return null;
      }

      const quantity = extractQuantityFromDosage(comp.dosage);
      const id = (
        typeof comp.id === "string" ? parseInt(comp.id, 10) : comp.id
      ) as IdCapsyCase;

      if (timeSlot.startTime) {
        const intervalMs = timeSlot.intervalHours * 3600000;
        console.log(
          `⏰ Creating scheduled config for compartment ${comp.id}:`,
          {
            startTime: timeSlot.startTime,
            intervalHours: timeSlot.intervalHours,
            intervalMs: intervalMs,
            quantity: quantity,
          },
        );

        return {
          id,
          cantidad: quantity,
          type: "scheduled" as const,
          timeout: timeSlot.intervalHours * 3600000,
          startTime: timeSlot.startTime,
          intervalMs: intervalMs,
        };
      } else if (timeSlot.intervalHours) {
        console.log(`🔄 Creating interval config for compartment ${comp.id}:`, {
          intervalHours: timeSlot.intervalHours,
          quantity: quantity,
        });

        return {
          id,
          cantidad: quantity,
          type: "interval" as const,
          timeout: timeSlot.intervalHours * 3600000,
        };
      }

      console.log(`⚠️ No valid configuration for compartment ${comp.id}`);
      return null;
    })
    .filter((item) => item !== null);

  console.log(
    "💊 Final pastilla array for schedule:",
    JSON.stringify(pastillaArray, null, 2),
  );

  pastillaArray.forEach((value) => {
    if (!value?.id || !value?.type || !value?.cantidad) return;

    const handler = () => {
      const capsyDevice = clientsCapsy[pillboxId];
      if (!capsyDevice || capsyDevice.ws?.readyState !== WebSocket.OPEN) {
        console.log(
          `⚠️ Capsy ${pillboxId} not connected, sending notification to user only`,
        );

        const response: WebSocketResponse = {
          type: "notification",
          notification: {
            reason: "Capsy not connected",
            title: t("capsyNotConnectedTitle") || "Pastillero no conectado",
            body:
              t("capsyNotConnectedBody") ||
              "El pastillero no está conectado. Por favor revisa la conexión.",
            screen: "PillboxSettings",
            trigger: null,
          },
          timestamp: new Date().toISOString(),
        };
        userClient.ws?.send(JSON.stringify(response));
        return;
      }

      const userNotification: WebSocketResponse = {
        type: "notification",
        notification: {
          reason: "Medication Reminder",
          title: t("medicationReminderTitle") || "Recordatorio de medicación",
          body: `${t("medicationReminderBody")} - Pastillero ${pillboxId}`,
          screen: "Home",
          trigger: null,
        },
        timestamp: new Date().toISOString(),
      };
      userClient.ws?.send(JSON.stringify(userNotification));

      const capsyRequest: WebSocketResponse = {
        type: "capsy-alert",
        pastilla: { id: value.id, cantidad: value.cantidad },
        timestamp: new Date().toISOString(),
      };
      capsyDevice.ws?.send(JSON.stringify(capsyRequest));
    };

    let timerId: NodeJS.Timeout | number;
    let timerType: TimerType = value.type;

    switch (value.type) {
      case "interval":
        if (!value.timeout) return;
        timerId = setInterval(handler, value.timeout);
        break;

      case "scheduled": {
        if (!value.startTime || !value.intervalMs) return;

        console.log(
          `⏰ Setting up scheduled timer for compartment ${value.id}:`,
        );
        console.log(`   - Start time: ${value.startTime}`);
        console.log(
          `   - Interval: ${value.intervalMs}ms (${value.intervalMs / 3600000} hours)`,
        );
        console.log(
          `   - Current time: ${new Date().toLocaleTimeString("es-ES", { hour12: false, timeZone: "America/Mexico_City" })}`,
        );
        console.log(
          `   - Server time: ${new Date().toLocaleTimeString("es-ES", { hour12: false })} (server timezone)`,
        );
        console.log(
          `   - Timezone offset: ${new Date().getTimezoneOffset()} minutes from UTC`,
        );

        const timeUntilStart = getNextScheduledTime(
          value.startTime,
          value.intervalMs,
        );

        console.log(
          `⏰ Final scheduling result for compartment ${value.id}: ${timeUntilStart}ms (${Math.round(timeUntilStart / 60000)} minutes)`,
        );

        timerId = setTimeout(() => {
          console.log(
            `🔔 Executing scheduled reminder for compartment ${value.id} at ${new Date().toLocaleTimeString()}`,
          );
          handler();

          console.log(
            `🔄 Setting up repeating interval of ${value.intervalMs}ms for compartment ${value.id}`,
          );
          const intervalId = setInterval(handler, value.intervalMs || 0);
          const uniqueIntervalKey = `${pillboxId}_${value.id}_interval`;
          if (userClient.intervalCapsy) {
            userClient.intervalCapsy[uniqueIntervalKey] = {
              id: intervalId,
              type: "interval",
            };
          }
        }, timeUntilStart);
        timerType = "scheduled";
        break;
      }

      default:
        return;
    }

    const uniqueKey = `${pillboxId}_${value.id}`;
    if (userClient.intervalCapsy) {
      userClient.intervalCapsy[uniqueKey] = {
        id: timerId,
        type: timerType,
      };
    }
  });

  console.log(
    `✅ Schedule started for pillbox ${pillboxId} with ${pastillaArray.length} compartments`,
  );
};

const extractQuantityFromDosage = (dosage: string): number => {
  if (!dosage) return 1;
  const match = dosage.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

const handleSavePillboxConfig = async (
  clientId: string,
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
) => {
  if (parsedMessage.type !== "save-pillbox-config") return;

  console.log("💊 handleSavePillboxConfig called via WebSocket");

  try {
    const { userId, patientId, pillboxId, compartments } = parsedMessage;

    if (!userId || !patientId || !pillboxId) {
      const response: WebSocketResponse = {
        type: "pillbox-config-saved",
        success: false,
        error: {
          message: "Missing required fields: userId, patientId, or pillboxId",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(response));
      return;
    }

    if (!compartments || !Array.isArray(compartments)) {
      const response: WebSocketResponse = {
        type: "pillbox-config-saved",
        success: false,
        error: {
          message: "Invalid compartments data",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(response));
      return;
    }

    console.log("✅ Validation passed, saving to database...");
    const db = await getDatabase();

    const configWithTimestamp = {
      userId,
      patientId,
      pillboxId,
      compartments,
      lastUpdated: new Date(),
    };

    console.log("💾 Saving pillbox config:", configWithTimestamp);

    const result = await db
      .collection("pillboxConfigs")
      .replaceOne({ userId, patientId }, configWithTimestamp, { upsert: true });

    console.log("📊 Upsert result:", result.modifiedCount);

    if (!result.acknowledged) {
      const response: WebSocketResponse = {
        type: "pillbox-config-saved",
        success: false,
        error: {
          message: "Failed to save pillbox configuration",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(response));
      return;
    }

    console.log("✅ Pillbox config saved successfully via WebSocket");

    console.log("⏰ Starting automatic schedule for pillbox:", pillboxId);
    await startPillboxSchedule(clientId, pillboxId, compartments);

    const response: WebSocketResponse = {
      type: "pillbox-config-saved",
      success: true,
      config: configWithTimestamp,
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
  } catch (error) {
    console.error("❌ Error saving pillbox config via WebSocket:", error);
    const response: WebSocketResponse = {
      type: "pillbox-config-saved",
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
  }
};

const handleGetPillboxConfig = async (
  clientId: string,
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
) => {
  if (parsedMessage.type !== "get-pillbox-config") return;

  console.log("🔍 handleGetPillboxConfig called via WebSocket");

  try {
    const { userId, patientId } = parsedMessage;

    if (!userId || !patientId) {
      const response: WebSocketResponse = {
        type: "pillbox-config-loaded",
        error: {
          message: "Missing required fields: userId or patientId",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(response));
      return;
    }

    console.log("🔍 Searching for pillbox config...");
    const db = await getDatabase();

    const config = await db
      .collection("pillboxConfigs")
      .findOne({ userId, patientId });

    if (!config) {
      console.log(
        "❌ No pillbox config found for user:",
        userId,
        "patient:",
        patientId,
      );
      const response: WebSocketResponse = {
        type: "pillbox-config-loaded",
        error: {
          message: "No pillbox configuration found",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(response));
      return;
    }

    console.log("✅ Pillbox config found via WebSocket:", config);
    const response: WebSocketResponse = {
      type: "pillbox-config-loaded",
      config: config,
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
  } catch (error) {
    console.error("❌ Error retrieving pillbox config via WebSocket:", error);
    const response: WebSocketResponse = {
      type: "pillbox-config-loaded",
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
  }
};

const handleDeletePillboxConfig = async (
  clientId: string,
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
) => {
  if (parsedMessage.type !== "delete-pillbox-config") return;

  console.log("🗑️ handleDeletePillboxConfig called via WebSocket");

  try {
    const { userId, patientId } = parsedMessage;

    if (!userId || !patientId) {
      const response: WebSocketResponse = {
        type: "pillbox-config-deleted",
        success: false,
        error: {
          message: "Missing required fields: userId or patientId",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(response));
      return;
    }

    console.log("🗑️ Deleting pillbox config...");
    const db = await getDatabase();

    const result = await db
      .collection("pillboxConfigs")
      .deleteOne({ userId, patientId });

    if (result.deletedCount === 0) {
      console.log(
        "❌ No pillbox config found to delete for user:",
        userId,
        "patient:",
        patientId,
      );
      const response: WebSocketResponse = {
        type: "pillbox-config-deleted",
        success: false,
        error: {
          message: "No pillbox configuration found to delete",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(response));
      return;
    }

    console.log("✅ Pillbox config deleted successfully via WebSocket");
    const response: WebSocketResponse = {
      type: "pillbox-config-deleted",
      success: true,
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
  } catch (error) {
    console.error("❌ Error deleting pillbox config via WebSocket:", error);
    const response: WebSocketResponse = {
      type: "pillbox-config-deleted",
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(response));
  }
};

const handleMedicationTaken = (
  capsyId: string,
  ws: WebSocket,
  parsedMessage: WebSocketMessage,
) => {
  if (parsedMessage.type !== "medication-taken") return;

  const capsy = clientsCapsy[capsyId];
  if (!capsy || !capsy.userId) return;

  const userId = capsy.userId;
  const userClient = clients[userId];

  if (!userClient || !userClient.ws) return;

  const userConfig = userClient.userConfig;
  const translations = getTranslations(userConfig?.language || "en");
  const t = (key: keyof typeof translations) => translations[key];

  const confirmation: WebSocketResponse = {
    type: "notification",
    notification: {
      reason: "Medication Taken",
      title: t("medicationTakenTitle") || "Medicación tomada",
      body:
        t("medicationTakenBody") || "Has tomado tu medicación correctamente.",
      screen: "Home",
      trigger: null,
    },
    timestamp: new Date().toISOString(),
  };
  userClient.ws.send(JSON.stringify(confirmation));
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
    let isCapsyConnection = false;

    ws.on("message", async (buffer: Buffer) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(buffer.toString());
        console.log("Message from client:", parsedMessage);

        switch (parsedMessage.type) {
          case "init":
            clientId = handleInitWebSocket(ws, parsedMessage);
            if (parsedMessage.capsyId) {
              isCapsyConnection = true;
            }
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
          case "capsy-individual":
            if (!clientId || !parsedMessage.capsyId) break;
            handleCapsyIndividualConfig(
              clientId,
              parsedMessage.capsyId,
              ws,
              parsedMessage,
            );
            break;
          case "add-capsy":
            if (!clientId) break;
            handleAddCapsyWebSocket(clientId, ws, parsedMessage);
            break;
          case "capsy-pill-request":
            if (!clientId || !isCapsyConnection) break;
            handleCapsyPillRequest(clientId, ws, parsedMessage);
            break;
          case "medication-taken":
            if (!clientId || !isCapsyConnection) break;
            handleMedicationTaken(clientId, ws, parsedMessage);
            break;
          case "save-pillbox-config":
            if (!clientId) break;
            handleSavePillboxConfig(clientId, ws, parsedMessage);
            break;
          case "get-pillbox-config":
            if (!clientId) break;
            handleGetPillboxConfig(clientId, ws, parsedMessage);
            break;
          case "delete-pillbox-config":
            if (!clientId) break;
            handleDeletePillboxConfig(clientId, ws, parsedMessage);
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
