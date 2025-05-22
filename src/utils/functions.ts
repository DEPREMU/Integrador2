import {
  RequestLogs,
  RequestEncrypt,
  RequestDecrypt,
  ResponseEncrypt,
  ResponseDecrypt,
} from "../../server/src/TypesAPI";
import { API_URL } from "./constants/API_URL";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import * as Localization from "expo-localization";
import { KEYS_STORAGE, KeyStorageValues } from "./constants/keysStorage";
import { LanguagesSupported, languagesSupported } from "./translates";

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
  body?: RequestEncrypt | RequestDecrypt | RequestLogs
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
 * log(userRoute); // Outputs: "https://example.com/api/v1/users"
 * ```
 */
export const getRouteAPI = (route: string): string => `${API_URL}/${route}`;

/**
 * Constructs a full image route URL by appending the given filename to the base API URL.
 *
 * @param filename - The name of the image file to append to the base API URL.
 * @returns The full image route URL as a string.
 *
 * @remarks
 * This function is useful for constructing image URLs dynamically.
 * For example, if the base API URL is "https://example.com/api/v1"
 * and the filename is "/images/photo.jpg", the resulting URL will be:
 * "https://example.com/images/photo.jpg".
 *
 * @example
 * ```typescript
 * const imageRoute = getRouteImage("/images/photo.jpg");
 * log(imageRoute); // Outputs: "https://example.com/images/photo.jpg"
 * ```
 */
export const getRouteImage = (filename: string): string =>
  `${API_URL.replace("/api/v1", "")}${filename}`;

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
 * log(fileName); // Outputs the file name of the caller or "unknown".
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
 * Securely stores a value under a specified key.
 *
 * - On **native platforms**, it uses `SecureStore`.
 * - On **web**, it encrypts the data using an API and stores it in `localStorage`.
 *
 * @param key - The storage key. Must be a valid `KeyStorageValues`.
 * @param value - The value to store. Will be stringified if not a string.
 * @param callback - Optional callback executed after the operation, receives an error if failed.
 */
export const saveDataSecure = async (
  key: KeyStorageValues,
  value: any,
  callback?: (err?: Error) => any
): Promise<void> => {
  try {
    const stringifiedValue =
      typeof value === "string" ? value : JSON.stringify(value);

    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync(key, stringifiedValue);
      return callback?.();
    }

    const response = await fetch(
      getRouteAPI("encrypt"),
      fetchOptions("POST", {
        dataToEncrypt: stringifiedValue,
      } satisfies RequestEncrypt)
    );
    const result = (await response.json()) as ResponseEncrypt;

    if (result.error || !result.dataEncrypted) {
      const message =
        result.error?.message || "No encrypted data returned from API";
      logError(
        `saveDataSecure() => ${message} - ${result.error?.timestamp || ""}`
      );
      return callback?.(new Error(message));
    }

    localStorage.setItem(key, result.dataEncrypted);
    return callback?.();
  } catch (error) {
    logError(`saveDataSecure() => ${error}`);
    return callback?.(
      new Error(error instanceof Error ? error.message : String(error))
    );
  }
};

/**
 * Loads secure data stored under a given key.
 *
 * - On **native platforms**, it retrieves the value via `SecureStore`.
 * - On **web**, it decrypts the value stored in `localStorage` using an API.
 *
 * @param key - The key to retrieve. Must be a valid `KeyStorageValues`.
 * @returns The decrypted string or `null` if not found or decryption fails.
 */
export const loadDataSecure = async (
  key: KeyStorageValues,
  callback?: (value: string | null, err?: Error) => any
): Promise<string | null> => {
  if (Platform.OS !== "web") {
    const value = await SecureStore.getItemAsync(key);
    if (callback) return callback(value);
    return await SecureStore.getItemAsync(key);
  }
  const storedValue = localStorage.getItem(key);
  if (!storedValue) return callback?.(null, new Error("No value found"));

  try {
    const response = await fetch(
      getRouteAPI("decrypt"),
      fetchOptions("POST", {
        dataToDecrypt: storedValue,
      } satisfies RequestDecrypt)
    );
    const result = (await response.json()) as ResponseDecrypt;

    if (result.error || !result.dataDecrypted) {
      logError(
        `loadDataSecure() => ${result.error?.message} - ${result.error?.timestamp}`
      );
      return callback?.(
        null,
        new Error(result.error?.message || "Decryption failed")
      );
    }

    return result.dataDecrypted;
  } catch (error) {
    logError(`loadDataSecure() => ${error}`);
    return callback?.(
      null,
      new Error(error instanceof Error ? error.message : String(error))
    );
  }
};

/**
 * Removes securely stored data under the given key.
 *
 * - On **native platforms**, uses `SecureStore.deleteItemAsync`.
 * - On **web**, removes from `localStorage`.
 *
 * @param key - The key of the data to remove.
 * @param callback - Optional callback executed after the operation, receives an error if failed.
 */
export const removeDataSecure = async (
  key: KeyStorageValues,
  callback?: (err?: Error) => any
): Promise<void> => {
  try {
    if (Platform.OS === "web") localStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  } catch (error) {
    logError(`removeDataSecure() => ${error}`);
    return callback?.(
      new Error(error instanceof Error ? error.message : String(error))
    );
  }

  return callback?.();
};

/**
 * Stores data under a specified key.
 *
 * - On **web**, uses `localStorage`.
 * - On **native**, uses `AsyncStorage`.
 *
 * @param key - The key to store the value under.
 * @param value - The value to store. Non-string values will be stringified.
 */
export const saveData = async (
  key: KeyStorageValues,
  value: any,
  callback?: () => any
): Promise<void> => {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);

  if (Platform.OS === "web") localStorage.setItem(key, stringValue);
  else await AsyncStorage.setItem(key, stringValue);
  return callback?.();
};

/**
 * Loads data associated with a given key.
 *
 * - On **web**, reads from `localStorage`.
 * - On **native**, uses `AsyncStorage`.
 *
 * @param key - The key to retrieve the value from.
 * @returns The stored value as a string, or `null` if not found.
 */
export const loadData = async (
  key: KeyStorageValues,
  callback?: (value: string | null) => any
): Promise<string | null> => {
  if (Platform.OS === "web") return callback?.(localStorage.getItem(key));
  return callback?.(await AsyncStorage.getItem(key));
};

/**
 * Removes data associated with a specified key.
 *
 * - On **web**, removes from `localStorage`.
 * - On **native**, removes from `AsyncStorage`.
 *
 * @param key - The key of the value to remove.
 * @param callback - Optional callback executed after deletion.
 */
export const removeData = async (
  key: KeyStorageValues,
  callback?: (err?: Error) => any
): Promise<void> => {
  try {
    if (Platform.OS === "web") localStorage.removeItem(key);
    else await AsyncStorage.removeItem(key);
  } catch (error) {
    logError(`removeData() => ${error}`);
    return callback?.(
      new Error(error instanceof Error ? error.message : String(error))
    );
  }
  return callback?.();
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
    const data = (await loadData(
      KEYS_STORAGE.LANGUAGE_KEY_STORAGE
    )) as LanguagesSupported;
    if (data) {
      const languageAvailable = languagesSupported.includes(data);
      if (languageAvailable) return data;
    }

    const locales = Localization.getLocales()[0];
    const language = locales.languageTag.split("-")[0] as LanguagesSupported;
    const languageAvailable = languagesSupported.includes(language);
    if (language && languageAvailable) {
      await saveData(KEYS_STORAGE.LANGUAGE_KEY_STORAGE, language);
      return language;
    }
  } catch (error) {
    logError(`./globalVariables/checkLanguage() => ${error}`);
  }
  return "en";
};

/**
 * Logs an error message to the console or sends it to a server.
 *
 * @param args - The error message and additional data to log.
 *
 * @remarks
 * - In development mode, logs to the console.
 * - In preview mode, sends the log to a server endpoint.
 * - In production mode, does nothing.
 */
export async function logError(...args: any[]): Promise<void> {
  const env = process.env.NODE_ENV;
  const isDev = env === "development" || __DEV__;
  const isPreview = process.env.NODE_ENV === "preview";
  const isProduction = env === "production";

  if (isProduction && !isPreview && !isDev) return;

  const date = new Date();

  const firstMessage = `Error - ${date.toLocaleString()} ::`;

  if (isDev) console.error(firstMessage, ...args);
  else if (isPreview) {
    const errorMessage = [firstMessage, ...args]
      .filter(Boolean)
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ");

    await fetch(
      getRouteAPI("logs"),
      fetchOptions("POST", {
        log: errorMessage,
        timestamp: date.toISOString(),
      })
    );
  }
}

/**
 * Logs a message to the console or sends it to a server.
 *
 * @param args - The error message and additional data to log.
 *
 * @remarks
 * - In development mode, logs to the console.
 * - In preview mode, sends the log to a server endpoint.
 * - In production mode, does nothing.
 */
export async function log(...args: any[]): Promise<void> {
  const env = process.env.NODE_ENV;
  const isDev = env === "development" || __DEV__;
  const isPreview = process.env.NODE_ENV === "preview";
  const isProduction = env === "production";
  if (isProduction || (!isPreview && !isDev)) return;

  const date = new Date();

  const firstMessage = `Log - ${date.toLocaleString()}:`;

  if (isDev) console.log(firstMessage, ...args);
  else if (isPreview) {
    const message = [firstMessage, ...args]
      .filter(Boolean)
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ");

    await fetch(
      getRouteAPI("logs"),
      fetchOptions("POST", {
        log: message,
        timestamp: date.toISOString(),
      })
    );
  }
}

/**
 * Requests permission to access the media library.
 *
 * @returns `true` if permission is granted, otherwise `false`.
 */
export const requestImagePermission = async () => {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  return permissionResult.granted;
};

export const pickImage = async (pickMultipleImages: boolean) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsMultipleSelection: pickMultipleImages,
  });

  return result;
};

/**
 * Creates a FormData object from an array of image assets.
 *
 * @param images - An array of image assets to be included in the FormData.
 * @returns A FormData object containing the images.
 */
const getFormData = (images: ImagePicker.ImagePickerAsset[]) => {
  const formData = new FormData();
  for (const image of images) {
    const formValue = {
      uri: image.uri,
      name: image.fileName ?? "upload.jpg",
      type: image.mimeType ?? "image/jpeg",
    } as any;
    formData.append("images", formValue);
  }
  return formData;
};

/**
 * Uploads an image to the server.
 *
 * @returns The uploaded image data or `undefined` if the upload fails.
 *
 * @remarks
 * - This function uses `expo-image-picker` to allow the user to select an image.
 * - It constructs a `FormData` object and sends it to the server using a POST request.
 * - If the upload is successful, it returns the uploaded image data.
 */
export const uploadImage = async (pickMultipleImages: boolean = false) => {
  const grant = await requestImagePermission();
  if (!grant) return;

  const pickerResult = await pickImage(pickMultipleImages);
  if (pickerResult.canceled) return;

  const formData = getFormData(pickerResult.assets);

  try {
    const fetchOptions = {
      method: "POST",
      body: formData,
    };
    const res = await fetch(getRouteAPI("upload"), fetchOptions);

    const data = await res.json();
    return data.files;
  } catch (error) {
    logError("Error al subir imagen:", error);
  }
};
