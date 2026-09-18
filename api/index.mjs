// Vercel Serverless Function (Node runtime) that drives the TanStack Start SSR
// handler. The `vercel.json` rewrite sends every non-static request here.
//
// `dist/server/server.js` is produced by `npm run build` and exports a
// web-standard `{ fetch }` handler; we adapt Node's req/res to/from it.
import { Readable } from "node:stream";
import ssr from "../dist/server/server.js";

export default async function handler(req, res) {
  try {
    const host = req.headers["x-forwarded-host"] ?? req.headers.host;
    const proto = req.headers["x-forwarded-proto"] ?? "https";
    const hasBody = req.method !== "GET" && req.method !== "HEAD";

    const request = new Request(`${proto}://${host}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: hasBody ? Readable.toWeb(req) : undefined,
      duplex: hasBody ? "half" : undefined,
    });

    const response = await ssr.fetch(request, {}, {});

    res.statusCode = response.status;
    // `Headers` joins repeated set-cookie into one comma-separated value, which
    // browsers reject. getSetCookie() preserves them as discrete headers.
    const setCookie = response.headers.getSetCookie?.() ?? [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") return;
      res.setHeader(key, value);
    });
    if (setCookie.length) res.setHeader("set-cookie", setCookie);

    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
}
