import {
  ResponseGetUserMedications,
  TypeBodyGetUserMedications,
} from "../../types";
import { getDatabase } from "../../database/functions.js";
import { getCollection } from "../../database/functions.js";
import { MedicationUser } from "../../types/Database.js";
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
    const coll = await getCollection<MedicationUser>("medicationsUser");
    const medications = await coll?.find({ userId }).toArray();

    if (!medications || medications.length === 0) {
      console.log("No medications found for user:", userId);
      res.status(200).json({
        medications: [],
      });
      return;
    }

    console.log(`Found ${medications.length} medications for user:`, userId);
    res.status(200).json({
      medications: medications as MedicationUser[],
    });
    const db = await getDatabase();

    // Get medications for the user
    const medicationsUser = await db
      .collection<MedicationUser>("medicationsUser")
      .find({ userId })
      .toArray();

    console.log(`Found ${medications.length} medications for user ${userId}`);

    res.status(200).json({
      medications: medicationsUser,
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
