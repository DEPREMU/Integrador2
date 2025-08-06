import { WebSocket } from "ws";
import * as Notifications from "expo-notifications";
import { User, UserConfig } from "./Database.js";

export const reasonNotification = [
  "Initial Notification",
  "Medication Reminder",
  "Medication Missed",
  "Medication Taken",
  "Capsy not connected",
] as const;

export type ReasonNotification = (typeof reasonNotification)[number];

export type ScreensAvailable =
  | "Login"
  | "SignUp"
  | "Home"
  | "Dashboard"
  | "Patient"
  | "HowToCode"
  | "Schedule"
  | "Settings"
  | "PillboxSettings"
  | "Chatbot";

export type TestsAvailable = "notification" | "ping" | "waitForCapsy";

export type IdCapsyCase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type CapsySettings = {
  id: IdCapsyCase; // Each number corresponds to a specific case
  cantidad: number; // Number of pills
  type: "interval" | "timeout" | "scheduled"; // Type of timing
  timeout: number; // Timeout or interval duration in milliseconds
  startTime?: string; // Hora específica de inicio (formato "HH:MM")
  intervalMs?: number; // Intervalo en millisegundos para repetir después del startTime
};

export type WebSocketMessage =
  | { type: "init"; userId?: string; capsyId?: string }
  | { type: "ping" }
  | {
      type: "test";
      testing: TestsAvailable;
      data: Record<
        string,
        { id: IdCapsyCase; type: "interval" | "timeout"; timeout: number }
      >;
    }
  | {
      type: "capsy";
      pastilla: CapsySettings[];
    }
  | {
      type: "capsy-individual";
      capsyId: string;
      pastilla: CapsySettings[];
    }
  | {
      type: "add-capsy";
      capsyId: string;
    }
  | {
      type: "medication-taken";
      timestamp: string;
    }
  | {
      type: "capsy-pill-request";
      pastilla: { id: number; cantidad: number }[];
    }
  | {
      type: "save-pillbox-config";
      userId: string;
      patientId: string;
      pillboxId: string;
      compartments: any[];
    }
  | {
      type: "get-pillbox-config";
      userId: string;
      patientId: string;
    }
  | {
      type: "delete-pillbox-config";
      userId: string;
      patientId: string;
    };

export type Notification = {
  reason: ReasonNotification;
  title: string;
  body: string;
  screen: ScreensAvailable;
  data?: Record<string, unknown>;
  trigger?: Notifications.NotificationTriggerInput | null;
};

export type WebSocketResponse =
  | {
      type: "not-user-id";
      message: string;
      timestamp: string;
    }
  | {
      type: "notification";
      notification: Notification;
      timestamp: string;
    }
  | {
      type: "error";
      message: string;
      timestamp: string;
    }
  | {
      type: "init-success";
      message: string;
      timestamp: string;
    }
  | {
      type: "pong";
      timestamp: string;
    }
  | {
      type: "error-capsy";
      message: string;
      timestamp: string;
    }
  | {
      type: "capsy";
      message: string;
      timestamp: string;
    }
  | {
      type: "capsy-alert";
      pastilla: { id: number; cantidad: number };
      timestamp: string;
    }
  | {
      type: "pillbox-config-saved";
      success: boolean;
      config?: any;
      error?: { message: string; timestamp: string };
      timestamp: string;
    }
  | {
      type: "pillbox-config-loaded";
      config?: any;
      error?: { message: string; timestamp: string };
      timestamp: string;
    }
  | {
      type: "pillbox-config-deleted";
      success: boolean;
      error?: { message: string; timestamp: string };
      timestamp: string;
    };

export type TimerType = "interval" | "timeout" | "scheduled";

export type CapsyWebSocket = {
  ws: WebSocket | null;
  id: string;
  userId?: string;
};

export type UserWebSocket = {
  ws: WebSocket | null;
  wsCapsy?: Record<string, CapsyWebSocket>;
  intervalCapsy?: Record<
    string,
    { id: NodeJS.Timeout | number | null; type: TimerType }
  >;
  user: User;
  userConfig: UserConfig | null;
};
