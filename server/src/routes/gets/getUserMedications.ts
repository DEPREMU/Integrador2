import {
  ResponseGetUserMedications,
  TypeBodyGetUserMedications,
  MedicationUser,
} from "../../types";
import { Request, Response } from "express";
import { getCollection } from "../../database/functions.js";

export const getUserMedications = async (
  req: Request<{}, {}, TypeBodyGetUserMedications>,
  res: Response<ResponseGetUserMedications>
) => {
  const { userId } = req.body;
  console.log("getUserMedications called with userId:", userId);
  
  if (!userId) {
    res.status(400).json({
      medications: [],
      error: {
        message: "User ID is required",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const coll = await getCollection<MedicationUser>("medicationsUser");
    
    if (!coll) {
      res.status(500).json({
        medications: [],
        error: {
          message: "Database connection failed",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Get all medications for the specific user
    const medications = await coll
      .find({ userId })
      .sort({ createdAt: -1 }) // Most recent first
      .toArray();

    console.log(`Found ${medications?.length || 0} medications for user ${userId}`);

    res.json({
      medications: medications || [],
    });

  } catch (error) {
    console.error("Error fetching user medications:", error);
    res.status(500).json({
      medications: [],
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
