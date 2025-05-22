import express from "express";
import { logsHandler } from "./logs.js";
import { loginHandler } from "./login.js";
import { RequestHandler } from "express";
import { upload, handleReceiveImages } from "./manageImages.js";
import { decryptHandler, encryptHandler } from "./encryption.js";

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

type Route = "/login" | "/encrypt" | "/decrypt" | "/upload" | "/logs";

const routes: Record<Route, RouteConfig> = {
  "/login": { handler: loginHandler },
  "/encrypt": { handler: encryptHandler },
  "/decrypt": { handler: decryptHandler },
  "/logs": { handler: logsHandler },
  "/upload": {
    handler: handleReceiveImages,
    middlewares: [upload.array("images")],
  },
};

Object.entries(routes).forEach(([path, { handler, middlewares = [] }]) => {
  router.post(path, ...middlewares, handler);
});

export default router;
