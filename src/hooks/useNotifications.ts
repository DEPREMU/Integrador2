// useNotifications.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

//! DEMO
export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(setExpoPushToken);

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data;
        console.log("📩 Payload recibido:", data);
      },
    );

    return () => subscription?.remove?.();
  }, []);

  return { expoPushToken };
};

const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log(
      "❌ Las notificaciones solo funcionan en un dispositivo físico",
    );
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("❌ Permiso de notificaciones no concedido");
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("✅ Token Expo:", token);
  return token;
};
