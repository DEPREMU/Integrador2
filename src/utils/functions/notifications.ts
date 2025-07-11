import { ScreensAvailable } from "@/navigation/navigationTypes";
import * as Notifications from "expo-notifications";

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
  const { status } = await Notifications.getPermissionsAsync();
  if (status === Notifications.PermissionStatus.GRANTED) return true;

  const { status: newStatus } = await Notifications.requestPermissionsAsync();
  return newStatus === Notifications.PermissionStatus.GRANTED;
};

export const sendNotification = async (
  title: string,
  body: string | null,
  trigger: Notifications.NotificationTriggerInput | null = null,
  screen: ScreensAvailable = "Home",
  data?: Record<string, unknown>,
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
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
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowList: true,
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Handle notification taps when app is in foreground/background
  const notificationListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content
        .data as NotificationData;

      if (data?.screen) {
        console.log(`Navigating to screen: ${data.screen}`);
        navigateToScreen(data.screen);
      }
    });

  // Handle notifications received while app is in foreground
  const foregroundListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received in foreground:", notification);
      // Optionally handle foreground notifications differently
    },
  );

  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(foregroundListener);
  };
};
