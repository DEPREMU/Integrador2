import express from 'express';
import { deleteUserMedicationFromDB } from '../database/functions.js';
const router = express.Router();

// POST /deleteUserMedication
router.post('/deleteUserMedication', async (req, res) => {
  try {
    const { medicationId, userId } = req.body;
    if (!medicationId || !userId) {
      return res.status(400).json({ error: 'Faltan campos requeridos: medicationId y userId' });
    }
    const result = await deleteUserMedicationFromDB(medicationId, userId);
    if (!result) {
      return res.status(500).json({ error: 'No se pudo eliminar el horario de medicamento' });
    }
    return res.status(200).json({ success: true, deleted: result });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
