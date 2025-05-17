import { Request, Response } from "express";
import {
  RequestDecrypt,
  RequestEncrypt,
  ResponseDecrypt,
  ResponseEncrypt,
} from "../TypesAPI";
import crypto from "crypto";

const SECRET_KEY =
  process.env.SECRET_KEY_TO_ENCRYPTION || "0123456789abcdef0123456789abcdef";
const IV = process.env.IV || "abcdef9876543210";

const algorithm = "aes-256-cbc";

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
