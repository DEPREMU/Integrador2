import jwt from "jsonwebtoken";
import { env } from "../env.js";
import jwksClient from "jwks-rsa";
import { createClient } from "@supabase/supabase-js";

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

const client = jwksClient({
  jwksUri: "https://urxljwhsvseynhccwcis.supabase.co/auth/v1/keys",
});

export const verifySupabaseToken = async (token: string) => {
  const decoded = jwt.decode(token, { complete: true });
  const kid = decoded?.header?.kid;
  const key = await client.getSigningKey(kid);
  const signingKey = key.getPublicKey();

  const isValid = jwt.verify(token, signingKey, {
    algorithms: ["RS256"],
  });

  return isValid;
};
