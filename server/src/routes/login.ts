import { Request, Response } from "express";
import { TypeBodyLogin, ResponseLogin } from "../TypesAPI.js";

/**
 * Handles the login request by validating the request body and returning a response.
 *
 * @param req - The Express request object, expected to contain a body of type `TypeBodyLogin`.
 * @param res - The Express response object used to send the response.
 *
 * The function performs the following steps:
 * 1. Checks if the request body is present. If not, responds with an error message.
 * 2. Validates that both `username` and `password` are provided in the request body.
 *    If either is missing, responds with an error message.
 * 3. (TODO) Implements the login logic to authenticate the user.
 * 4. Returns a placeholder response with a fake token and user ID.
 *
 * @returns A JSON response containing either:
 * - `data`: null or an object with a token and user information, or
 * - `error`: null or an object with an error message and timestamp.
 */
export const loginHandler = (
  req: Request<{}, {}, TypeBodyLogin>,
  res: Response<ResponseLogin>
) => {
  const body: TypeBodyLogin = req.body;

  

  if (!body) {
    res.json({
      data: null,
      error: { message: "Missing body", timestamp: new Date().toISOString() },
    });
    return;
  }
  if (!body.username || !body.password) {
    res.json({
      data: null,
      error: {
        message: "Missing username or password",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // TODO: Implement login logic
  //! Continue...
};
