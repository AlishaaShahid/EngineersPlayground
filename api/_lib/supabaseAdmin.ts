import { createClient } from "@supabase/supabase-js";

// Server-side only client. Uses the service role key, which bypasses Row
// Level Security — never import this file from src/ (the browser bundle).
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
