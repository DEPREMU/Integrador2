import { Notifications } from "@types";
import { log, logError } from "./debug";
import { stringifyData } from "./appManagement";
import * as notifications from "expo-notifications";
import { ScreensAvailable } from "@navigation/navigationTypes";
import { loadData, loadDataSecure, saveData } from "./storageManagement";
import { ReasonNotification } from "../constants/notifications";
import { KEYS_STORAGE, reasonNotification } from "../constants";

/**
 * Initializes the notifications storage with default values.
 * This function ensures that the notifications storage is set up correctly
 * before any notifications are scheduled or managed.
 */
export const initializeNotificationsStorage = async () => {
  const [hasNotifications, notificationsData] = await Promise.all([
    loadData<boolean | null>(KEYS_STORAGE.NOTIFICATIONS_ENABLED),
    loadData<Notifications>(
      KEYS_STORAGE.NOTIFICATIONS_STORAGE,
      (n) => n ?? ({} as Notifications),
    ),
  ]);
  if (hasNotifications === null) {
    const { status } = await notifications.getPermissionsAsync();
    if (status !== notifications.PermissionStatus.GRANTED) {
      await notifications.requestPermissionsAsync();
    }
    const { status: newStatus } = await notifications.getPermissionsAsync();
    if (newStatus !== notifications.PermissionStatus.GRANTED) {
      await saveData(KEYS_STORAGE.NOTIFICATIONS_ENABLED, false);
      return;
    }
    await saveData(KEYS_STORAGE.NOTIFICATIONS_ENABLED, true);
  }

  const lenNotificationsSaved = Object.keys(notificationsData).length;
  if (lenNotificationsSaved === reasonNotification.length) return;

  reasonNotification.forEach((reason) => {
    notificationsData[reason] = null;
  });

  await saveData(
    KEYS_STORAGE.NOTIFICATIONS_STORAGE,
    stringifyData(notificationsData),
  );
};

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
  const [notificationsEnabled, notificationsData] = await Promise.all([
    loadData<boolean>(KEYS_STORAGE.NOTIFICATIONS_ENABLED, (n) =>
      n === null ? false : n,
    ),
    loadData<Notifications | null>(KEYS_STORAGE.NOTIFICATIONS_STORAGE),
  ]);
  if (notificationsData === null) await initializeNotificationsStorage();

  if (status === notifications.PermissionStatus.GRANTED)
    return notificationsEnabled;

  const { status: newStatus } = await notifications.requestPermissionsAsync();
  if (newStatus !== notifications.PermissionStatus.GRANTED) return false;

  return notificationsEnabled;
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
        stringifyData(notificationsData),
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
    const [notificationsEnabled, sessionExpiry] = await Promise.all([
      hasPushNotifications(),
      loadDataSecure<number | null>(KEYS_STORAGE.SESSION_EXPIRY),
    ]);
    if (!notificationsEnabled || sessionExpiry === null) return;

    const notificationsData = await loadData<Notifications>(
      KEYS_STORAGE.NOTIFICATIONS_STORAGE,
    );

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
