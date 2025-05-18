import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_KEY;

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
