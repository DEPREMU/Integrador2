import {
  languages,
  LanguagesSupported,
  languagesSupported,
} from "./translates";
import CryptoJS from "crypto-js";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";
import { LANGUAGE_KEY_STORAGE } from "./constants/keysStorage";

/**
 * Validates whether a given string is a properly formatted email address.
 *
 * @param email - The email address to validate.
 * @returns `true` if the email address is valid, otherwise `false`.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a given password meets the required criteria.
 *
 * The password must:
 * - Be at least 8 characters long.
 * - Contain at least one letter (uppercase or lowercase).
 * - Contain at least one numeric digit.
 *
 * @param password - The password string to validate.
 * @returns `true` if the password is valid, otherwise `false`.
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Retrieves the file name of the caller function from the stack trace.
 *
 * @returns The file name as a string if it can be determined, otherwise "unknown".
 *
 * @remarks
 * This function uses the `Error` stack trace to extract the file name of the caller.
 * It parses the stack trace and attempts to match the file name using a regular expression.
 * Note that the accuracy of this function depends on the structure of the stack trace,
 * which may vary between environments (e.g., browsers, Node.js).
 *
 * @example
 * ```typescript
 * const fileName = getFileName();
 * console.log(fileName); // Outputs the file name of the caller or "unknown".
 * ```
 */
export const getFileName = (): string => {
  const stack = new Error().stack;
  if (stack) {
    const fileName = stack.split("\n")[2].trim();
    const fileNameMatch = fileName.match(/at (.+):\d+:\d+/);
    if (fileNameMatch) {
      return fileNameMatch[1];
    }
  }
  return "unknown";
};

/**
 * Retrieves the line number of the code that called this function.
 *
 * This function uses the stack trace of a newly created `Error` object
 * to determine the line number of the caller. If the stack trace is not
 * available or the line number cannot be determined, it returns `-1`.
 *
 * @returns The line number of the caller, or `-1` if it cannot be determined.
 */
export const getLineNumber = (): number => {
  const stack = new Error().stack;
  if (stack) {
    const lineNumber = stack.split("\n")[2].trim();
    const lineNumberMatch = lineNumber.match(/:(\d+):/);
    if (lineNumberMatch) {
      return parseInt(lineNumberMatch[1], 10);
    }
  }
  return -1;
};

/**
 * Asynchronously saves data to local storage using AsyncStorage.
 *
 * @param key - The key under which the value will be stored.
 * @param value - The value to be stored. Can be of any type.
 *
 * @remarks
 * - This function uses `AsyncStorage` from `@react-native-async-storage/async-storage`.
 * - It is recommended to use this function for storing simple key-value pairs.
 */
export const saveData = async (key: string, value: any) =>
  await AsyncStorage.setItem(key, value);

/**
 * Asynchronously saves data securely using platform-specific storage mechanisms.
 *
 * On web platforms, the data is encrypted using AES encryption and stored in `localStorage`.
 * On other platforms, the data is stored using `SecureStore`.
 *
 * @param key - The key under which the value will be stored.
 * @param value - The value to be stored. Can be of any type.
 *
 * @remarks
 * - Requires `expo-constants` to access `expoConfig` and its `extra` properties.
 * - On web platforms, the encryption key is retrieved from `Constants.expoConfig.extra.SECRET_KEY_TO_ENCRYPT`.
 * - On non-web platforms, the `SecureStore` API is used for secure storage.
 *
 * @throws Will log an error to the console if an exception occurs during the save operation.
 */
export const saveDataSecure = async (key: string, value: any) => {
  try {
    if (Constants.expoConfig == null) return;
    if (Constants.expoConfig.extra == undefined) return;

    if (Platform.OS === "web") {
      const secretKey = Constants.expoConfig.extra.SECRET_KEY_TO_ENCRYPT;
      const encryptedValue = CryptoJS.AES.encrypt(value, secretKey);
      localStorage.setItem(key, encryptedValue.toString());
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`./globalVariables/saveDataSecure() => ${error}`);
  }
};

