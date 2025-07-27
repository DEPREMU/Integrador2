import express from "express";
import { addUserMedication } from "./addUserMedicationController.js";

const router = express.Router();

// POST /addUserMedication
router.post("/addUserMedication", addUserMedication);

export default router;
