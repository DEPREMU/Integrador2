import {
  ResponseGetUserMedications,
  TypeBodyGetUserMedications,
  MedicationUser,
  User,
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
    // First, get the user to find their patientUserIds
    const usersColl = await getCollection<User>("users");
    const user = await usersColl?.findOne({ userId });
    
    if (!user) {
      res.status(404).json({
        medications: [],
        error: {
          message: "User not found",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const medicationsColl = await getCollection<MedicationUser>("medicationsUser");
    
    if (!medicationsColl) {
      res.status(500).json({
        medications: [],
        error: {
          message: "Database connection failed",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Get medications for the user and all their patients
    let userIdsToQuery = [userId];
    
    // Add patient user IDs if they exist
    if (user.patientUserIds && user.patientUserIds.length > 0) {
      userIdsToQuery = [...userIdsToQuery, ...user.patientUserIds];
    }

    console.log(`Querying medications for user IDs: ${userIdsToQuery.join(', ')}`);

    // Get all medications for the user and their patients
    const medications = await medicationsColl
      .find({ userId: { $in: userIdsToQuery } })
      .sort({ createdAt: -1 }) // Most recent first
      .toArray();

    console.log(`Found ${medications?.length || 0} medications for users ${userIdsToQuery.join(', ')}`);

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