/**
 * Asynchronously removes data from local storage using AsyncStorage.
 *
 * @param key - The key of the value to be removed.
 *
 * @remarks
 * - This function uses `AsyncStorage` from `@react-native-async-storage/async-storage`.
 * - It is recommended to use this function for removing simple key-value pairs.
 */
export const removeData = async (key: string) =>
  await AsyncStorage.removeItem(key);

/**
 * Asynchronously removes data securely using platform-specific storage mechanisms.
 *
 * On web platforms, the data is removed from `localStorage`.
 * On other platforms, the data is removed using `SecureStore`.
 * @param key - The key of the value to be removed.
 * @remarks
 * - Requires `expo-constants` to access `expoConfig` and its `extra` properties.
 * - On web platforms, the encryption key is retrieved from `Constants.expoConfig.extra.SECRET_KEY_TO_ENCRYPT`.
 * - On non-web platforms, the `SecureStore` API is used for secure storage.
 * @throws Will log an error to the console if an exception occurs during the save operation.
 */
export const removeDataSecure = async (key: string) => {
  try {
    if (Platform.OS == "web") localStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`./globalVariables/removeDataSecure() => ${error}`);
  }
};

/**
 * Asynchronously loads data from local storage using AsyncStorage.
 *
 * @param key - The key of the value to be loaded.
 * @returns The value associated with the specified key, or `null` if not found.
 *
 * @remarks
 * - This function uses `AsyncStorage` from `@react-native-async-storage/async-storage`.
 * - It is recommended to use this function for loading simple key-value pairs.
 */
export const loadData = async (key: string) => await AsyncStorage.getItem(key);

/**
 * Asynchronously loads data securely using platform-specific storage mechanisms.
 *
 * On web platforms, the data is decrypted using AES encryption and retrieved from `localStorage`.
 * On other platforms, the data is retrieved using `SecureStore`.
 *
 * @param key - The key of the value to be loaded.
 * @returns The decrypted value associated with the specified key, or `null` if not found.
 *
 * @remarks
 * - Requires `expo-constants` to access `expoConfig` and its `extra` properties.
 * - On web platforms, the encryption key is retrieved from `Constants.expoConfig.extra.SECRET_KEY_TO_ENCRYPT`.
 * - On non-web platforms, the `SecureStore` API is used for secure storage.
 */
export const loadDataSecure = async (key: string) => {
  if (Platform.OS != "web") return await SecureStore.getItemAsync(key);

  const value = localStorage.getItem(key);
  if (!value) return null;
  const uncryptedValue = CryptoJS.AES.decrypt(
    value,
    Constants.expoConfig?.extra?.SECRET_KEY_TO_ENCRYPT
  ).toString(CryptoJS.enc.Utf8);
  return uncryptedValue;
};

/**
 * Checks the user's language preference and saves it if not already set.
 *
 * @returns The user's preferred language, or "en" if not found.
 *
 * @remarks
 * - This function uses `expo-localization` to get the device's locale.
 * - It checks if the language is supported and saves it to local storage.
 * - If no language is found, it defaults to "en".
 */
export const checkLanguage = async (): Promise<LanguagesSupported> => {
  try {
    const data = await loadData(LANGUAGE_KEY_STORAGE);
    if (data) return data as LanguagesSupported;

    const locales = Localization.getLocales()[0];
    const language = locales.languageTag.split("-")[0];
    const languageAvailable = languagesSupported.includes(
      language as keyof typeof languages
    );
    if (language && languageAvailable) {
      await saveData(LANGUAGE_KEY_STORAGE, language);
      return language as LanguagesSupported;
    }
  } catch (error) {
    console.error(`./globalVariables/checkLanguage() => ${error}`);
  }
  return "en";
};
