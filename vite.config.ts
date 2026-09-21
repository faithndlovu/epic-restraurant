import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Native TanStack Start config.
// - resolve.tsconfigPaths: Vite's built-in resolution of the "@/*" alias
// - tailwindcss: Tailwind v4 Vite plugin
// - tanstackStart: TanStack Start (SSR). server.entry="server" routes the SSR
//   handler through src/server.ts (our catastrophic-error wrapper).
// - viteReact: React Fast Refresh / JSX
export default defineConfig(({ mode }) => {
  // Empty prefix: load every key from .env files *and* the real process
  // environment, not just the VITE_-prefixed ones.
  const env = loadEnv(mode, process.cwd(), "");

  // The browser needs the project URL and the publishable key. Vite only
  // inlines import.meta.env.VITE_*, which means the same two values have to be
  // configured twice — once prefixed for the client, once unprefixed for SSR —
  // and a host that has only the unprefixed pair silently ships a client bundle
  // with `undefined` in it. That is a white screen on every page, because the
  // header builds an auth client on mount.
  //
  // So: accept either spelling and inject the result ourselves. Only these two
  // values are ever exposed. SUPABASE_SERVICE_ROLE_KEY must never appear here —
  // it bypasses RLS and anything defined below is readable by every visitor.
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || "";

  // Fail the build rather than deploy a bundle that cannot work. A missing key
  // is otherwise invisible until a visitor's browser throws.
  if (!supabaseUrl || !supabaseKey) {
    const missing = [
      ...(!supabaseUrl ? ["SUPABASE_URL (or VITE_SUPABASE_URL)"] : []),
      ...(!supabaseKey ? ["SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)"] : []),
    ].join(", ");
    throw new Error(
      `[vite] Cannot build the client without: ${missing}. ` +
        `Set them in .env locally, or in your host's environment variables for deploys.`,
    );
  }

  return {
    server: {
      port: 3000,
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey),
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        server: { entry: "server" },
      }),
      viteReact(),
    ],
  };
});
