import express from "express";
import { RoutesAPI } from "../types/TypesAPI.js";
import { logsHandler } from "./logs.js";
import { RequestHandler } from "express";
import { updateUserDataHandler } from "./updateUserData.js";
import { loginHandler, signUpHandler } from "./auth.js";
import { upload, handleReceiveImages } from "./manageImages.js";
import { decryptHandler, encryptHandler } from "./encryption.js";
import {
  getAllMedications,
  getUserMedications,
  getUserPatients,
} from "./gets/index.js";

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
  "/uploadOnly": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/signup": { handler: signUpHandler },
  "/updateUserData": { handler: updateUserDataHandler },
  "/getUserPatients": { handler: getUserPatients },
  "/getUserMedications": { handler: getUserMedications },
  "/getAllMedications": { handler: getAllMedications },
  "/addUserMedication": { handler: (req, res, next) => next() },
  "/deleteUserMedication": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/createPatient": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/deletePatient": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/unassignPatient": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/addExistingPatient": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/searchUser": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/validatePatientUniqueness": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/chatbot/getConversations": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/chatbot/sendMessage": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
  "/chatbot/clearHistory": { handler: (req, res) => res.status(501).json({ error: "Not implemented" }) },
};

Object.entries(routes).forEach(([path, { handler, middlewares = [] }]) => {
  router.post(path, ...middlewares, handler);
});

export default router;
