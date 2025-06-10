import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Constants?.expoConfig?.extra?.SUPABASE_URL;
const supabaseKey = Constants?.expoConfig?.extra?.SUPABASE_KEY;

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
