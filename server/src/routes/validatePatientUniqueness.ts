// /server/src/routes/validatePatientUniqueness.ts
import { getCollection } from "../database/functions.js";
import { Request, Response } from "express";
import {
  ResponseValidatePatientUniqueness,
  TypeBodyValidatePatientUniqueness,
  User,
} from "../types";

/**
 * Validates if email and phone are unique among ALL users (patients, caregivers, both).
 *
 * This endpoint is used to ensure data integrity by preventing duplicate email addresses
 * and phone numbers across all users in the system. It supports exclusion of a specific
 * user ID for edit scenarios.
 *
 * Features:
 * - Validates email uniqueness across all users
 * - Validates phone number uniqueness across all users
 * - Supports user exclusion for edit operations
 * - Provides detailed conflict information
 * - Handles edge cases and validation errors
 *
 * Request Body:
 * - email (optional): Email address to validate
 * - phone (optional): Phone number to validate
 * - excludeUserId (optional): User ID to exclude from validation
 *
 * Response:
 * - isUnique: Boolean indicating if all provided fields are unique
 * - conflicts: Object indicating which fields have conflicts (if any)
 * - error: Error information if validation fails
 *
 * @async
 * @function validatePatientUniquenessHandler
 * @param {Request<{}, {}, TypeBodyValidatePatientUniqueness>} req - Request object containing email, phone, and optional excludeUserId
 * @param {Response<ResponseValidatePatientUniqueness>} res - Response object for sending validation results
 * @returns {Promise<void>}
 *
 * @example
 * // POST /validatePatientUniqueness
 * // Body: { "email": "test@example.com", "phone": "123-456-7890" }
 * // Response: { "isUnique": true }
 *
 * @example
 * // POST /validatePatientUniqueness (with conflicts)
 * // Body: { "email": "existing@example.com", "phone": "123-456-7890" }
 * // Response: { "isUnique": false, "conflicts": { "email": true, "phone": false } }
 */
export const validatePatientUniquenessHandler = async (
  req: Request<{}, {}, TypeBodyValidatePatientUniqueness>,
  res: Response<ResponseValidatePatientUniqueness>,
) => {
  const { email, phone, excludeUserId } = req.body;

  console.log("[SERVER] Validating uniqueness for:", {
    phone: phone || "not provided",
    email: email || "not provided",
    excludeUserId: excludeUserId || "none",
  });

  if (!phone && !email) {
    console.log("[SERVER] Bad request: No email or phone provided");
    res.status(400).json({
      isUnique: false,
      error: {
        message: "Email or phone must be provided for validation",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const coll = await getCollection<User>("users");
    if (!coll) {
      throw new Error("Failed to get users collection");
    }

    const conflicts = {
      email: false,
      phone: false,
    };

    if (email && email.trim() !== "") {
      const query: any = {
        email: email.trim(),
      };

      if (excludeUserId) {
        query.userId = { $ne: excludeUserId };
      }

      console.log("[SERVER] Checking email query:", query);
      const existingEmailUser = await coll.findOne(query);
      console.log(
        "[SERVER] Email check result:",
        existingEmailUser ? "FOUND DUPLICATE" : "UNIQUE",
      );

      if (existingEmailUser) {
        console.log(
          "[SERVER] Found user with email, role:",
          existingEmailUser.role,
        );
        conflicts.email = true;
      }
    }

    if (phone && phone.trim() !== "") {
      const query: any = {
        phone: phone.trim(),
      };

      if (excludeUserId) {
        query.userId = { $ne: excludeUserId };
      }

      console.log("[SERVER] Checking phone query:", query);
      const existingPhoneUser = await coll.findOne(query);
      console.log(
        "[SERVER] Phone check result:",
        existingPhoneUser ? "FOUND DUPLICATE" : "UNIQUE",
      );

      if (existingPhoneUser) {
        console.log(
          "[SERVER] Found user with phone, role:",
          existingPhoneUser.role,
        );
        conflicts.phone = true;
      }
    }

    const isUnique = !conflicts.email && !conflicts.phone;

    console.log("[SERVER] Final validation result:", {
      isUnique,
      conflicts,
    });

    res.status(200).json({
      isUnique,
      conflicts: isUnique ? undefined : conflicts,
    });
  } catch (error) {
    console.error("[SERVER] Error validating uniqueness:", error);
    res.status(500).json({
      isUnique: false,
      error: {
        message: "Internal server error while validating uniqueness",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
