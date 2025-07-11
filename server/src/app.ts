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
import { mainUrl, __dirname } from "./config.js";
import path from "path";

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

app.use("/images", express.static(path.join(__dirname, "..", "..", "images")));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1", router);

export default app;
