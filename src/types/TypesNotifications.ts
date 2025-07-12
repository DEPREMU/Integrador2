import * as notifications from "expo-notifications";
import { ScreensAvailable } from "@typesAPI";
import { ReasonNotification } from "@utils";

export type Notification = {
  id: string;
  body: string | null;
  title: string;
  data?: Record<string, unknown>;
  screen: ScreensAvailable;
  trigger: notifications.NotificationTriggerInput | null;
};

export type Notifications = Record<ReasonNotification, Notification | null>;
