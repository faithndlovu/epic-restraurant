import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Sitemap <loc> values must be absolute. Prefer an explicit SITE_URL,
        // otherwise use the origin this request was served from.
        const baseUrl = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
        const entries = [
          { path: "/", priority: "1.0" },
          { path: "/about" },
          { path: "/menu", priority: "0.9" },
          { path: "/gallery" },
          { path: "/reservations", priority: "0.9" },
          { path: "/contact" },
        ];
        const urls = entries
          .map(
            (e) =>
              `  <url><loc>${baseUrl}${e.path}</loc>${e.priority ? `<priority>${e.priority}</priority>` : ""}</url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
