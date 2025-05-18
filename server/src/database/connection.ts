import { env } from "../env.js";
import { Db, MongoClient } from "mongodb";

const uri = env.MONGO_URI;

export const defaultDatabase = "MediTimeDB";
export const defaultCollection = "MediTimeDB";
/**
 * MongoDB client instance used to interact with the database.
 *
 * @remarks
 * This client should be used for all database operations within the application.
 * Make sure to connect and close the client appropriately to manage resources.
 *
 * @public
 */
export const client: MongoClient = new MongoClient(uri);

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
 * Retrieves a MongoDB collection from the specified database.
 *
 * @param collection - The name of the collection to retrieve. Defaults to `defaultCollection`.
 * @param database - The database name as a string or a `Db` instance. Defaults to `defaultDatabase`.
 * @returns A Promise that resolves to the requested collection.
 * @throws Will throw an error if the collection cannot be retrieved.
 */
export const getCollection = async (
  collection: string = defaultCollection,
  database: string | Db = defaultDatabase
) => {
  try {
    if (typeof database === "string") {
      const db = await getDatabase(database);
      return db.collection(collection);
    }
    return database.collection(collection);
  } catch (error) {
    console.error("Error getting the collection", error);
    throw error;
  }
};
