import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const env = dotenv.config().parsed;

if (!env || env.SUPABASE_URL === undefined || env.SUPABASE_KEY === undefined) {
  throw new Error("Failed to load environment variables");
}

const supabaseUrl = env?.SUPABASE_URL;
const supabaseKey = env?.SUPABASE_KEY;

/**
 * Initializes and exports a Supabase client instance.
 *
 * The `supabase` constant is created using the `createClient` function,
 * which requires a Supabase URL and a Supabase Key for authentication.
 * These values should be securely provided and configured in the environment.
 *
 * @constant
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
