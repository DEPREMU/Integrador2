import { WebSocket } from "ws";
import { RequestLogs } from "../types/TypesAPI";
import { getCollection } from "../database/functions.js";

export const logsHandler = async (socket: WebSocket, message: RequestLogs) => {
  const { log, timestamp } = message;

  const collection = await getCollection("logs");
  await collection?.insertOne({
    log,
    timestamp,
  });
};
