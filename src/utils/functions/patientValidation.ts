// /src/utils/functions/patientValidation.ts
import { getRouteAPI, fetchOptions } from "./APIManagement";
import {
  TypeBodyValidatePatientUniqueness,
  ResponseValidatePatientUniqueness,
} from "@typesAPI";

/**
 * Validates if email and phone are unique among all users in the system.
 *
 * This function is used during patient creation and editing to ensure that
 * phone numbers and email addresses are unique across all users in the database.
 *
 * Features:
 * - Validates phone number uniqueness
 * - Validates email address uniqueness
 * - Supports exclusion of a specific user (for edit scenarios)
 * - Handles network errors gracefully
 * - Provides detailed error information
 *
 * @async
 * @function validatePatientUniqueness
 * @param {string} [phone] - Phone number to validate for uniqueness
 * @param {string} [email] - Email address to validate for uniqueness
 * @param {string} [excludeUserId] - User ID to exclude from validation (used when editing existing users)
 * @returns {Promise<ResponseValidatePatientUniqueness>} Promise with validation result containing isUnique flag and conflicts
 *
 * @example
 * // Validate new patient data
 * const result = await validatePatientUniqueness("123-456-7890", "patient@example.com");
 * if (!result.isUnique) {
 *   console.log('Conflicts:', result.conflicts);
 * }
 *
 * @example
 * // Validate when editing existing patient (exclude current patient from check)
 * const result = await validatePatientUniqueness("123-456-7890", "patient@example.com", "currentPatientId");
 */
export const validatePatientUniqueness = async (
  phone?: string,
  email?: string,
  excludeUserId?: string,
): Promise<ResponseValidatePatientUniqueness> => {
  try {
    console.log("[CLIENT] Validating uniqueness:", {
      phone: phone || "not provided",
      email: email || "not provided",
      excludeUserId: excludeUserId || "none",
    });
    const response = await fetch(
      getRouteAPI("/validatePatientUniqueness"),
      fetchOptions<TypeBodyValidatePatientUniqueness>("POST", {
        phone: phone?.trim(),
        email: email?.trim(),
        excludeUserId,
      }),
    );

    if (response.ok) {
      const result = await response.json();
      console.log("[CLIENT] Validation result:", result);
      return result;
    } else {
      const errorText = await response.text();
      console.error("[CLIENT] HTTP Error:", response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[CLIENT] Error validating uniqueness:", error);
    return {
      isUnique: false,
      error: {
        message: "Network error during validation",
        timestamp: new Date().toISOString(),
      },
    };
  }
};
