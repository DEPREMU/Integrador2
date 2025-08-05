export const reasonNotification = [
  "Initial Notification",
  "Medication Reminder",
  "Medication Missed",
  "Medication Taken",
  "Capsy not connected",
] as const;

export type ReasonNotification = (typeof reasonNotification)[number];
