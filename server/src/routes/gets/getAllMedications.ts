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
  let filteredMedications = medications;
  if (!body) {
    console.log(
      "No body provided in request to getAllMedications, sending all medications",
    );
    res.json({
      medications: medications || [],
    });
    return;
  }
  const { onlyGetTheseColumns, onlyGetTheseMedicationsById } = body;

  if (onlyGetTheseMedicationsById && onlyGetTheseMedicationsById?.length > 0) {
    console.log(
      "Filtering medications by onlyGetTheseMedications",
      onlyGetTheseMedicationsById,
    );
    filteredMedications = filteredMedications.filter((medication) =>
      onlyGetTheseMedicationsById.includes(medication._id as unknown as string),
    );
  }
  if (onlyGetTheseColumns && onlyGetTheseColumns?.length > 0) {
    console.log(
      "Filtering medications by onlyGetTheseColumns",
      onlyGetTheseColumns,
    );
    filteredMedications = filteredMedications.map((medication) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filteredMedication: any = {};
      onlyGetTheseColumns.forEach((column) => {
        if (!medication[column]) {
          if (["name_es", "name_fr"].includes(column))
            filteredMedication[column] = medication.name;
          return;
        }
        filteredMedication[column] = medication[column];
      });
      return filteredMedication;
    });
  }

  console.log("sending medications:", filteredMedications.length);
  res.json({
    medications: filteredMedications,
  });
};
