import { getDatabase } from "../database/functions.js";
import { Request, Response } from "express";
import { ResponseUpdateUserData, TypeBodyUpdateUserData, User } from "../types";

export const updateUserDataHandler = async (
  req: Request<{}, {}, TypeBodyUpdateUserData>,
  res: Response<ResponseUpdateUserData>,
) => {
  const { userId, userData } = req.body;

  if (!userId || !userData) {
    if (!userId) console.error("Missing userId:", userId);
    if (!userData) console.error("Missing userData:", userData);
    res.status(400).json({
      success: false,
      error: {
        message: "Missing userId or user data",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const keys = Object.keys(userData) as (keyof User)[];
    if (keys.includes("userId"))
      delete (userData as Partial<typeof userData>).userId;
    if (keys.includes("createdAt"))
      delete (userData as Partial<typeof userData>).createdAt;
    if (keys.includes("_id")) delete (userData as Partial<typeof userData>)._id;

    const db = await getDatabase();
    const result = await db
      .collection<User>("users")
      .updateOne({ userId }, { $set: userData });

    if (result.modifiedCount === 0) {
      console.error("No user found or no changes made for userId:", userId);
      res.status(404).json({
        success: false,
        error: {
          message: "User not found or no changes made",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
