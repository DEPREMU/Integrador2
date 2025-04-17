import express from "express";
import { loginHandler } from "./login.js";

/**
 * Creates an instance of an Express router to define and manage
 * application routes. This router serves as a modular way to handle
 * route definitions and middleware for the server.
 */
const router = express.Router();

// All routes are prefixed with /api
router.post("/login", loginHandler);

export default router;
