import { getDatabase } from "../database/functions.js";
import { Request, Response } from "express";
import { User } from "../types/Database";
import {
  TypeBodyCreatePatient,
  ResponseCreatePatient,
  TypeBodyDeletePatient,
  ResponseDeletePatient,
  TypeBodyAddExistingPatient,
  ResponseAddExistingPatient
} from "../types/TypesAPI";
import { ObjectId } from "mongodb";

/**
 * Handles the create patient request.
 *
 * @param req - The Express request object, expected to contain a body of type `TypeBodyCreatePatient`.
 * @param res - The Express response object used to send the response.
 *
 * The function performs the following steps:
 * 1. Validates that all required fields are present in the request body.
 * 2. Creates a new patient user in the database.
 * 3. Updates the caregiver's patientUserIds array to include the new patient.
 * 4. Returns the created patient data.
 *
 * @returns A JSON response containing either:
 * - `patient`: The created patient object and success flag, or
 * - `error`: Error message with timestamp if something goes wrong.
 */
export const createPatientHandler = async (
  req: Request<{}, {}, TypeBodyCreatePatient>,
  res: Response<ResponseCreatePatient>,
) => {
  const { caregiverId, patientData } = req.body;

  if (!caregiverId || !patientData) {
    console.error("Missing required fields:", req.body);
    res.status(400).json({
      success: false,
      error: {
        message: "caregiverId and patientData are required",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Validate required patient fields
  const requiredFields = ["name", "phone"];
  const missingFields = requiredFields.filter(
    (field) => !patientData[field as keyof typeof patientData],
  );

  if (missingFields.length > 0) {
    console.error("Missing required patient fields:", missingFields);
    res.status(400).json({
      success: false,
      error: {
        message: `Missing required fields: ${missingFields.join(", ")}`,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const db = await getDatabase();

    // Check if caregiver exists
    const caregiver = await db
      .collection<User>("users")
      .findOne({ userId: caregiverId });
    if (!caregiver) {
      res.status(404).json({
        success: false,
        error: {
          message: "Caregiver not found",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Generate a unique userId for the patient
    const patientUserId = `patient_${new ObjectId().toHexString()}`;

    // Create the patient user object
    const newPatient: User = {
      userId: patientUserId,
      role: "patient",
      name: patientData.name,
      email: patientData.email,
      phone: patientData.phone,
      imageId: patientData.imageId || "",
      createdAt: new Date().toISOString(),
      description: patientData.description || "",
      caregiverId: caregiverId,
      age: patientData.age,
      conditions: patientData.conditions || [],
      allergies: patientData.allergies || [],
      medicationIds: [],
      medications: [],
    };

    // Insert the new patient
    const insertResult = await db
      .collection<User>("users")
      .insertOne(newPatient);

    if (!insertResult.insertedId) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to create patient",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Update caregiver's patientUserIds array
    const updateResult = await db
      .collection<User>("users")
      .updateOne(
        { userId: caregiverId },
        { $addToSet: { patientUserIds: patientUserId } },
      );

    if (updateResult.modifiedCount === 0) {
      console.warn(
        "Caregiver patientUserIds not updated - patient may already exist in list",
      );
    }

    res.status(201).json({
      success: true,
      patient: {
        ...newPatient,
        _id: insertResult.insertedId,
      },
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Handles the delete patient request.
 *
 * @param req - The Express request object, expected to contain a body of type `TypeBodyDeletePatient`.
 * @param res - The Express response object used to send the response.
 *
 * The function performs the following steps:
 * 1. Validates that caregiverId and patientId are provided.
 * 2. Verifies that the caregiver exists and the patient belongs to them.
 * 3. Removes the patient from the caregiver's patientUserIds array.
 * 4. Deletes the patient user from the database.
 * 5. Returns a success confirmation.
 *
 * @returns A JSON response containing either:
 * - `success`: true if deletion was successful, or
 * - `error`: Error message with timestamp if something goes wrong.
 */
export const deletePatientHandler = async (
  req: Request<{}, {}, TypeBodyDeletePatient>,
  res: Response<ResponseDeletePatient>,
) => {
  const { caregiverId, patientId } = req.body;

  if (!caregiverId || !patientId) {
    console.error("Missing required fields:", req.body);
    res.status(400).json({
      success: false,
      error: {
        message: "caregiverId and patientId are required",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const db = await getDatabase();

    // Check if caregiver exists and patient belongs to them
    const caregiver = await db.collection<User>("users").findOne({
      userId: caregiverId,
      patientUserIds: { $in: [patientId] },
    });

    if (!caregiver) {
      res.status(404).json({
        success: false,
        error: {
          message:
            "Caregiver not found or patient doesn't belong to this caregiver",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Check if patient exists
    const patient = await db
      .collection<User>("users")
      .findOne({ userId: patientId });
    if (!patient) {
      res.status(404).json({
        success: false,
        error: {
          message: "Patient not found",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Remove patient from caregiver's patientUserIds array
    const updateResult = await db
      .collection<User>("users")
      .updateOne(
        { userId: caregiverId },
        { $pull: { patientUserIds: patientId } },
      );

    // Delete the patient user
    const deleteResult = await db
      .collection<User>("users")
      .deleteOne({ userId: patientId });

    if (deleteResult.deletedCount === 0) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to delete patient",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Handles adding an existing patient to a caregiver.
 *
 * @param req - The Express request object, expected to contain caregiverId and patientUserId.
 * @param res - The Express response object used to send the response.
 *
 * The function performs the following steps:
 * 1. Validates that both caregiverId and patientUserId are provided.
 * 2. Checks that both users exist and have correct roles.
 * 3. Adds the patient to the caregiver's patientUserIds array.
 * 4. Sets the caregiver as the patient's caregiverId.
 *
 * @returns A JSON response containing either success status or error message.
 */
export const addExistingPatientHandler = async (
  req: Request<{}, {}, TypeBodyAddExistingPatient>,
  res: Response<ResponseAddExistingPatient>,
) => {
  const { caregiverId, patientUserId } = req.body;

  if (!caregiverId || !patientUserId) {
    console.error("Missing required fields:", req.body);
    res.status(400).json({
      success: false,
      error: {
        message: "caregiverId and patientUserId are required",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const db = await getDatabase();

    // Check if caregiver exists
    const caregiver = await db
      .collection<User>("users")
      .findOne({ userId: caregiverId });
    if (!caregiver) {
      res.status(404).json({
        success: false,
        error: {
          message: "Caregiver not found",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Check if patient exists
    const patient = await db
      .collection<User>("users")
      .findOne({ userId: patientUserId });
    if (!patient) {
      res.status(404).json({
        success: false,
        error: {
          message: "Patient not found",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Validate that user can be assigned as patient
    // Only users with role "patient" or "both" can be assigned as patients
    // Users with role "caregiver" cannot be assigned as patients
    if (patient.role === "caregiver") {
      res.status(400).json({
        success: false,
        error: {
          message:
            "Users with 'caregiver' role cannot be assigned as patients. Only users with 'patient' or 'both' roles can be assigned.",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Check if patient is already assigned to this caregiver
    if (caregiver.patientUserIds?.includes(patientUserId)) {
      res.status(400).json({
        success: false,
        error: {
          message: "Patient is already assigned to this caregiver",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Add patient to caregiver's patientUserIds
    await db
      .collection<User>("users")
      .updateOne(
        { userId: caregiverId },
        { $push: { patientUserIds: patientUserId } },
      );

    // Set caregiver for the patient
    await db
      .collection<User>("users")
      .updateOne(
        { userId: patientUserId },
        { $set: { caregiverId: caregiverId } },
      );

    console.log(`Patient ${patientUserId} added to caregiver ${caregiverId}`);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error adding existing patient:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Handles unassigning a patient from a caregiver (without deleting the patient).
 * Only removes the relationship between caregiver and patient.
 */
export const unassignPatientHandler = async (
  req: Request<{}, {}, TypeBodyDeletePatient>,
  res: Response<ResponseDeletePatient>,
) => {
  const { caregiverId, patientId } = req.body;

  if (!caregiverId || !patientId) {
    res.status(400).json({
      success: false,
      error: {
        message: "caregiverId and patientId are required",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const db = await getDatabase();

    // Remove patient from caregiver's patientUserIds array
    await db
      .collection<User>("users")
      .updateOne(
        { userId: caregiverId },
        { $pull: { patientUserIds: patientId } },
      );

    // Remove caregiverId from patient's record
    await db
      .collection<User>("users")
      .updateOne({ userId: patientId }, { $unset: { caregiverId: "" } });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error unassigning patient:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
