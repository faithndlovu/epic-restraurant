// Portable production server for the TanStack Start build.
//
// `npm run build` emits:
//   - dist/client  : static assets (JS/CSS chunks, /images, robots.txt, ...)
//   - dist/server  : the SSR handler (dist/server/server.js, a web-standard { fetch })
//
// This server serves the static files and pipes everything else through the
// SSR fetch handler. It runs on any Node host (Render, Railway, Fly, a VPS, ...).
//
// Usage:  node --env-file-if-exists=.env server/prod.mjs   (see "start" script)
import { createServer } from "node:http";
import { Readable } from "node:stream";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const clientDir = join(root, "dist", "client");
const port = Number(process.env.PORT) || 3000;

const { default: ssr } = await import(new URL("../dist/server/server.js", import.meta.url).href);

const MIME = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function extname(path) {
  const i = path.lastIndexOf(".");
  return i < 0 ? "" : path.slice(i).toLowerCase();
}

// Resolve a request path to a real file inside dist/client, or null.
async function resolveStatic(pathname) {
  if (pathname === "/" || pathname.endsWith("/")) return null;
  // Prevent path traversal: normalized path must stay under clientDir. Compare
  // against clientDir + separator so a sibling like dist/client-secrets, which
  // shares the prefix, cannot pass the check.
  const filePath = normalize(join(clientDir, decodeURIComponent(pathname)));
  if (!filePath.startsWith(clientDir + sep)) return null;
  try {
    const s = await stat(filePath);
    return s.isFile() ? filePath : null;
  } catch {
    return null;
  }
}

function toWebRequest(req) {
  // Most Node hosts terminate TLS at a proxy, so trust the forwarded proto/host.
  // The CSRF middleware compares the browser's Origin against this URL; a
  // hard-coded http:// would reject every same-site request made over https.
  const proto = req.headers["x-forwarded-proto"]?.split(",")[0].trim() ?? "http";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? `localhost:${port}`;
  const url = `${proto}://${host}${req.url}`;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: hasBody ? "half" : undefined,
  });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const file = await resolveStatic(url.pathname);
    if (file) {
      const isImmutable = url.pathname.startsWith("/assets/");
      res.writeHead(200, {
        "content-type": MIME[extname(file)] ?? "application/octet-stream",
        "cache-control": isImmutable
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600",
      });
      createReadStream(file).pipe(res);
      return;
    }

    const response = await ssr.fetch(toWebRequest(req), {}, {});
    // Object.fromEntries would collapse repeated set-cookie headers into one
    // comma-separated value; getSetCookie() keeps them separate.
    const headers = Object.fromEntries(
      [...response.headers.entries()].filter(([key]) => key.toLowerCase() !== "set-cookie"),
    );
    const setCookie = response.headers.getSetCookie?.() ?? [];
    if (setCookie.length) headers["set-cookie"] = setCookie;
    res.writeHead(response.status, headers);
    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`Production server running on http://localhost:${port}`);
});
