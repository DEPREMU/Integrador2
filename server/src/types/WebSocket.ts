import { WebSocket } from "ws";
import * as Notifications from "expo-notifications";
import { User, UserConfig } from "./Database.js";

export const reasonNotification = [
  "Initial Notification",
  "Medication Reminder",
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
  | "Chatbot";

export type TestsAvailable = "notification" | "ping" | "waitForCapsy";

export type WebSocketMessage =
  | { type: "init"; userId?: string }
  | { type: "ping" }
  | {
      type: "test";
      testing: TestsAvailable;
      data: Record<
        string,
        { id: string; type: "interval" | "timeout"; timeout: number }
      >;
    }
  | {
      type: "capsy";
      settings: null; //! This is a placeholder, adjust as needed
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
    };

export type UserWebSocket = {
  ws: WebSocket | null;
  wsCapsy: WebSocket | null;
  intervalCapsy?: Record<
    string,
    { id: NodeJS.Timeout | number | null; type: "interval" | "timeout" }
  >;
  user: User;
  userConfig: UserConfig | null;
};
