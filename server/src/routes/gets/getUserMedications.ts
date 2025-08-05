import {
  ResponseGetUserMedications,
  TypeBodyGetUserMedications,
} from "../../types";
import { MedicationUser } from "../../types/Database.js";
import { getDatabase } from "../../database/functions.js";
import { Request, Response } from "express";

export const getUserMedications = async (
  req: Request<{}, {}, TypeBodyGetUserMedications>,
  res: Response<ResponseGetUserMedications>,
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
    const db = await getDatabase();
    
    // Get medications for the user
    const medications = await db
      .collection<MedicationUser>("medicationsUser")
      .find({ userId })
      .toArray();

    console.log(`Found ${medications.length} medications for user ${userId}`);

    res.status(200).json({
      medications: medications,
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
