// A static server over _site, for the sweeps.
//
// WHY A SERVER AND NOT file://. The overflow sweep measures pages inside
// same-origin iframes, and file:// documents are treated as opaque origins by
// Chromium, so the parent cannot read the child's document at all. Serving
// everything from one http origin is what makes the measurement possible.
//
// It is also closer to the real thing: file:// resolves root-relative paths
// like /images/photo/x.webp against the filesystem root, so every image on
// every page would 404 and the overflow and weight numbers would be fiction.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

// `virtual` lets a sweep add a route that is not a built file, such as the
// overflow harness. It has to be served from THIS origin: an iframe and its
// parent can only read each other when the origins match, and that is the
// whole reason the overflow sweep measures the way it does.
export function serve(rootArg, { port = 0, virtual = {} } = {}) {
  // Resolved once, up front. The traversal guard below compares against an
  // absolute path, so a relative root made every request fail the guard and
  // return "forbidden" for the whole site.
  const root = path.resolve(rootArg);

  const server = http.createServer((req, res) => {
    const route = (req.url || "/").split("?")[0];
    if (Object.prototype.hasOwnProperty.call(virtual, route)) {
      const body = virtual[route];
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "content-length": Buffer.byteLength(body),
        "cache-control": "no-store",
      });
      res.end(body);
      return;
    }

    // Strip the query and hash, then resolve. A directory gets index.html,
    // which is how Eleventy writes every page except the root.
    const url = decodeURIComponent((req.url || "/").split("?")[0].split("#")[0]);
    let file = path.join(root, url);

    // Never let a crafted path escape the output directory.
    if (!file.startsWith(root)) {
      res.writeHead(403).end("forbidden");
      return;
    }

    try {
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, "index.html");
      }
      if (!fs.existsSync(file)) {
        res.writeHead(404, { "content-type": "text/plain" }).end("not found");
        return;
      }
      const body = fs.readFileSync(file);
      res.writeHead(200, {
        "content-type": TYPES[path.extname(file)] || "application/octet-stream",
        "content-length": body.length,
        // The weight sweep needs real transfer numbers, so nothing is cached
        // between runs or between pages.
        "cache-control": "no-store",
      });
      res.end(body);
    } catch (err) {
      res.writeHead(500, { "content-type": "text/plain" }).end(String(err));
    }
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      const { port: actual } = server.address();
      resolve({
        origin: `http://127.0.0.1:${actual}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}
