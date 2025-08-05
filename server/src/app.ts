/**
 * @fileoverview This file initializes and configures the main Express application.
 * It sets up middleware, routes, and server configurations for the application.
 *
 * @requires cors - Middleware for enabling Cross-Origin Resource Sharing (CORS).
 * @requires express - Web framework for building server-side applications.
 * @requires ./routes - Custom router module for handling API routes.
 * @requires ./config - Configuration module containing application constants like `mainUrl` and `__dirname`.
 */
import cors from "cors";
import router from "./routes/index.js";
import express from "express";
import { mainUrl } from "./config.js";
import { IMAGES_DIR } from "./routes/manageImages.js";

/**
 * The main Express application instance.
 * This serves as the central part of the server where middleware, routes,
 * and other configurations are applied.
 */
const app: express.Application = express();

app.use(
  cors({
    origin: mainUrl,
    credentials: true,
  }),
);

app.use("/images", express.static(IMAGES_DIR));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/closeServer", () => process.exit(1)); // For testing purposes

app.use("/api/v1", router);

export default app;
