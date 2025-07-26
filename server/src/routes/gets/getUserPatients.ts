import { Request, Response } from "express";
import {
  User,
  MedicationUser,
  ResponseGetUserPatients,
  TypeBodyGetUserPatients,
} from "../../types/index.d";
import { getCollection } from "../../database/functions.js";

export const getUserPatients = async (
  req: Request<{}, {}, TypeBodyGetUserPatients>,
  res: Response<ResponseGetUserPatients>,
) => {
  const { userId } = req.body;
  console.log("getUserPatients called with userId:", userId);
  if (!userId) {
    console.error("User ID is required", req.body);
    res.status(400).json({
      patients: [],
      error: {
        message: "User ID is required",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const coll = await getCollection<User>("users");
    const collMedications = await getCollection<User>("medicationsUser");
    const user = await coll?.findOne({ userId });
    if (!user) {
      res.status(404).json({
        patients: [],
        error: {
          message: "User not found",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const patientUserIds = (user.patientUserIds || []).map((id) => id);
    const patients = await coll
      ?.find({ userId: { $in: patientUserIds } })
      .toArray();

    let newPatients: Promise<User>[] | User[] = [];
    if (patients && patients.length > 0) {
      newPatients = patients.map(async (patient) => {
        try {
          const patientTyped = patient as User;

          const medications = await collMedications
            ?.find({ userId: patientTyped.userId })
            .toArray();
          return {
            ...patientTyped,
            medications: (medications as unknown as MedicationUser[]) || [],
          } as User;
        } catch (error) {
          console.error("Error fetching medications for patient:", error);
          return patient as User;
        }
      });
    }
    newPatients = await Promise.all(newPatients);

    res.status(200).json({
      patients: newPatients || [],
    });
  } catch (error) {
    console.error("Error fetching user patients:", error);
  }
};
