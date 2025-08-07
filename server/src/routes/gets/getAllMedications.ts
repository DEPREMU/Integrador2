import { getCollection } from "../../database/functions.js";
import { MedicationApi } from "../../types/Database.js";
import {
  ResponseGetAllMedications,
  TypeBodyGetAllMedications,
} from "./../../types/TypesAPI";
import { Request, Response } from "express";

export const getAllMedications = async (
  req: Request<{}, {}, TypeBodyGetAllMedications>,
  res: Response<ResponseGetAllMedications>,
) => {
  const body: TypeBodyGetAllMedications | null = req.body;
  console.log("getAllMedications called with body:", body);

  const db = await getCollection<MedicationApi>("medicationsApi");

  if (!body) {
    console.log(
      "No body provided in request to getAllMedications, sending all medications",
    );
    const medications = await db?.find({}).toArray();
    if (!medications) {
      console.error("No medications found in the database");
      res.status(505).json({
        medications: [],
        error: {
          message: "No medications found",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    res.json({
      medications: medications || [],
    });
    return;
  }

  const { onlyGetTheseColumns, onlyGetTheseMedicationsById } = body;

  const query: any = {};
  const projection: any = {};

  if (onlyGetTheseMedicationsById && onlyGetTheseMedicationsById.length > 0) {
    console.log("Filtering medications by IDs:", onlyGetTheseMedicationsById);
    query._id = { $in: onlyGetTheseMedicationsById };
  }

  if (onlyGetTheseColumns && onlyGetTheseColumns.length > 0) {
    console.log("Using MongoDB projection for columns:", onlyGetTheseColumns);
    onlyGetTheseColumns.forEach((column) => {
      projection[column] = 1;
    });
    if (
      onlyGetTheseColumns.includes("name_es") ||
      onlyGetTheseColumns.includes("name_fr")
    ) {
      projection.name = 1;
    }
  }

  try {
    const medications = await db?.find(query, { projection }).toArray();

    if (!medications) {
      console.error("No medications found in the database");
      res.status(505).json({
        medications: [],
        error: {
          message: "No medications found",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    let filteredMedications = medications;
    if (onlyGetTheseColumns && onlyGetTheseColumns.length > 0) {
      filteredMedications = medications.map((medication) => {
        const result = { ...medication };
        if (
          onlyGetTheseColumns.includes("name_es") &&
          !result.name_es &&
          result.name
        ) {
          result.name_es = result.name;
        }
        if (
          onlyGetTheseColumns.includes("name_fr") &&
          !result.name_fr &&
          result.name
        ) {
          result.name_fr = result.name;
        }
        return result;
      });
    }

    console.log("sending medications:", filteredMedications.length);
    res.json({
      medications: filteredMedications,
    });
  } catch (error) {
    console.error("Error fetching medications:", error);
    res.status(500).json({
      medications: [],
      error: {
        message: "Error fetching medications",
        timestamp: new Date().toISOString(),
      },
    });
  }
};
