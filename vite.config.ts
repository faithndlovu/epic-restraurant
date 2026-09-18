import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Native TanStack Start config.
// - resolve.tsconfigPaths: Vite's built-in resolution of the "@/*" alias
// - tailwindcss: Tailwind v4 Vite plugin
// - tanstackStart: TanStack Start (SSR). server.entry="server" routes the SSR
//   handler through src/server.ts (our catastrophic-error wrapper).
// - viteReact: React Fast Refresh / JSX
export default defineConfig({
  server: {
    port: 3000,
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
});
