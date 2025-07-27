export const deleteUserMedicationFromDB = async (medicationId: string, userId: string) => {
  // Elimina el medicamento del usuario en la colección 'medicationsUser'
  try {
    const collection = await getCollection("medicationsUser");
    if (!collection) return false;
    // Convertir medicationId a ObjectId si es posible
    let query: any = { userId };
    try {
      query._id = getObjectId(medicationId);
    } catch {
      query._id = medicationId;
    }
    const result = await collection.deleteOne(query);
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting user medication:", error);
    return false;
  }
};
export const getAllMedicationsFromDB = async (fields: string[] = ["_id", "name_es", "name"]) => {
  // Consulta a la colección de medicamentosApi y solo devuelve los campos solicitados
  const collection = await getCollection("medicationsApi");
  if (!collection) return [];
  // Construir el proyección para MongoDB
  const projection = fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});
  const medications = await collection.find({}, { projection }).toArray();
  return medications;
};
export const getUserMedicationsFromDB = async (userId: string) => {
  // Consulta real: obtiene los medicamentos del usuario desde la colección 'medicationsUser'
  const collection = await getCollection("medicationsUser");
  if (!collection) return [];
  const docs = await collection.find({ userId }).toArray();
  // Mapeo seguro: solo los campos esperados
  return docs.map(doc => ({
    medicationId: doc.medicationId,
    name: doc.name,
    userId: doc.userId,
    dosage: doc.dosage,
    startHour: doc.startHour,
    days: doc.days,
    grams: doc.grams,
    intervalHours: doc.intervalHours,
    stock: doc.stock,
    requiredDoses: doc.requiredDoses,
    urgency: doc.urgency,
    _id: doc._id?.toString(),
  }));
};
import { CollectionName } from "../types/index.js";
import { Collection, Db, Document, ObjectId } from "mongodb";
import { defaultDatabase, defaultCollection, client } from "./connection.js";

/**
 * Asynchronously connects to the MongoDB client and returns the specified database instance.
 *
 * @param database - The name of the database to connect to. Defaults to `defaultDatabase` if not provided.
 * @returns A promise that resolves to the MongoDB database instance.
 * @throws Will throw an error if the connection to the database fails.
 */
export const getDatabase = async (database: string = defaultDatabase) => {
  try {
    await client.connect();
    return client.db(database);
  } catch (error) {
    console.error("Error connecting to the database", error);
    throw error;
  }
};

/**
 * Retrieves a MongoDB collection from the specified database. If the collection does not exist, it is created.
 *
 * @param collection - The name of the collection to retrieve. Defaults to `defaultCollection`.
 * @param database - The database instance or the name of the database. Defaults to `defaultDatabase`.
 * @returns A promise that resolves to the requested MongoDB collection.
 * @throws Will throw an error if there is an issue retrieving or creating the collection.
 */
export const getCollection = async <T extends Document = Document>(
  collection: CollectionName = defaultCollection,
  database: string | Db = defaultDatabase,
): Promise<Collection<T> | null> => {
  try {
    let db = database as Db;

    if (typeof database === "string") db = await getDatabase(database);

    return db.collection<T>(collection);
  } catch (error) {
    console.error("Error getting the collection", error);
    throw error;
  }
};

/**
 * Finds documents in a specified MongoDB collection that match the given query.
 *
 * @param collection - The name of the collection to search in. Defaults to `defaultCollection`.
 * @param query - An object representing the MongoDB query to filter documents.
 * @param database - The name of the database to use. Defaults to `defaultDatabase`.
 * @returns A promise that resolves to an array of documents matching the query.
 * @throws Will throw an error if the database or collection cannot be accessed, or if the query fails.
 */
export const findInCollection = async (
  collection: CollectionName = defaultCollection,
  query: { [key: string]: unknown },
  database: string = defaultDatabase,
) => {
  try {
    const coll = await getCollection(collection, database);
    const result = await coll?.find(query).toArray();
    return result;
  } catch (error) {
    console.error("Error finding in collection", error);
    throw error;
  }
};

/**
 * Retrieves user data from the specified database and collection using the provided UUID.
 *
 * @param uuid - The unique identifier of the user to retrieve.
 * @param db - (Optional) The name of the database to use. Defaults to `defaultDatabase`.
 * @param collection - (Optional) The name of the collection to use. Defaults to `defaultCollection`.
 * @returns A promise that resolves to the user data object if found, or `null` if not found.
 */
export const getUserData = async (
  uuid: string,
  db: string = defaultDatabase,
  collection: CollectionName = defaultCollection,
) => {
  const database = await getDatabase(db);
  const coll = await getCollection(collection, database);

  const result = await coll?.findOne({ uuid });
  return result;
};

export const createCollections = async () => {
  const db = await getDatabase();

  const collections = await db.listCollections().toArray();
  const existing = collections.map((col) => col.name);

  const requiredCollections: CollectionName[] = [
    "users",
    "medicationsApi",
    "medicationsUser",
    "imagePaths",
    "userConfig",
  ];

  for (const name of requiredCollections) {
    if (!existing.includes(name)) {
      await db.createCollection(name);
      console.log(`🗂️ Created collection: ${name}`);
    } else {
      console.log(`✔️ Collection exists: ${name}`);
    }
  }
};

export const getObjectId = (id: string) => new ObjectId(id);
