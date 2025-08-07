import app from "./app.js";
import fs from "fs";
import https from "https";
import { hostname } from "./config.js";
import { setupWebSocket } from "./websocket.js";
import { backupDatabase } from "./backupDB.js";

backupDatabase();

const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/api.meditime.space/privkey.pem"),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/api.meditime.space/fullchain.pem",
  ),
};

const server = https.createServer(sslOptions, app);

setupWebSocket(server);

server.listen(443, hostname, () => {
  console.log(`✅ HTTPS Server listening on https://${hostname}`);
  console.log(`✅ WebSocket server running on wss://${hostname}`);
});

server.on("error", (error) => {
  console.error("❌ Error starting HTTPS server:", error);
  process.exit(1);
});
