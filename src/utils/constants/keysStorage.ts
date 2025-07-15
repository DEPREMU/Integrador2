export const KEYS_STORAGE = {
  TEST1: "_test1",
  TEST2: "@test2",
  SESSION_EXPIRY: "_sessionExpiry",
  USER_SESSION_STORAGE: "_userSessionStorage",
  LANGUAGE_KEY_STORAGE: "@languageKeyStorage",
  NOTIFICATIONS_STORAGE: "@notificationsStorage",
} as const;

export type KeyStorageKeys = keyof typeof KEYS_STORAGE;

export type KeyStorageValues = (typeof KEYS_STORAGE)[keyof typeof KEYS_STORAGE];
