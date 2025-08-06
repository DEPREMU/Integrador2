import { Request, Response } from "express";
import { getDatabase } from "../database/functions.js";
import { PillboxConfig } from "../types/Database.js";
import {
  TypeBodySavePillboxConfig,
  ResponseSavePillboxConfig,
  TypeBodyGetPillboxConfig,
  ResponseGetPillboxConfig,
  TypeBodyDeletePillboxConfig,
  ResponseDeletePillboxConfig,
} from "../types/TypesAPI.js";

/**
 * Handles saving a pillbox configuration to the database
 * @param req - Express request object containing pillbox configuration data
 * @param res - Express response object
 */
export const savePillboxConfigHandler = async (
  req: Request<{}, {}, TypeBodySavePillboxConfig>,
  res: Response<ResponseSavePillboxConfig>,
) => {
  console.log("💊 savePillboxConfigHandler called");
  try {
    const body: TypeBodySavePillboxConfig | null = req.body;
    console.log("📝 Request body:", JSON.stringify(body, null, 2));

    if (!body || !body.userId || !body.patientId || !body.pillboxId) {
      console.error("❌ Missing required fields:", body);
      res.json({
        success: false,
        error: {
          message: "Missing required fields: userId, patientId, or pillboxId",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { userId, patientId, pillboxId, compartments } = body;

    // Validate compartments
    if (!compartments || !Array.isArray(compartments)) {
      console.error("❌ Invalid compartments data:", compartments);
      res.json({
        success: false,
        error: {
          message: "Invalid compartments data",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    console.log("✅ Validation passed, saving to database...");
    const db = await getDatabase();

    const configWithTimestamp: PillboxConfig = {
      userId,
      patientId,
      pillboxId,
      compartments,
      lastUpdated: new Date(),
    };

    console.log("💾 Saving pillbox config:", configWithTimestamp);

    // Use upsert to either insert new config or update existing one
    const result = await db
      .collection<PillboxConfig>("pillboxConfigs")
      .replaceOne({ userId, patientId }, configWithTimestamp, { upsert: true });

    console.log("📊 Upsert result:", result);

    if (!result.acknowledged) {
      console.error("❌ Failed to save pillbox config:", configWithTimestamp);
      res.json({
        success: false,
        error: {
          message: "Failed to save pillbox configuration",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    console.log("✅ Pillbox config saved successfully");
    res.json({
      success: true,
      config: configWithTimestamp,
    });
  } catch (error) {
    console.error("❌ Error saving pillbox config:", error);
    res.json({
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Handles retrieving a pillbox configuration from the database
 * @param req - Express request object containing userId and patientId
 * @param res - Express response object
 */
export const getPillboxConfigHandler = async (
  req: Request<{}, {}, TypeBodyGetPillboxConfig>,
  res: Response<ResponseGetPillboxConfig>,
) => {
  console.log("🔍 getPillboxConfigHandler called");
  try {
    const body: TypeBodyGetPillboxConfig | null = req.body;
    console.log("📝 Request body:", JSON.stringify(body, null, 2));

    if (!body || !body.userId || !body.patientId) {
      console.error("❌ Missing required fields:", body);
      res.json({
        error: {
          message: "Missing required fields: userId or patientId",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { userId, patientId } = body;

    console.log("🔍 Searching for pillbox config...");
    const db = await getDatabase();

    const config = await db
      .collection<PillboxConfig>("pillboxConfigs")
      .findOne({ userId, patientId });

    if (!config) {
      console.log(
        "❌ No pillbox config found for user:",
        userId,
        "patient:",
        patientId,
      );
      res.json({
        error: {
          message: "No pillbox configuration found",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    console.log("✅ Pillbox config found:", config);
    res.json({
      config: config,
    });
  } catch (error) {
    console.error("❌ Error retrieving pillbox config:", error);
    res.json({
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Handles deleting a pillbox configuration from the database
 * @param req - Express request object containing userId and patientId
 * @param res - Express response object
 */
export const deletePillboxConfigHandler = async (
  req: Request<{}, {}, TypeBodyDeletePillboxConfig>,
  res: Response<ResponseDeletePillboxConfig>,
) => {
  console.log("🗑️ deletePillboxConfigHandler called");
  try {
    const body: TypeBodyDeletePillboxConfig | null = req.body;
    console.log("📝 Request body:", JSON.stringify(body, null, 2));

    if (!body || !body.userId || !body.patientId) {
      console.error("❌ Missing required fields:", body);
      res.json({
        success: false,
        error: {
          message: "Missing required fields: userId or patientId",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { userId, patientId } = body;

    console.log("🗑️ Deleting pillbox config...");
    const db = await getDatabase();

    const result = await db
      .collection<PillboxConfig>("pillboxConfigs")
      .deleteOne({ userId, patientId });

    if (result.deletedCount === 0) {
      console.log(
        "❌ No pillbox config found to delete for user:",
        userId,
        "patient:",
        patientId,
      );
      res.json({
        success: false,
        error: {
          message: "No pillbox configuration found to delete",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    console.log("✅ Pillbox config deleted successfully");
    res.json({
      success: true,
    });
  } catch (error) {
    console.error("❌ Error deleting pillbox config:", error);
    res.json({
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
