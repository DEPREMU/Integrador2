import {
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
 * console.log(imageRoute); // Outputs: "https://example.com/images/photo.jpg"
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
      console.error(
        `saveDataSecure() => ${message} - ${result.error?.timestamp || ""}`
      );
      return callback?.(new Error(message));
    }

    localStorage.setItem(key, result.dataEncrypted);
    return callback?.();
  } catch (error) {
    console.error(`saveDataSecure() => ${error}`);
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
      console.error(
        `loadDataSecure() => ${result.error?.message} - ${result.error?.timestamp}`
      );
      return callback?.(
        null,
        new Error(result.error?.message || "Decryption failed")
      );
    }

    return result.dataDecrypted;
  } catch (error) {
    console.error(`loadDataSecure() => ${error}`);
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
    console.error(`removeDataSecure() => ${error}`);
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
    console.error(`removeData() => ${error}`);
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
    console.error(`./globalVariables/checkLanguage() => ${error}`);
  }
  return "en";
};

export const requestImagePermission = async () => {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  return permissionResult.granted;
};

export const uploadImage = async () => {
  const grant = await requestImagePermission();
  if (!grant) return;

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsMultipleSelection: false,
  });

  if (pickerResult.canceled) return;

  console.log("Picker result:", pickerResult);
  console.log("Assets:", pickerResult.assets);
  pickerResult.assets.forEach((asset) => console.log(asset.uri));

  const image = pickerResult.assets;

  const formData = new FormData();
  for (const img of image) {
    formData.append("images", {
      uri: img.uri,
      name: img.fileName ?? "upload.jpg",
      type: img.mimeType ?? "image/jpeg",
    } as any);
  }

  try {
    const res = await fetch(getRouteAPI("upload"), {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Subida exitosa:", data);
    return data.files;
  } catch (error) {
    console.error("Error al subir imagen:", error);
  }
};
