import { Request, Response } from "express";
import { MedicationUser } from "../types/index.js";
import { getDatabase } from "../database/functions.js";

export type TypeBodyAddUserMedication = {
  medication: Omit<MedicationUser, "_id">;
};

export type ResponseAddUserMedication = {
  success: boolean;
  medication?: MedicationUser;
  error?: { message: string; timestamp: string };
};

/**
 * Handles adding a new medication schedule for a user
 */
export const addUserMedicationHandler = async (
  req: Request<{}, {}, TypeBodyAddUserMedication>,
  res: Response<ResponseAddUserMedication>
) => {
  console.log("🔥 addUserMedicationHandler called");
  try {
    const body: TypeBodyAddUserMedication | null = req.body;
    console.log("📝 Request body:", JSON.stringify(body, null, 2));

    if (!body || !body.medication) {
      console.error("❌ No medication data provided:", body);
      res.json({
        success: false,
        error: { 
          message: "Missing medication data", 
          timestamp: new Date().toISOString() 
        },
      });
      return;
    }

    const { medication } = body;
    console.log("💊 Medication data:", medication);

    // Validate required fields
    if (!medication.userId || !medication.medicationId || !medication.name || 
        !medication.startHour || !medication.days || medication.days.length === 0) {
      console.error("❌ Missing required medication fields:", medication);
      res.json({
        success: false,
        error: {
          message: "Missing required medication fields",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    console.log("✅ Validation passed, saving to database...");
    const db = await getDatabase();
    const medicationWithTimestamp = {
      ...medication,
      createdAt: new Date().toISOString(),
    };

    console.log("💾 Saving medication:", medicationWithTimestamp);
    const result = await db
      .collection<MedicationUser>("medicationsUser")
      .insertOne(medicationWithTimestamp);

    console.log("📊 Insert result:", result);

    if (!result.insertedId) {
      console.error("❌ Failed to insert medication:", medication);
      res.json({
        success: false,
        error: {
          message: "Failed to save medication",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Return the created medication with its ID
    const createdMedication = {
      ...medicationWithTimestamp,
      _id: result.insertedId,
    };

    console.log("✅ Medication saved successfully:", createdMedication);
    res.json({
      success: true,
      medication: createdMedication,
    });

  } catch (error) {
    console.error("Error adding user medication:", error);
    res.json({
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
