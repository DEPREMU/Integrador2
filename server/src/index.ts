import app from "./app.js";
import { port } from "./config.js";
import { createServer } from "http";
import { setupWebSocket } from "./websocket.js";
import { backupDatabase } from "./backupDB.js";

backupDatabase();

const server = createServer(app);

setupWebSocket(server);

server.listen(port, () => {
  console.log(`HTTP Server listening on port ${port}`);
  console.log(`WebSocket server running on ws://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
