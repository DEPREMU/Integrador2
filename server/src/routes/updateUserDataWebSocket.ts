import {
  User,
  ResponseUpdateUserData,
  TypeBodyUpdateUserData,
} from "../types/index.js";
import { WebSocket } from "ws";
import { getDatabase } from "../database/functions.js";

export const updateUserDataHandler = async (
  socket: WebSocket,
  message: TypeBodyUpdateUserData,
) => {
  const { userId, userData } = message;
  const response: ResponseUpdateUserData = {
    success: false,
    error: {
      message: "Internal server error",
      timestamp: new Date().toISOString(),
    },
  };

  if (!userId || !userData) {
    if (!userId) console.error("Missing userId:", userId);
    if (!userData) console.error("Missing userData:", userData);
    response.error = {
      message: "Missing userId or user data",
      timestamp: new Date().toISOString(),
    };
    socket.send(JSON.stringify(response));
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
      response.error = {
        message: "User not found or no changes made",
        timestamp: new Date().toISOString(),
      };
      socket.send(JSON.stringify(response));
      return;
    }

    response.success = true;
    response.user = userData;
    response.error = undefined;
    socket.send(JSON.stringify(response));
  } catch (error) {
    console.error("Error updating user data:", error);
    socket.send(JSON.stringify(response));
  }
};
