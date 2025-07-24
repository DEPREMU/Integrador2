import express from "express";
import { RoutesAPI } from "../types/TypesAPI.js";
import { logsHandler } from "./logs.js";
import { RequestHandler } from "express";
import { updateUserDataHandler } from "./updateUserData.js";
import { loginHandler, signUpHandler } from "./auth.js";
import {
  upload,
  handleReceiveImages,
  handleReceiveImagesOnly,
} from "./manageImages.js";
import { decryptHandler, encryptHandler } from "./encryption.js";
import {
  getAllMedications,
  getUserMedications,
  getUserPatients,
} from "./gets/index.js";
import {
  createPatientHandler,
  deletePatientHandler,
  addExistingPatientHandler,
  unassignPatientHandler,
} from "./patientManagement.js";
import { searchUserHandler } from "./searchUser.js";
import { validatePatientUniquenessHandler } from "./validatePatientUniqueness.js";

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

const routes: Record<RoutesAPI, RouteConfig> = {
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
  "/createPatient": { handler: createPatientHandler },
  "/deletePatient": { handler: deletePatientHandler },
  "/addExistingPatient": { handler: addExistingPatientHandler },
  "/unassignPatient": { handler: unassignPatientHandler },
  "/searchUser": { handler: searchUserHandler },
  "/validatePatientUniqueness": { handler: validatePatientUniquenessHandler },
};

Object.entries(routes).forEach(([path, { handler, middlewares = [] }]) => {
  router.post(path, ...middlewares, handler);
});

export default router;
