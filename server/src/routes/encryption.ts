import { Request, Response } from "express";
import {
  RequestDecrypt,
  RequestEncrypt,
  ResponseDecrypt,
  ResponseEncrypt,
} from "../types/TypesAPI";
import crypto from "crypto";

/**
 * The secret key used for encryption and decryption operations.
 *
 * This value is retrieved from the environment variable `SECRET_KEY_TO_ENCRYPTION`.
 * If the environment variable is not set, a default 32-character hexadecimal string is used.
 *
 * @remarks
 * - Ensure that the secret key is kept secure and not exposed in version control.
 * - The default value is intended for development purposes only and should be overridden in production.
 */
const SECRET_KEY =
  process.env.SECRET_KEY_TO_ENCRYPTION || "0123456789abcdef0123456789abcdef";

/**
 * Initialization Vector (IV) used for encryption algorithms.
 *
 * The value is retrieved from the environment variable `IV` if set,
 * otherwise it defaults to "abcdef9876543210".
 *
 * @remarks
 * The IV should be a unique and unpredictable value for each encryption operation
 * to ensure security. Using a static or predictable IV can compromise the security
 * of the encrypted data.
 */
const IV = process.env.IV || "abcdef9876543210";

/**
 * The encryption algorithm used for cryptographic operations.
 *
 * Uses AES (Advanced Encryption Standard) with a 256-bit key in CBC (Cipher Block Chaining) mode.
 * This algorithm provides a strong level of security for encrypting sensitive data.
 *
 * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv}
 */
const algorithm = "aes-256-cbc";

/**
 * Encrypts a given plaintext string using a symmetric encryption algorithm.
 *
 * @param text - The plaintext string to be encrypted.
 * @returns The encrypted text encoded in base64 format.
 *
 * @remarks
 * This function uses the specified `algorithm`, `SECRET_KEY`, and `IV` to create a cipher.
 * The input text is encrypted and the result is returned as a base64-encoded string.
 */
const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(SECRET_KEY),
    Buffer.from(IV)
  );
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
};

/**
 * Decrypts a given base64-encoded encrypted text using the specified algorithm, secret key, and initialization vector (IV).
 *
 * @param encryptedText - The encrypted string in base64 format to be decrypted.
 * @returns The decrypted plain text string.
 *
 * @throws {Error} If decryption fails due to invalid input or configuration.
 */
const decrypt = (encryptedText: string): string => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(SECRET_KEY),
    Buffer.from(IV)
  );
  let decrypted = decipher.update(encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

/**
 * Handles encryption requests.
 *
 * Receives data to encrypt from the request body, encrypts it using the `encrypt` function,
 * and returns the encrypted data in the response. If encryption fails, responds with a 500 error
 * and an error message.
 *
 * @param req - Express request object containing the data to encrypt in the body.
 * @param res - Express response object used to send the encrypted data or an error message.
 * @returns A promise that resolves when the response is sent.
 */
export const encryptHandler = async (
  req: Request<{}, {}, RequestEncrypt>,
  res: Response<ResponseEncrypt>
) => {
  const { dataToEncrypt } = req.body;

  try {
    const encryptedData = encrypt(dataToEncrypt);
    res.status(200).json({ dataEncrypted: encryptedData });
  } catch (error) {
    console.error("Encryption error:", error);
    res.status(500).json({
      error: {
        message: "Encryption failed",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Handles the decryption of data sent in the request body.
 *
 * @param req - Express request object containing the data to decrypt in the body.
 * @param res - Express response object used to send the decrypted data or an error response.
 * @returns A JSON response with the decrypted data if successful, or an error message if decryption fails.
 *
 * @remarks
 * Expects `dataToDecrypt` in the request body. On success, responds with `{ dataDecrypted }`.
 * On failure, responds with an error object containing a message and timestamp.
 */
export const decryptHandler = async (
  req: Request<{}, {}, RequestDecrypt>,
  res: Response<ResponseDecrypt>
) => {
  const { dataToDecrypt } = req.body;

  try {
    const decryptedData = decrypt(dataToDecrypt);
    console.log("Decrypted data:", decryptedData);
    res.status(200).json({ dataDecrypted: decryptedData });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({
      error: {
        message: "Decryption failed",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
