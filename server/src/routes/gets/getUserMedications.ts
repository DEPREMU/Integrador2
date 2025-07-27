import { Request, Response } from "express";
import { getUserMedicationsFromDB } from "../../database/functions.js";
import { MedicationUser } from "../../types/TypesSchedule";

export const getUserMedications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Falta el userId" });
    }
    const medications: MedicationUser[] = await getUserMedicationsFromDB(userId);
    return res.status(200).json({ medications });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};