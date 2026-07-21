import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values."
  );
}

// Browser client. Uses @supabase/ssr so the session is persisted in cookies
// (not localStorage) — that's what lets middleware.ts and Server Components
// read the same session on the server.
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
