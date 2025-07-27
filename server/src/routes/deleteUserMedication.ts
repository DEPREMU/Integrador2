import express, { Request, Response } from "express";
import { deleteUserMedicationFromDB } from "../database/functions.js";

const router = express.Router();

router.post("/deleteUserMedication", async (req: Request, res: Response) => {
  try {
    const { medicationId, userId } = req.body;
    if (!medicationId || !userId) {
      return res.status(400).json({ error: "Faltan campos requeridos: medicationId y userId" });
    }
    const result = await deleteUserMedicationFromDB(medicationId, userId);
    if (!result) {
      return res.status(500).json({ error: "No se pudo eliminar el horario de medicamento" });
    }
    return res.status(200).json({ success: true, deleted: result });
  } catch (error) {
    const err = error as Error;
    return res.status(400).json({ error: err.message });
  }
});

export default router;
