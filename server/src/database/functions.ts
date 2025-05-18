import {
  getDatabase,
  getCollection,
  defaultDatabase,
  defaultCollection,
} from "./connection.js";

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
  collection: string = defaultCollection,
  query: { [key: string]: any },
  database: string = defaultDatabase
) => {
  try {
    const db = await getDatabase(database);
    const coll = await getCollection(collection, db);
    const result = await coll.find(query).toArray();
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
  collection: string = defaultCollection
) => {
  const database = await getDatabase(db);
  const coll = await getCollection(collection, database);

  const result = await coll.findOne({ uuid });
  return result;
};
