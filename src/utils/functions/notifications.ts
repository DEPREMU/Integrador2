import { Notifications } from "@types";
import { log, logError } from "./debug";
import * as notifications from "expo-notifications";
import { ScreensAvailable } from "@/navigation/navigationTypes";
import { loadData, saveData } from "./storageManagement";
import { ReasonNotification } from "../constants/notifications";
import { KEYS_STORAGE, reasonNotification } from "../constants";

/**
 * Checks if the application has permission to send push notifications.
 *
 * This function first checks the current notification permission status.
 * If permission is not granted, it requests permission from the user.
 * Returns `true` if permission is granted, otherwise `false`.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if push notification permission is granted, otherwise `false`.
 */
export const hasPushNotifications = async (): Promise<boolean> => {
  const { status } = await notifications.getPermissionsAsync();
  if (status === notifications.PermissionStatus.GRANTED) return true;

  const { status: newStatus } = await notifications.requestPermissionsAsync();
  return newStatus === notifications.PermissionStatus.GRANTED;
};

/**
 * Cancels a notification based on the reason provided.
 *
 * This function loads existing notifications from storage, checks if a notification
 * with the specified reason exists, and cancels it if found.
 *
 * @param {Notifications} notificationsData - The current notifications data.
 * @param {string} reason - The reason for the notification to be canceled.
 */
export const handleCancelNotification = async (
  notificationsData: Notifications,
  reason: ReasonNotification,
  saveNewNotifications = false,
) => {
  const idNotification = notificationsData[reason]?.id;
  if (!idNotification) return;
  try {
    await notifications.cancelScheduledNotificationAsync(idNotification);
    if (saveNewNotifications) {
      notificationsData[reason] = null;
      await saveData(
        KEYS_STORAGE.NOTIFICATIONS_STORAGE,
        JSON.stringify(notificationsData),
      );
    }
    log(`Notification with reason "${reason}" canceled successfully.`);
  } catch (error) {
    logError(`Error canceling notification with reason "${reason}":`, error);
  }
};

export const sendNotification = async (
  reason: ReasonNotification,
  title: string,
  body: string | null,
  trigger: notifications.NotificationTriggerInput | null = null,
  screen: ScreensAvailable = "Home",
  data?: Record<string, unknown>,
): Promise<void> => {
  try {
    const notificationsData = await loadData<Notifications>(
      KEYS_STORAGE.NOTIFICATIONS_STORAGE,
      (value) => (value ? value : ({} as Notifications)),
    );

    const lenNotificationsSaved = Object.keys(notificationsData).length;

    if (
      lenNotificationsSaved === 0 ||
      lenNotificationsSaved !== reasonNotification.length
    ) {
      log(
        "No saved notifications found, initializing empty notifications data.",
      );
      reasonNotification.forEach((reason) => {
        if (!notificationsData[reason]) notificationsData[reason] = null;
      });
      await saveData(
        KEYS_STORAGE.NOTIFICATIONS_STORAGE,
        JSON.stringify(notificationsData),
      );
    }

    await handleCancelNotification(notificationsData, reason);

    const id = await notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          ...data,
          screen,
        },
      },
      trigger,
    });

    notificationsData[reason] = {
      id,
      body,
      data,
      title,
      screen,
      trigger,
    };

    await saveData(
      KEYS_STORAGE.NOTIFICATIONS_STORAGE,
      JSON.stringify(notificationsData),
    );
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export interface NotificationData {
  screen?: ScreensAvailable;
  [key: string]: unknown;
}

/**
 * Sets up notification handlers for when notifications are received and tapped
 */
export const setupNotificationHandlers = (
  navigateToScreen: (screen: ScreensAvailable) => void,
) => {
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowList: true,
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const notificationListener =
    notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content
        .data as NotificationData;

      if (!data?.screen) return;

      navigateToScreen(data.screen);
    });

  const foregroundListener = notifications.addNotificationReceivedListener(
    (notification) => {
      console.log(
        "Notification received in foreground:",
        notification.request.content,
      );
    },
  );

  return () => {
    foregroundListener.remove();
    notificationListener.remove();
  };
};
