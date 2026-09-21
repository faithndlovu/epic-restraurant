// Server-only. Load inside server function handlers:
//   const { createUserClient } = await import("@/lib/admin.server");
import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";
import { realtimeTransport } from "@/integrations/supabase/realtime-transport";

/**
 * A Supabase client that acts as the user who made this request, using the
 * bearer token the browser attaches to every server function call
 * (see src/integrations/supabase/auth-attacher.ts).
 *
 * Deliberately NOT the service-role client: queries go through RLS, so the
 * database itself decides whether this user is an admin. A non-admin who calls
 * an admin server function simply matches no rows.
 */
export function createUserClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY. Set them in your .env file.",
    );
  }

  const auth = getRequest()?.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (!token) throw new Error("You must be signed in to do that.");

  return createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    realtime: { transport: realtimeTransport },
  });
}
