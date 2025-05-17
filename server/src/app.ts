/**
 * @fileoverview This file initializes and configures the main Express application.
 * It sets up middleware, routes, and server configurations for the application.
 *
 * @requires cors - Middleware for enabling Cross-Origin Resource Sharing (CORS).
 * @requires express - Web framework for building server-side applications.
 * @requires ./Routes - Custom router module for handling API routes.
 * @requires ./config - Configuration module containing application constants like `mainUrl` and `port`.
 */
import cors from "cors";
import router from "./routes/index.js";
import express from "express";
import { mainUrl } from "./config.js";

/**
 * The main Express application instance.
 * This serves as the central part of the server where middleware, routes,
 * and other configurations are applied.
 */
const app: express.Application = express();

// Block connections that are not from mainUrl
app.use(
  cors({
    origin: mainUrl,
    credentials: true,
  })
);

// Use json for response
app.use(express.json());

// Use prefix /api in each route
app.use("/api/v1", router);

export default app;
