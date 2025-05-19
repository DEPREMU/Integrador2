import express from "express";
import { loginHandler } from "./login.js";
import { upload, handleReceiveImages } from "./manageImages.js";
import { decryptHandler, encryptHandler } from "./encryption.js";

/**
 * Creates an instance of an Express router to define and manage
 * application routes. This router serves as a modular way to handle
 * route definitions and middleware for the server.
 */
const router = express.Router();

// All routes are prefixed with /api/v1
router.post("/login", loginHandler);
router.post("/encrypt", encryptHandler);
router.post("/decrypt", decryptHandler);
router.post("/upload", upload.array("images"), handleReceiveImages);

export default router;
