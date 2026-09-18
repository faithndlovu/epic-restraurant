import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Native TanStack Start config. (This project previously used a third-party
// build wrapper plugin; these are the equivalent first-party plugins.)
// - tsConfigPaths: resolves the "@/*" alias from tsconfig.json
// - tailwindcss: Tailwind v4 Vite plugin
// - tanstackStart: TanStack Start (SSR). server.entry="server" routes the SSR
//   handler through src/server.ts (our catastrophic-error wrapper).
// - viteReact: React Fast Refresh / JSX
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
  ],
});
