import { Request, Response } from "express";
import { getDatabase } from "../database/functions.js";
import { ObjectId } from "mongodb";

export type TypeBodyDeleteUserMedication = {
  medicationId: string;
};

export type ResponseDeleteUserMedication = {
  success: boolean;
  error?: { message: string; timestamp: string };
};

/**
 * Handles the deletion of a user medication.
 * 
 * @param req - Express request object containing medicationId in body
 * @param res - Express response object
 */
export const deleteUserMedicationHandler = async (
  req: Request<{}, {}, TypeBodyDeleteUserMedication>,
  res: Response<ResponseDeleteUserMedication>
) => {
  console.log("🗑️ deleteUserMedicationHandler called");
  try {
    const body: TypeBodyDeleteUserMedication | null = req.body;
    console.log("📝 Request body:", JSON.stringify(body, null, 2));

    if (!body || !body.medicationId) {
      console.error("❌ No medicationId provided:", body);
      return res.json({
        success: false,
        error: {
          message: "medicationId is required",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(body.medicationId)) {
      console.error("❌ Invalid ObjectId format:", body.medicationId);
      return res.json({
        success: false,
        error: {
          message: "Invalid medication ID format",
          timestamp: new Date().toISOString(),
        },
      });
    }

    const db = await getDatabase();
    const medicationsCollection = db.collection("medicationsUser");

    console.log("🔍 Attempting to delete medication with ID:", body.medicationId);

    // Delete the medication by _id
    const result = await medicationsCollection.deleteOne({
      _id: new ObjectId(body.medicationId),
    });

    if (result.deletedCount === 0) {
      console.log("❌ Medication not found:", body.medicationId);
      return res.json({
        success: false,
        error: {
          message: "Medication not found",
          timestamp: new Date().toISOString(),
        },
      });
    }

    console.log("✅ Medication deleted successfully:", body.medicationId);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("❌ Error deleting medication:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      medicationId: req.body?.medicationId
    });
    res.json({
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
