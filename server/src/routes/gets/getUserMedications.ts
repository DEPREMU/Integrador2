import {
  ResponseGetUserMedications,
  TypeBodyGetUserMedications,
} from "../../types";
import { Request, Response } from "express";

export const getUserMedications = async (
  req: Request<{}, {}, TypeBodyGetUserMedications>,
  res: Response<ResponseGetUserMedications>,
) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({
      medications: [],
      error: {
        message: "User ID is required",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }
};
