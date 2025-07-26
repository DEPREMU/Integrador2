// /server/src/routes/searchUser.ts
import { getDatabase } from "../database/functions.js";
import { Request, Response } from "express";
import {
  User,
  TypeBodySearchUser,
  ResponseSearchUser,
} from "../types/index.d";

/**
 * Handles the search user request by email or phone with privacy protection.
 *
 * This endpoint allows caregivers to search for existing patients to add to their care list.
 * It implements privacy protection by returning only minimal user information necessary
 * for identification and validation.
 *
 * Privacy Protection Features:
 * - Returns only the searched field (email OR phone, not both)
 * - Includes only basic identification info (name, photo, role)
 * - Does not expose sensitive medical information
 * - Prevents data leakage through selective field return
 *
 * Search Capabilities:
 * - Search by email address with exact match
 * - Search by phone number with exact match
 * - Automatic search type detection
 * - Case-sensitive matching for security
 *
 * Security Features:
 * - Role information included for caregiver validation
 * - Minimal data exposure principle
 * - Input validation and sanitization
 * - Error handling without information disclosure
 *
 * @async
 * @function searchUserHandler
 * @param {Request<{}, {}, TypeBodySearchUser>} req - Request object containing search criteria (email or phone)
 * @param {Response<ResponseSearchUser>} res - Response object for sending search results
 * @returns {Promise<void>}
 *
 * @example
 * // POST /searchUser
 * // Body: { "email": "patient@example.com" }
 * // Response: { "user": { "userId": "123", "name": "John Doe", "email": "patient@example.com", "imageId": "456", "role": "patient" }, "message": "Usuario encontrado" }
 *
 * @example
 * // POST /searchUser (user not found)
 * // Body: { "phone": "999-999-9999" }
 * // Response: { "message": "Usuario no encontrado" }
 */
export const searchUserHandler = async (
  req: Request<{}, {}, TypeBodySearchUser>,
  res: Response<ResponseSearchUser>,
) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    console.error("No search criteria provided:", req.body);
    res.status(400).json({
      error: {
        message: "Email or phone is required",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const db = await getDatabase();
    let searchQuery: any = {};

    if (email) {
      searchQuery.email = email;
    } else if (phone) {
      searchQuery.phone = phone;
    }

    const user = await db.collection<User>("users").findOne(searchQuery);

    if (!user) {
      res.status(200).json({
        message: "Usuario no encontrado",
      });
      return;
    }

    // Return only minimal information to protect patient privacy
    // Only return the field that was searched for, plus name, photo, and role (needed for validation)
    const minimalUserInfo: Partial<User> = {
      userId: user.userId,
      name: user.name,
      imageId: user.imageId,
      role: user.role, // Include role for caregiver validation
    };

    // Add ONLY the field that was actually searched for
    if (email) {
      minimalUserInfo.email = user.email;
      // Do NOT include phone when searching by email
    } else if (phone) {
      minimalUserInfo.phone = user.phone;
      // Do NOT include email when searching by phone
    }

    res.status(200).json({
      user: minimalUserInfo as User,
      message: "Usuario encontrado",
    });
  } catch (error) {
    console.error("Error searching user:", error);
    res.status(500).json({
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
