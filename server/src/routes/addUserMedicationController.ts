import { Request, Response } from "express";
import { MedicationUser } from "../types/TypesSchedule";
import { getCollection } from "../database/functions.js";
import { ObjectId } from "mongodb";

export const addUserMedication = async (req: Request, res: Response) => {
  try {
    // DEBUG: Mostrar el cuerpo recibido
    console.log('addUserMedication - req.body:', req.body);
    const { medication } = req.body;
    if (!medication) {
      return res.status(400).json({ success: false, error: { message: "No medication data provided" } });
    }
    // Validar campos requeridos
    const requiredFields = [
      "medicationId", "name", "userId", "dosage", "startHour", "days", "grams", "intervalHours", "stock", "requiredDoses", "urgency"
    ];
    for (const field of requiredFields) {
      if (medication[field] === undefined || medication[field] === null || medication[field] === "") {
        return res.status(400).json({ success: false, error: { message: `Falta el campo requerido: ${field}` } });
      }
    }
    if (typeof medication.grams !== "number" || medication.grams <= 0) {
      return res.status(400).json({ success: false, error: { message: "La dosis debe ser un número positivo" } });
    }
    if (typeof medication.intervalHours !== "number" || medication.intervalHours <= 0) {
      return res.status(400).json({ success: false, error: { message: "El intervalo debe ser un número positivo" } });
    }
    if (!Array.isArray(medication.days) || medication.days.length === 0) {
      return res.status(400).json({ success: false, error: { message: "Debes seleccionar al menos un día" } });
    }
    // Convert medicationId to ObjectId if needed
    if (medication.medicationId && typeof medication.medicationId === "string") {
      medication.medicationId = new ObjectId(medication.medicationId);
    }
    const collection = await getCollection<MedicationUser>("medicationsUser");
    if (!collection) {
      return res.status(500).json({ success: false, error: { message: "No se pudo acceder a la colección de horarios" } });
    }
    const result = await collection.insertOne(medication);
    const saved = await collection.findOne({ _id: result.insertedId });
    res.json({ success: true, medication: saved });
  } catch (error: any) {
    res.json({ success: false, error: { message: error?.message || String(error) } });
  }
};
