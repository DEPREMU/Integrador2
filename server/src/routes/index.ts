import {
  upload,
  handleReceiveImages,
  handleReceiveImagesOnly,
} from "./manageImages.js";
import {
  getUserPatients,
  getAllMedications,
  getUserMedications,
} from "./gets/index.js";
import {
  sendMessageHandler,
  clearHistoryHandler,
  getConversationsHandler,
} from "./chatbot/chatbot.js";
import {
  createPatientHandler,
  deletePatientHandler,
  addExistingPatientHandler,
  unassignPatientHandler,
} from "./patientManagement.js";
import express from "express";
import { RoutesAPI } from "../types/TypesAPI.js";
import { logsHandler } from "./logs.js";
import { RequestHandler } from "express";
import { searchUserHandler } from "./searchUser.js";
import { updateUserDataHandler } from "./updateUserData.js";
import { loginHandler, signUpHandler } from "./auth.js";
import { decryptHandler, encryptHandler } from "./encryption.js";
// ...existing code...

/**
 * Creates an instance of an Express router to define and manage
 * application routes. This router serves as a modular way to handle
 * route definitions and middleware for the server.
 */
const router = express.Router();

type RouteConfig = {
  handler: RequestHandler;
  middlewares?: RequestHandler[];
};

const routes: { [key: string]: RouteConfig } = {
  "/login": { handler: loginHandler },
  "/encrypt": { handler: encryptHandler },
  "/decrypt": { handler: decryptHandler },
  "/logs": { handler: logsHandler },
  "/upload": {
    handler: handleReceiveImages,
    middlewares: [upload.array("images")],
  },
  "/uploadOnly": {
    handler: handleReceiveImagesOnly,
    middlewares: [upload.array("images")],
  },
  "/signup": { handler: signUpHandler },
  "/updateUserData": { handler: updateUserDataHandler },
  "/getUserPatients": { handler: getUserPatients },
  "/getUserMedications": { handler: getUserMedications },
  "/getAllMedications": { handler: getAllMedications },
};


Object.entries(routes).forEach(([path, { handler, middlewares = [] }]) => {
  if (path === "/addUserMedication") return; // handled by router.use below
  router.post(path, ...middlewares, handler);
});

// Endpoint para agregar horario de medicamento
// Endpoint para agregar y eliminar horario de medicamento
import addUserMedicationRouter from "./addUserMedication.js";
import deleteUserMedicationRouter from "./deleteUserMedication.js";
router.use(addUserMedicationRouter);
router.use(deleteUserMedicationRouter);

export default router;
