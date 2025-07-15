import {
  User,
  UserConfig,
  TypeBodyLogin,
  ResponseAuth,
  TypeBodySignup,
} from "../types/index.js";
import { Request, Response } from "express";
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
  req: Request<{}, {}, TypeBodyLogin>,
  res: Response<ResponseAuth>,
) => {
  const body: TypeBodyLogin | null = req.body;

  if (!body) {
    console.error("No body given:", body);
    res.json({
      data: null,
      error: { message: "Missing body", timestamp: new Date().toISOString() },
    });
    return;
  }
  if (!body.uuid) {
    console.error("No uuid given:", body);
    res.json({
      data: null,
      error: {
        message: "Missing uuid in body",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  const user: User = {
    userId: body.uuid,
    role: "caregiver",
    name: "",
    phone: "",
    imageId: "",
    createdAt: new Date().toISOString(),
    description: "",
  };
  const userConfig: UserConfig = {
    userId: body.uuid,
    language: body.language || "en",
    pushNotifications: body.pushNotifications || false,
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
      body.uuid,
      "\nexistingUser:",
      existingUser,
      "\nexistingUserConfig",
      existingUserConfig,
    );
    res.json({
      data: null,
      error: {
        message: "User not found",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  res.json({
    data: {
      message: "User exists",
      user: existingUser || user,
      userConfig: existingUserConfig || userConfig,
    },
    error: null,
  });
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
  req: Request<{}, {}, TypeBodySignup>,
  res: Response<ResponseAuth>,
) => {
  try {
    const body: TypeBodySignup | null = req.body;

    if (!body) {
      console.error("No body given:", body);
      res.json({
        data: null,
        error: { message: "Missing body", timestamp: new Date().toISOString() },
      });
      return;
    }
    if (!body?.userId) {
      console.error("No userId given:", body);
      res.json({
        data: null,
        error: {
          message: "Missing required fields in body",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { userId } = body;

    const user: User = {
      userId,
      role: body.role || "caregiver",
      name: body.name,
      phone: body.phone,
      imageId: body.imageId || "",
      createdAt: new Date().toISOString(),
      description: body.description || "",
    };
    const userConfig: UserConfig = {
      userId,
      language: body.userConfig?.language || "en",
      pushNotifications: body.userConfig?.pushNotifications || false,
    };
    const db = await getDatabase();
    const existingUser = await db
      .collection("users")
      .findOne<User>({ userId: user.userId });

    if (existingUser) {
      console.error("User already exists:", body);
      res.json({
        data: null,
        error: {
          message: "User already exists",
          timestamp: new Date().toISOString(),
        },
      });
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
      res.json({
        data: {
          message: "One column or two were not uploaded successfully",
          user,
          userConfig,
        },
        error: null,
      });
      return;
    }
    res.json({
      data: {
        message: "User created successfully",
        user: user,
        userConfig: userConfig,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error during sign up:", error);
    res.json({
      data: null,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
