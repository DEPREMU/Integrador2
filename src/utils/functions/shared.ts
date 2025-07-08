/**
 * Shared utility functions that don't depend on other modules
 * This file helps break circular dependencies
 */

/**
 * Stringifies data for API requests
 * @param value - The data to stringify
 * @returns Stringified JSON or empty string on error
 */
export const stringifyData = (value: any): string => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error(`Error stringifying data: ${error}`);
    return "";
  }
};

/**
 * Safely parses JSON data
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
