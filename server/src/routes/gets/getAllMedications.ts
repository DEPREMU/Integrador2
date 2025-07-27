import { Request, Response } from "express";
import { getAllMedicationsFromDB } from "../../database/functions.js";

export const getAllMedications = async (req: Request, res: Response) => {
  try {
    const { onlyGetTheseColumns } = req.body;
    const medications = await getAllMedicationsFromDB(onlyGetTheseColumns);
    console.log("Medications sent to frontend:", medications);
    if (!medications || medications.length === 0) {
      return res.status(404).json({ error: "No medications found" });
    }
    return res.status(200).json({ medications });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};