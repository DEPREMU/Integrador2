import app from "./app.js";
import { createServer } from "http";
import { port, hostname } from "./config.js";
import { setupWebSocket } from "./websocket.js";
import { backupDatabase } from "./backupDB.js";

backupDatabase();

const server = createServer(app);

setupWebSocket(server);

server.listen(port, hostname, () => {
  console.log(`HTTP Server listening on http://${hostname}:${port}`);
  console.log(`WebSocket server running on ws://${hostname}:${port}`);
});

server.on("error", (error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
