import fs from "fs/promises";
import path from "path";
import type { Plugin } from "vite";

const APP_DIR = path.resolve(__dirname, "..");
const MANIFEST = path.resolve(APP_DIR, "manifest.toml");
const WEBXDC_STUB = path.resolve(__dirname, "webxdc-stub.js");
const ICON = path.resolve(APP_DIR, "../public/icon.jpg");

const resolveWebxdcVersion = async (): Promise<string> => {
  if (process.env.WEBXDC_VERSION) {
    return process.env.WEBXDC_VERSION;
  }

  const manifest = await fs.readFile(MANIFEST, "utf-8");
  const match = manifest.match(/^version\s*=\s*"([^"]+)"/m);
  return match?.[1] ?? "0.0.0";
};

const manifestWithVersion = (content: string, version: string) =>
  content.replace(/^version\s*=.*/m, `version = "${version}"`);

/**
 * WebXDC requires index.html and manifest.toml at the zip root.
 * Vite emits webxdc/index.html when using a nested HTML entry — flatten on build.
 */
export function webxdcPackPlugin(enabled: boolean): Plugin {
  return {
    name: "webxdc-pack",
    apply: "build",
    enforce: "post",
    closeBundle: {
      sequential: true,
      async handler() {
        if (!enabled) {
          return;
        }

        const version = await resolveWebxdcVersion();
        const outDir = path.resolve(APP_DIR, "build-webxdc");
        const nestedHtml = path.join(outDir, "webxdc", "index.html");
        const rootHtml = path.join(outDir, "index.html");

        try {
          await fs.access(nestedHtml);
        } catch {
          throw new Error(
            `WebXDC build failed: expected ${nestedHtml} — cannot create valid .xdc`,
          );
        }

        let html = await fs.readFile(nestedHtml, "utf-8");
        html = html.replace(/(?:\.\.\/)+/g, "");

        // realFinger order: webxdc.js must load before the app bundle so window.webxdc exists
        const webxdcTag = '<script src="webxdc.js"></script>';
        html = html.replace(
          /<script[^>]*src=["']webxdc\.js["'][^>]*><\/script>\s*/gi,
          "",
        );
        html = html.replace(
          /(<script type="module"[^>]*><\/script>)/i,
          `${webxdcTag}$1`,
        );
        html = html.replace(
          /<script>window\.__EXCALIDRAW_BUILD__[^<]*<\/script>\s*/gi,
          "",
        );

        await fs.writeFile(rootHtml, html);

        const manifest = await fs.readFile(MANIFEST, "utf-8");
        await fs.writeFile(
          path.join(outDir, "manifest.toml"),
          manifestWithVersion(manifest, version),
        );

        // realFinger ships webxdc.js in source but the host normally replaces it at runtime;
        // include the minimal stub so the script tag always resolves inside the .xdc zip.
        await fs.copyFile(WEBXDC_STUB, path.join(outDir, "webxdc.js"));

        // Delta Chat only recognizes icon.png or icon.jpg at the zip root.
        await fs.copyFile(ICON, path.join(outDir, "icon.jpg"));
      },
    },
  };
}