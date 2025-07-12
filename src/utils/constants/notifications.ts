export const reasonNotification = [
  "Initial Notification",
  "Medication Reminder",
] as const;

export type ReasonNotification = (typeof reasonNotification)[number];
