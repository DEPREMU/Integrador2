import { logError } from "./debug";
import { stringifyData } from "./shared";
import { getRouteAPI } from "./APIManagement";
import * as ImagePicker from "expo-image-picker";
import { ResponseUploadImage } from "@typesAPI";

// Conditionally import expo-notifications to avoid errors in Expo Go
let Notifications: any = null;
try {
  Notifications = require("expo-notifications");
} catch (error) {
  // expo-notifications not available (likely in Expo Go)
  console.warn("expo-notifications not available, push notifications will be disabled");
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
export const uploadImage = async (
  userId: string,
  pickMultipleImages: boolean = false
) => {
  const grant = await requestImagePermission();
  if (!grant) return;

  const pickerResult = await pickImage(pickMultipleImages);
  if (pickerResult.canceled) return;

  const formData = getFormData(pickerResult.assets);
  formData.append("userId", userId);

  try {
    const fetchOptions = {
      method: "POST",
      body: formData,
    };
    const data: ResponseUploadImage = await fetch(
      getRouteAPI("/upload"),
      fetchOptions
    ).then((r) => r.json());

    return { files: data.files, success: data.success };
  } catch (error) {
    logError("Error uploading image:", error);
    return {
      files: [],
      success: false,
      error: {
        message: "Error uploading image",
        timestamp: new Date().toISOString(),
      },
    };
  }
};

/**
 * Creates a debounced version of the provided function that delays its execution until after
 * a specified delay has elapsed since the last time it was invoked.
 *
 * @typeParam T - The type of the function to debounce.
 * @param func - The function to debounce.
 * @param delay - The number of milliseconds to delay.
 * @returns A debounced version of the input function.
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (() => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Replaces placeholders in a message string with corresponding values from an array.
 *
 * Placeholders in the message should be in the format `{0}`, `{1}`, etc.
 * Each placeholder will be replaced by the value at the corresponding index in the `values` array.
 * If a placeholder index does not exist in the array, the placeholder is left unchanged.
 *
 * @param message - The message string containing placeholders.
 * @param values - An array of strings to replace the placeholders.
 * @returns The interpolated message with placeholders replaced by corresponding values.
 *
 * @example
 * ```typescript
 * const msg = "Hello, {0}! You have {1} new messages.";
 * const result = interpolateMessage(msg, ["Alice", "5"]);
 * // result: "Hello, Alice! You have 5 new messages."
 * ```
 */
export const interpolateMessage = (message: string, values: string[]) => {
  if (!message || !values || values.length === 0) return message;
  return message.replace(/\{(\d+)\}/g, (match, index) => {
    const value = values[parseInt(index, 10)];
    return value !== undefined ? value : match;
  });
};

/**
 * Checks if the application has permission to send push notifications.
 *
 * This function first checks if expo-notifications is available (not in Expo Go).
 * If available, it checks the current notification permission status.
 * If permission is not granted, it requests permission from the user.
 * Returns `true` if permission is granted, otherwise `false`.
 * In Expo Go, this will always return `false` since notifications are not supported.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if push notification permission is granted, otherwise `false`.
 */
export const hasPushNotifications = async (): Promise<boolean> => {
  // Check if expo-notifications is available (not in Expo Go)
  if (!Notifications) {
    console.warn("Push notifications not available in Expo Go. Use a development build for full functionality.");
    return false;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== Notifications.PermissionStatus.GRANTED) {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      return newStatus === Notifications.PermissionStatus.GRANTED;
    }
    return status === Notifications.PermissionStatus.GRANTED;
  } catch (error) {
    console.warn("Error checking push notification permissions:", error);
    return false;
  }
};

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The string to capitalize.
 * @returns The string with the first letter capitalized, or the original string if it is empty.
 *
 * @example
 * ```typescript
 * const result = capitalize("hello");
 * console.log(result); // Output: "Hello"
 * ```
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Checks if a value is falsy.
 *
 * A value is considered falsy if it is:
 * - `null`
 * - `undefined`
 * - `false`
 * - an empty string (`""`)
 *
 * @param value - The value to check.
 * @returns `true` if the value is falsy, otherwise `false`.
 */
export const isFalsy = (value: any): boolean => {
  return (
    value === null || value === undefined || value === false || value === ""
  );
};
