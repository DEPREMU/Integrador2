import {
  User,
  UserConfig,
  TypeBodyLogin,
  TypeBodySignup,
  ResponseAuth,
} from "../types/index.d";
import { WebSocket } from "ws";
import { getDatabase } from "../database/functions.js";

/**
 * Handles the login request by validating the request body and returning a response.
 *
 * @param req - The Express request object, expected to contain a body of type `TypeBodyLogin`.
 * @param res - The Express response object used to send the response.
 *
 * The function performs the following steps:
 * 1. Checks if the request body is present. If not, responds with an error message.
 * 2. Validates that both `username` and `password` are provided in the request body.
 *    If either is missing, responds with an error message.
 * 3. (TODO) Implements the login logic to authenticate the user.
 * 4. Returns a placeholder response with a fake token and user ID.
 *
 * @returns A JSON response containing either:
 * - `data`: null or an object with a token and user information, or
 * - `error`: null or an object with an error message and timestamp.
 */
export const loginHandler = async (
  socket: WebSocket,
  message: TypeBodyLogin,
) => {
  if (!message) {
    console.error("No body given:", message);
    socket.send(
      JSON.stringify({
        data: null,
        error: { message: "Missing body", timestamp: new Date().toISOString() },
      }),
    );
    return;
  }
  if (!message.uuid) {
    console.error("No uuid given:", message);
    socket.send(
      JSON.stringify({
        data: null,
        error: {
          message: "Missing uuid in body",
          timestamp: new Date().toISOString(),
        },
      }),
    );
    return;
  }

  const user: User = {
    userId: message.uuid,
    role: "caregiver",
    name: "",
    phone: "",
    imageId: "",
    createdAt: new Date().toISOString(),
    description: "",
  };
  const userConfig: UserConfig = {
    userId: message.uuid,
    language: message.language || "en",
    pushNotifications: message.pushNotifications || false,
  };

  const db = await getDatabase();
  const [existingUser, existingUserConfig] = await Promise.all([
    db.collection("users").findOne<User>({
      userId: user.userId,
    }),
    db.collection("userConfig").findOne<UserConfig>({
      userId: user.userId,
    }),
  ]);
  if (!existingUser && !existingUserConfig) {
    console.error(
      "No user found for userId:",
      message.uuid,
      "\nexistingUser:",
      existingUser,
      "\nexistingUserConfig",
      existingUserConfig,
    );
    socket.send(
      JSON.stringify({
        data: null,
        error: {
          message: "User not found",
          timestamp: new Date().toISOString(),
        },
      }),
    );
    return;
  }

  socket.send(
    JSON.stringify({
      data: {
        message: "User exists",
        user: existingUser || user,
        userConfig: existingUserConfig || userConfig,
      },
      error: null,
    }),
  );
};

/**
 * Handles the logout request by clearing the session and returning a response.
 *
 * @param req - The Express request object.
 * @param res - The Express response object used to send the response.
 *
 * The function performs the following steps:
 * 1. Clears the session (TODO: Implement actual session clearing logic).
 * 2. Returns a success message indicating that the user has been logged out.
 *
 * @returns A JSON response containing a success message.
 */
export const signUpHandler = async (
  socket: WebSocket,
  message: TypeBodySignup,
) => {
  let response: ResponseAuth = {
    data: null,
    error: {
      message: "Internal server error",
      timestamp: new Date().toISOString(),
    },
  };
  try {
    if (!message) {
      console.error("No body given:", message);
      response.error = {
        message: "Missing body",
        timestamp: new Date().toISOString(),
      };
      socket.send(JSON.stringify(response));
      return;
    }
    if (!message?.userId) {
      console.error("No userId given:", message);
      response.error = {
        message: "Missing required fields in body",
        timestamp: new Date().toISOString(),
      };
      socket.send(JSON.stringify(response));
      return;
    }

    const user: User = {
      userId: message.userId,
      role: message.role || "caregiver",
      name: message.name,
      phone: message.phone,
      imageId: message.imageId || "",
      createdAt: new Date().toISOString(),
      description: message.description || "",
    };
    const userConfig: UserConfig = {
      userId: message.userId,
      language: message.userConfig?.language || "en",
      pushNotifications: message.userConfig?.pushNotifications || false,
    };
    const db = await getDatabase();
    const existingUser = await db
      .collection("users")
      .findOne<User>({ userId: user.userId });

    if (existingUser) {
      console.error("User already exists:", message);
      response.error = {
        message: "User already exists",
        timestamp: new Date().toISOString(),
      };
      socket.send(JSON.stringify(response));
      return;
    }

    const inserted = await Promise.all([
      db
        .collection<User>("users")
        .insertOne(user)
        .then((r) => r.insertedId),
      db
        .collection<UserConfig>("userConfig")
        .insertOne(userConfig)
        .then((r) => r.insertedId),
    ]);
    if (inserted.some((s) => !s || s === null)) {
      console.warn(
        "One column or two were not uploaded successfully:",
        inserted,
      );
      response = {
        data: {
          message: "One column or two were not uploaded successfully",
          user,
          userConfig,
        },
        error: null,
      };
      socket.send(JSON.stringify(response));
      return;
    }
    response = {
      data: {
        message: "User created successfully",
        user: user,
        userConfig: userConfig,
      },
      error: null,
    };
    socket.send(JSON.stringify(response));
  } catch (error) {
    console.error("Error during sign up:", error);
    socket.send(JSON.stringify(response));
  }
};
