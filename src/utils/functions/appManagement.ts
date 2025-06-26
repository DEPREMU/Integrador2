import { logError } from "./debug";
import { getRouteAPI } from "./APIManagement";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { ResponseUploadImage } from "@typesAPI";

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
 * Parses a JSON string into an object of type `T`.
 *
 * @template T - The expected return type, defaults to `object | null`.
 * @param value - The JSON string to parse. If `null`, it will be treated as `"null"`.
 * @returns The parsed object of type `T`. If parsing fails, returns the original value cast to type `T`.
 */
export const parseData = <T = object | null>(value: string | null): T => {
  let parsed: T;
  try {
    parsed = JSON.parse(value || "null") as T;
  } catch {
    parsed = value as T;
  }
  return parsed;
};

/**
 * Converts a given value to its string representation.
 *
 * - If the value is already a string, it returns the value as is.
 * - Otherwise, it attempts to stringify the value using `JSON.stringify`.
 * - If stringification fails, it logs the error and returns an empty string.
 *
 * @param value - The value to be converted to a string.
 * @returns The string representation of the value, or an empty string if an error occurs.
 */
export const stringifyData = (value: any): string => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch (error) {
    logError(`Error stringifying data: ${error}`);
    return "";
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

export const hasPushNotifications = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== Notifications.PermissionStatus.GRANTED) {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === Notifications.PermissionStatus.GRANTED;
  }
  return status === Notifications.PermissionStatus.GRANTED;
};
