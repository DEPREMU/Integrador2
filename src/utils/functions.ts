import {
  RequestEncrypt,
  RequestDecrypt,
  ResponseEncrypt,
  ResponseDecrypt,
} from "../../server/src/TypesAPI";
import {
  languages,
  LanguagesSupported,
  languagesSupported,
} from "./translates";
import { API_URL } from "./constants/constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";
import { KEYS_STORAGE, KeyStorageValues } from "./constants/keysStorage";

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
 * Generates an options object for a fetch request.
 *
 * @param method - The HTTP method to use for the request. Can be either "POST" or "GET".
 * @param body - An optional request body, which can be of type `RequestEncrypt` or `RequestDecrypt`.
 *               If provided, it will be stringified and included in the request.
 * @returns An object containing the HTTP method, headers, and optionally the stringified body.
 */
export const fetchOptions = (
  method: "POST" | "GET",
  body?: RequestEncrypt | RequestDecrypt
) => ({
  method,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: body ? JSON.stringify(body) : undefined,
});

/**
 * Constructs a full API route URL by appending the given route to the base API URL.
 *
 * @param route - The specific route to append to the base API URL.
 * @returns The full API route URL as a string.
 *
 * @remarks
 * This function is useful for constructing API endpoints dynamically.
 * For example, if the base API URL is "https://example.com/api/v1"
 * and the route is "users", the resulting URL will be:
 * "https://example.com/api/v1/users".
 *
 * @example
 * ```typescript
 * const userRoute = getRouteAPI("users");
 * console.log(userRoute); // Outputs: "https://example.com/api/v1/users"
 * ```
 */
export const getRouteAPI = (route: string): string => `${API_URL}/${route}`;

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
 * Asynchronously saves data to storage, with support for both web and native platforms.
 * On web, it uses `localStorage`, and on native platforms, it uses `AsyncStorage`.
 *
 * @param key - The key under which the value will be stored. Must be a valid `KeyStorageValues`.
 * @param value - The value to be stored. If the value is not a string, it will be serialized to JSON.
 * @returns A promise that resolves when the data has been successfully saved.
 */
export const saveData = async (
  key: KeyStorageValues,
  value: any
): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    );
    return;
  }
  await AsyncStorage.setItem(key, value);
};

/**
 * Saves data securely in storage. Depending on the platform, it either uses
 * SecureStore for non-web platforms or encrypts the data and stores it in
 * localStorage for web platforms.
 *
 * @param key - The key under which the data will be stored. Must be a valid `KeyStorageValues`.
 * @param value - The data to be stored. Can be of any type. Non-string values will be stringified.
 * @returns A promise that resolves when the data is successfully stored.
 *
 * @throws Logs an error to the console if an issue occurs during the storage process.
 *
 * Platform-specific behavior:
 * - **Non-web platforms**: Uses `SecureStore.setItemAsync` to store the data securely.
 * - **Web platforms**: Sends the data to an encryption API endpoint, retrieves the encrypted data,
 *   and stores it in `localStorage`.
 *
 * Notes:
 * - If the encryption API returns an error or no encrypted data, the function logs the error and exits.
 */
export const saveDataSecure = async (key: KeyStorageValues, value: any) => {
  try {
    const newValue = typeof value === "string" ? value : JSON.stringify(value);

    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync(key, newValue);
      return;
    }

    const dataEncrypted: ResponseEncrypt = await fetch(
      getRouteAPI("encrypt"),
      fetchOptions("POST", {
        dataToEncrypt: newValue,
      })
    ).then((response) => response.json());

    if (dataEncrypted.error) {
      console.error(
        `./globalVariables/saveDataSecure() => ${dataEncrypted.error.message} - ${dataEncrypted.error.timestamp}`
      );
      return;
    }
    if (!dataEncrypted.dataEncrypted) return;

    localStorage.setItem(key, dataEncrypted.dataEncrypted);
  } catch (error) {
    console.error(`./globalVariables/saveDataSecure() => ${error}`);
  }
};

/**
 * Removes a stored data item associated with the specified key.
 *
 * This function handles data removal differently depending on the platform:
 * - On web platforms, it uses `localStorage.removeItem`.
 * - On non-web platforms, it uses `AsyncStorage.removeItem`.
 *
 * @param key - The key associated with the data to be removed. Must be of type `KeyStorageValues`.
 * @returns A promise that resolves when the data has been removed (for non-web platforms).
 */
export const removeData = async (key: KeyStorageValues) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  await AsyncStorage.removeItem(key);
};

/**
 * Removes a stored data item securely based on the provided key.
 *
 * This function handles both web and non-web platforms. On web platforms,
 * it uses `localStorage` to remove the item. On non-web platforms, it uses
 * `SecureStore.deleteItemAsync` to securely delete the item.
 *
 * @param key - The key of the storage item to be removed. Must be of type `KeyStorageValues`.
 *
 * @throws Will log an error to the console if the removal process fails.
 */
export const removeDataSecure = async (key: KeyStorageValues) => {
  try {
    if (Platform.OS === "web") localStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`./globalVariables/removeDataSecure() => ${error}`);
  }
};

/**
 * Asynchronously loads data associated with the given key from storage.
 *
 * On web platforms, it retrieves the value from `localStorage`. On other platforms,
 * it uses `AsyncStorage` to fetch the value.
 *
 * @param key - The key used to retrieve the stored value. Must be of type `KeyStorageValues`.
 * @returns A promise that resolves to the stored value as a string, or `null` if no value is found.
 */
export const loadData = async (key: KeyStorageValues) => {
  if (Platform.OS === "web") return localStorage.getItem(key);
  const value = await AsyncStorage.getItem(key);
  return value;
};

/**
 * Asynchronously loads secure data associated with the given key.
 *
 * This function retrieves data securely depending on the platform:
 * - On non-web platforms, it uses `SecureStore.getItemAsync` to fetch the data.
 * - On web platforms, it retrieves the data from `localStorage` and decrypts it
 *   using a backend API.
 *
 * @param key - The key associated with the data to retrieve. Must be a valid `KeyStorageValues`.
 * @returns A promise that resolves to the decrypted data as a string, or `null` if:
 * - The data is not found.
 * - An error occurs during decryption.
 * - The decrypted data is empty or invalid.
 *
 * @throws Will log an error to the console if the decryption API returns an error.
 */
export const loadDataSecure = async (key: KeyStorageValues) => {
  if (Platform.OS !== "web") return await SecureStore.getItemAsync(key);

  const value = localStorage.getItem(key);

  if (!value) return null;
  const decryptedValue = await fetch(
    getRouteAPI("decrypt"),
    fetchOptions("POST", { dataToDecrypt: value })
  ).then((response) => response.json() as ResponseDecrypt);
  if (decryptedValue.error) {
    console.error(
      `./globalVariables/loadDataSecure() => ${decryptedValue.error.message} - ${decryptedValue.error.timestamp}`
    );
    return null;
  }
  if (!decryptedValue.dataDecrypted) return null;

  return decryptedValue.dataDecrypted;
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
    const data = await loadData(KEYS_STORAGE.LANGUAGE_KEY_STORAGE);
    if (data) return data as LanguagesSupported;

    const locales = Localization.getLocales()[0];
    const language = locales.languageTag.split("-")[0];
    const languageAvailable = languagesSupported.includes(
      language as keyof typeof languages
    );
    if (language && languageAvailable) {
      await saveData(KEYS_STORAGE.LANGUAGE_KEY_STORAGE, language);
      return language as LanguagesSupported;
    }
  } catch (error) {
    console.error(`./globalVariables/checkLanguage() => ${error}`);
  }
  return "en";
};
