const express = require('express');
const router = express.Router();
const { MedicationUserModel } = require('../src/database/functions');

// POST /addUserMedication
router.post('/addUserMedication', async (req, res) => {
  try {
    const { medication } = req.body;
    if (!medication) {
      return res.status(400).json({ success: false, error: { message: 'No medication data provided' } });
    }
    // Guarda el nuevo horario en la base de datos
    const newMedication = await MedicationUserModel.create(medication);
    res.json({ success: true, medication: newMedication });
  } catch (error) {
    res.json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
