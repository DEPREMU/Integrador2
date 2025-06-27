import { RequestLogs } from "../types/TypesAPI";
import { getCollection } from "../database/functions.js";
import { Request, Response } from "express";

export const logsHandler = async (
  req: Request<{}, {}, RequestLogs>,
  res: Response
) => {
  const { log, timestamp } = req.body;

  const collection = await getCollection("logs");
  await collection?.insertOne({
    log,
    timestamp,
  });

  res.status(200).json({});
};
