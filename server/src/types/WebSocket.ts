import { WebSocket } from "ws";
import * as Notifications from "expo-notifications";
import { User, UserConfig } from "./Database";

export type ScreensAvailable =
  | "Login"
  | "SignUp"
  | "Home"
  | "Dashboard"
  | "Patient"
  | "HowToCode"
  | "Schedule";

export type WebSocketMessage = { type: "init"; userId?: string };

export type Notification = {
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
    };

export type UserWebSocket = {
  ws: WebSocket | null;
  user: User;
  userConfig: UserConfig | null;
};
