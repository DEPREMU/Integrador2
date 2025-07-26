import fs from "fs";
import crypto from "crypto";
import { getDatabase } from "./database/functions.js";
import { CollectionName } from "./types/index.d";

const backupFilePath = `./backups/backup_${new Date().getTime()}.json`;

/**
 * Backs up the database to a JSON file.
 *
 * This function retrieves all users and user configurations from the database
 * and writes them to a local JSON file for backup purposes.
 */
export const backupDatabase = async () => {
  try {
    if (!process.env?.DATABASE_BACKUP_PASSWORD)
      return "Database backup password is not set. Skipping backup.";
    const collections: CollectionName[] = [
      "logs",
      "users",
      "userConfig",
      "imagePaths",
      "medicationsUser",
    ];
    const db = await getDatabase();
    const arrCollections = await Promise.all(
      collections.map((collection) =>
        db.collection(collection).find({}).toArray(),
      ),
    );

    const backupData = Object.fromEntries(
      collections.map((collection, index) => [
        collection,
        arrCollections[index],
      ]),
    );
    const encryptedBackupData = encryptDatabase(
      JSON.stringify(backupData, null, 2),
    );

    fs.writeFileSync(
      backupFilePath,
      JSON.stringify(encryptedBackupData, null, 2),
    );

    console.log("Database backup completed successfully.");
  } catch (error) {
    console.error("Error during database backup:", error);
  }
};

/**
 * Encrypts the database backup data using AES-256-CBC encryption.
 *
 * Uses the DATABASE_BACKUP_PASSWORD environment variable as the encryption key.
 * If the environment variable is not set, throws an error.
 *
 * @param data - The data to encrypt.
 * @returns The encrypted data with IV for later decryption.
 * @throws Error if DATABASE_BACKUP_PASSWORD environment variable is not set.
 */
const encryptDatabase = (data: string): string => {
  const password = process.env?.DATABASE_BACKUP_PASSWORD;

  if (!password) {
    throw new Error(
      "DATABASE_BACKUP_PASSWORD environment variable is required for database encryption",
    );
  }

  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(password, "salt", 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Store IV with encrypted data for later decryption
  return JSON.stringify({ iv: iv.toString("hex"), data: encrypted });
};

/**
 * Decrypts the database backup data using AES-256-CBC decryption.
 *
 * Uses the DATABASE_BACKUP_PASSWORD environment variable as the decryption key.
 * If the environment variable is not set, throws an error.
 *
 * @param encryptedData - The encrypted data string containing IV and encrypted content.
 * @returns The decrypted data string.
 * @throws Error if DATABASE_BACKUP_PASSWORD environment variable is not set or decryption fails.
 */
export const decryptDatabase = (encryptedData: string): string => {
  const password = process.env.DATABASE_BACKUP_PASSWORD;

  if (!password) {
    throw new Error(
      "DATABASE_BACKUP_PASSWORD environment variable is required for database decryption",
    );
  }

  try {
    const { iv, data } = JSON.parse(encryptedData);
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(password, "salt", 32);

    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(iv, "hex"),
    );
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(
      `Failed to decrypt database backup: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
