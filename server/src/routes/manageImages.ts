import fs from "fs";
import path from "path";
import { __dirname } from "../config.js";
import { ImagePath } from "../types/Database.js";
import { getDatabase } from "../database/functions.js";
import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";

let IMAGES_DIR = path.join(__dirname, "..", "..", "images");
if (!IMAGES_DIR.includes("server"))
  IMAGES_DIR = path.join(__dirname, "..", "images");
if (!IMAGES_DIR.includes("server")) IMAGES_DIR = path.join(__dirname, "images");

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

/**
 * Multer storage configuration for handling image uploads.
 *
 * This storage engine saves uploaded files to the directory specified by `IMAGES_DIR`.
 * The uploaded file's name is prefixed with the current timestamp (in milliseconds)
 * followed by a hyphen and the original file name to ensure uniqueness and prevent
 * filename collisions.
 *
 * @see https://github.com/expressjs/multer#diskstorage
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

/**
 * Filters uploaded files to allow only image files based on their MIME type.
 *
 * @param _req - The incoming HTTP request (unused).
 * @param file - The file object provided by Multer.
 * @param cb - The callback to indicate whether the file should be accepted.
 *
 * @remarks
 * If the file's MIME type starts with "image/", the file is accepted.
 * Otherwise, an error is passed to the callback, rejecting non-image files.
 */
const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

/**
 * Multer middleware configuration for handling image uploads.
 *
 * @remarks
 * - Uses a custom `storage` engine for storing uploaded files.
 * - Applies the `imageFilter` function to restrict uploads to image files only.
 * - Limits the maximum file size to 5 MB.
 *
 * @see {@link https://github.com/expressjs/multer#readme | Multer documentation}
 */
export const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * Handles the reception of uploaded images from a multipart/form-data request.
 *
 * Expects files to be available on `req.files` (as provided by Multer middleware).
 * If no files are uploaded, responds with HTTP 400 and an error message.
 * On success, responds with HTTP 201 and a JSON object containing information
 * about the uploaded files (filename and accessible path).
 *
 * @param req - Express request object, expected to contain uploaded files.
 * @param res - Express response object used to send the response.
 *
 * @returns void
 */
export const handleReceiveImages = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const body = req.body as { userId: string };

  if (!files || files.length === 0) {
    console.error("No images uploaded:", files, "\nBody:", body);
    res.status(400).json({ message: "No images uploaded." });
    return;
  }
  const fileInfos = files.map((file) => ({
    filename: file.filename,
    path: `/images/${file.filename}`,
    userId: body.userId,
  }));
  const db = await getDatabase();
  await Promise.all([
    db.collection<ImagePath>("imagePaths").insertMany(fileInfos),
    db
      .collection("users")
      .updateOne(
        { userId: body.userId },
        { $set: { imageId: fileInfos[0].path } },
      ),
  ]);

  console.log("Images uploaded successfully:", fileInfos);
  res.status(201).json({
    success: true,
    message: "Images uploaded successfully.",
    files: fileInfos,
  });
};

export { IMAGES_DIR };
