import fs from "fs";
import path from "path";
import type { Connect, Plugin } from "vite";

const APP_DIR = path.resolve(__dirname, "..");
const MANIFEST = path.resolve(APP_DIR, "manifest.toml");
const WEBXDC_HTML = path.resolve(__dirname, "index.html");
const WEBXDC_SHIM = path.resolve(APP_DIR, "../public/webxdc.js");

const wantsHtml = (req: Connect.IncomingMessage) =>
  (req.headers.accept ?? "").includes("text/html");

const isWebxdcPage = (pathname: string) =>
  pathname === "/webxdc/" ||
  pathname === "/webxdc" ||
  pathname === "/webxdc/index.html";

const keepWebxdcSourcePath = (pathname: string) =>
  pathname === "/webxdc/" ||
  pathname === "/webxdc" ||
  pathname === "/webxdc/index.html" ||
  pathname === "/webxdc/index.tsx" ||
  pathname.startsWith("/webxdc/Webxdc") ||
  pathname.startsWith("/webxdc/pointer-ref") ||
  pathname.startsWith("/webxdc/constants") ||
  pathname.startsWith("/webxdc/webxdc-realtime-channel") ||
  pathname.startsWith("/webxdc/user-colors") ||
  pathname.startsWith("/webxdc/import-image") ||
  pathname.startsWith("/webxdc/y-excalidraw/") ||
  pathname.startsWith("/webxdc/stubs/") ||
  pathname === "/webxdc/manifest.toml";

/**
 * webxdc-dev proxies to http://localhost:PORT/webxdc/ and prepends that
 * prefix to every request path. Rewrite those paths back so Vite can serve
 * dev assets (@vite/client, node_modules, …) and app sources.
 */
const rewriteProxiedWebxdcPath = (req: Connect.IncomingMessage) => {
  if (!req.url) {
    return;
  }

  const [pathname, search = ""] = req.url.split("?");
  const suffix = search ? `?${search}` : "";

  if (pathname.startsWith("/webxdc/webxdc/")) {
    req.url = `${pathname.replace(/^\/webxdc\/webxdc/, "/webxdc")}${suffix}`;
    return;
  }

  if (!pathname.startsWith("/webxdc/") || keepWebxdcSourcePath(pathname)) {
    return;
  }

  req.url = `${pathname.replace(/^\/webxdc/, "")}${suffix}`;
};

/**
 * Dev-only helpers for webxdc-dev:
 * - rewrite proxied /webxdc/* paths for Vite dev assets
 * - serve manifest.toml (required by webxdc-dev sidebar)
 * - fix Vite returning empty HTML for /webxdc/ when Accept: text/html
 * - redirect / to /webxdc/
 */
export function webxdcDevPlugin(enabled: boolean): Plugin {
  return {
    name: "webxdc-dev",
    enforce: "pre",
    apply: "serve",
    configureServer(server) {
      if (!enabled) {
        return;
      }

      // Must run before Vite's indexHtmlMiddleware (post-configureServer
      // middleware runs too late — the root index.html is already sent).
      server.middlewares.use((req, res, next) => {
        rewriteProxiedWebxdcPath(req);

        const url = req.url?.split("?")[0] ?? "";

        if (url === "/manifest.toml" || url === "/webxdc/manifest.toml") {
          res.setHeader("Content-Type", "application/toml; charset=utf-8");
          res.end(fs.readFileSync(MANIFEST, "utf-8"));
          return;
        }

        // Relative <script src="webxdc.js"> from /webxdc/ → /webxdc/webxdc.js
        if (url === "/webxdc/webxdc.js" || url === "/webxdc.js") {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
          res.end(fs.readFileSync(WEBXDC_SHIM, "utf-8"));
          return;
        }

        if (url === "/") {
          res.statusCode = 302;
          res.setHeader("Location", "/webxdc/");
          res.end();
          return;
        }

        if (!wantsHtml(req) || !isWebxdcPage(url)) {
          return next();
        }

        const rawHtml = fs.readFileSync(WEBXDC_HTML, "utf-8");
        server
          .transformIndexHtml("/webxdc/index.html", rawHtml, req.originalUrl)
          .then((html) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
          })
          .catch((error) => {
            next(error);
          });
      });
    },
  };
}