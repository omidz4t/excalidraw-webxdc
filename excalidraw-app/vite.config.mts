import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { VitePWA } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";
import { createHtmlPlugin } from "vite-plugin-html";
import Sitemap from "vite-plugin-sitemap";
import { buildXDC, mockWebxdc } from "@webxdc/vite-plugins";
import { woff2BrowserPlugin } from "../scripts/woff2/woff2-vite-plugins";
import { webxdcDevPlugin } from "./webxdc/webxdc-dev-plugin.mts";
import { webxdcPackPlugin } from "./webxdc/webxdc-pack-plugin.mts";
import {
  webxdcSlimPlugin,
  webxdcZipFilter,
} from "./webxdc/vite-slim-plugin.mts";
export default defineConfig(({ mode, command }) => {
  // To load .env variables
  const envVars = loadEnv(mode, `../`);
  const isWebxdcBuild =
    process.env.VITE_APP_WEBXDC === "true" ||
    envVars.VITE_APP_WEBXDC === "true";
  const webxdcVersion =
    process.env.WEBXDC_VERSION || envVars.WEBXDC_VERSION || "dev";
  // https://vitejs.dev/config/
  return {
    base: isWebxdcBuild && command === "build" ? "./" : undefined,
    server: {
      port: Number(envVars.VITE_APP_PORT || 3000),
      open: !isWebxdcBuild,
      ...(isWebxdcBuild ? { strictPort: true } : {}),
    },
    // We need to specify the envDir since now there are no
    //more located in parallel with the vite.config.ts file but in parent dir
    envDir: "../",
    resolve: {
      alias: [
        ...(isWebxdcBuild
          ? [
              {
                find: "virtual:pwa-register",
                replacement: path.resolve(__dirname, "./webxdc/pwa-stub.ts"),
              },
            ]
          : []),
        {
          find: /^@excalidraw\/common$/,
          replacement: path.resolve(
            __dirname,
            "../packages/common/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/common\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/common/src/$1"),
        },
        {
          find: path.resolve(
            __dirname,
            "../packages/element/src/embeddable.ts",
          ),
          replacement: path.resolve(
            __dirname,
            "./webxdc/stubs/embed-stub.ts",
          ),
        },
        {
          find: /^@excalidraw\/element$/,
          replacement: path.resolve(
            __dirname,
            "../packages/element/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/element\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/element/src/$1"),
        },
        {
          find: /^@excalidraw\/excalidraw$/,
          replacement: path.resolve(
            __dirname,
            "../packages/excalidraw/index.tsx",
          ),
        },
        {
          find: /^@excalidraw\/excalidraw\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/excalidraw/$1"),
        },
        {
          find: /^@excalidraw\/math$/,
          replacement: path.resolve(__dirname, "../packages/math/src/index.ts"),
        },
        {
          find: /^@excalidraw\/math\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/math/src/$1"),
        },
        {
          find: /^@excalidraw\/utils$/,
          replacement: path.resolve(
            __dirname,
            "../packages/utils/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/utils\/(.*?)/,
          replacement: path.resolve(__dirname, "../packages/utils/src/$1"),
        },
        {
          find: /^@excalidraw\/fractional-indexing$/,
          replacement: path.resolve(
            __dirname,
            "../packages/fractional-indexing/src/index.ts",
          ),
        },
        {
          find: /^@excalidraw\/laser-pointer$/,
          replacement: path.resolve(
            __dirname,
            "../packages/laser-pointer/src/index.ts",
          ),
        },
        {
          find: "firebase/app",
          replacement: path.resolve(
            __dirname,
            "./webxdc/stubs/firebase-stub.ts",
          ),
        },
        {
          find: "firebase/firestore",
          replacement: path.resolve(
            __dirname,
            "./webxdc/stubs/firebase-stub.ts",
          ),
        },
        {
          find: "firebase/storage",
          replacement: path.resolve(
            __dirname,
            "./webxdc/stubs/firebase-stub.ts",
          ),
        },
        {
          find: "socket.io-client",
          replacement: path.resolve(
            __dirname,
            "./webxdc/stubs/empty-module.ts",
          ),
        },
        ...(isWebxdcBuild
          ? [
              {
                find: "@excalidraw/mermaid-to-excalidraw",
                replacement: path.resolve(
                  __dirname,
                  "./webxdc/stubs/empty-module.ts",
                ),
              },
              {
                find: "@excalidraw/laser-pointer",
                replacement: path.resolve(
                  __dirname,
                  "./webxdc/stubs/laser-pointer-stub.ts",
                ),
              },
              {
                find: "browser-fs-access",
                replacement: path.resolve(
                  __dirname,
                  "./webxdc/stubs/browser-fs-access-stub.ts",
                ),
              },
              {
                find: "pica",
                replacement: path.resolve(
                  __dirname,
                  "./webxdc/stubs/pica-stub.ts",
                ),
              },
              {
                find: "image-blob-reduce",
                replacement: path.resolve(
                  __dirname,
                  "./webxdc/stubs/image-blob-reduce-stub.ts",
                ),
              },
              {
                find: "fuzzy",
                replacement: path.resolve(
                  __dirname,
                  "./webxdc/stubs/fuzzy-stub.ts",
                ),
              },
            ]
          : []),
      ],
    },
    esbuild:
      isWebxdcBuild && command === "build"
        ? {
            drop: ["console", "debugger"],
            legalComments: "none",
            treeShaking: true,
            minifyIdentifiers: true,
            minifySyntax: true,
            minifyWhitespace: true,
          }
        : undefined,
    define: {
      "import.meta.env.VITE_APP_DISABLE_SENTRY": JSON.stringify("true"),
      "import.meta.env.VITE_APP_ENABLE_TRACKING": JSON.stringify("false"),
      ...(isWebxdcBuild
        ? {
            "import.meta.env.VITE_APP_WEBXDC": JSON.stringify("true"),
            "import.meta.env.VITE_WEBXDC_VERSION":
              JSON.stringify(webxdcVersion),
            "import.meta.env.VITE_APP_ENABLE_PWA": JSON.stringify("false"),
            "import.meta.env.VITE_APP_DISABLE_PREVENT_UNLOAD":
              JSON.stringify("true"),
          }
        : {}),
    },
    build: {
      outDir: isWebxdcBuild ? "build-webxdc" : "build",
      cssCodeSplit: !isWebxdcBuild,
      ...(isWebxdcBuild
        ? {
            target: "es2020",
            reportCompressedSize: true,
          }
        : {}),
      ...(isWebxdcBuild
        ? {
            minify: "esbuild",
          }
        : {}),
      rollupOptions: {
        ...(isWebxdcBuild
          ? {
              treeshake: {
                moduleSideEffects: "no-external",
                propertyReadSideEffects: false,
              },
            }
          : {}),
        input: isWebxdcBuild
          ? {
              webxdc: path.resolve(__dirname, "webxdc/index.html"),
            }
          : path.resolve(__dirname, "index.html"),
        output: {
          inlineDynamicImports: isWebxdcBuild,
          assetFileNames(chunkInfo) {
            if (chunkInfo?.name?.endsWith(".woff2")) {
              const family = chunkInfo.name.split("-")[0];
              return `fonts/${family}/[name][extname]`;
            }

            return "assets/[name]-[hash][extname]";
          },
          // Creating separate chunk for locales except for en and percentages.json so they
          // can be cached at runtime and not merged with
          // app precache. en.json and percentages.json are needed for first load
          // or fallback hence not clubbing with locales so first load followed by offline mode works fine. This is how CRA used to work too.
          manualChunks: isWebxdcBuild
            ? undefined
            : (id) => {
                if (
                  id.includes("packages/excalidraw/locales") &&
                  id.match(/en.json|percentages.json/) === null
                ) {
                  const index = id.indexOf("locales/");
                  // Taking the substring after "locales/"
                  return `locales/${id.substring(index + 8)}`;
                }

                if (id.includes("@excalidraw/mermaid-to-excalidraw")) {
                  return "mermaid-to-excalidraw";
                }

                if (id.includes("@codemirror/") || id.includes("@lezer/")) {
                  return "codemirror.chunk";
                }
              },
        },
      },
      sourcemap: !isWebxdcBuild,
      // don't auto-inline small assets (i.e. fonts hosted on CDN)
      assetsInlineLimit: 0,
    },
    plugins: [
      webxdcSlimPlugin(isWebxdcBuild),
      ...(isWebxdcBuild && command === "serve"
        ? [webxdcDevPlugin(isWebxdcBuild)]
        : []),
      ...(isWebxdcBuild && command === "serve"
        ? [mockWebxdc(path.resolve(__dirname, "../public/webxdc.js"))]
        : []),
      ...(isWebxdcBuild && command === "build"
        ? [webxdcPackPlugin(isWebxdcBuild)]
        : []),
      ...(isWebxdcBuild && command === "build"
        ? [
            buildXDC({
              inDir: "build-webxdc",
              manifest: path.resolve(__dirname, "manifest.toml"),
              outDir: "dist-xdc",
              outFileName: "excalidraw.xdc",
              filter: webxdcZipFilter,
            }),
          ]
        : []),
      ...(isWebxdcBuild
        ? []
        : [
            Sitemap({
              hostname: "https://excalidraw.com",
              outDir: "build",
              changefreq: "monthly",
              // its static in public folder
              generateRobotsTxt: false,
            }),
          ]),
      woff2BrowserPlugin(),
      react(),
      ...(isWebxdcBuild
        ? []
        : [
            checker({
              typescript: true,
              eslint:
                envVars.VITE_APP_ENABLE_ESLINT === "false"
                  ? undefined
                  : { lintCommand: 'eslint "./**/*.{js,ts,tsx}"' },
              overlay: {
                initialIsOpen: envVars.VITE_APP_COLLAPSE_OVERLAY === "false",
                badgeStyle: "margin-bottom: 4rem; margin-left: 1rem",
              },
            }),
          ]),
      svgrPlugin(),
      ViteEjsPlugin(),
      ...(isWebxdcBuild
        ? []
        : [
            VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          /* set this flag to true to enable in Development mode */
          enabled: envVars.VITE_APP_ENABLE_PWA === "true",
        },

        workbox: {
          // don't precache fonts, locales and separate chunks
          globIgnores: [
            "fonts.css",
            "**/locales/**",
            "service-worker.js",
            "**/*.chunk-*.js",
            // CodeMirrorEditor can't be assigned a `.chunk` name via
            // manualChunks because Rollup would hoist shared deps (React)
            // via a static import from the main bundle, defeating lazy
            // loading. So we exclude it by name instead.
            "**/CodeMirrorEditor-*.js",
          ],
          runtimeCaching: [
            {
              urlPattern: new RegExp(".+.woff2"),
              handler: "CacheFirst",
              options: {
                cacheName: "fonts",
                expiration: {
                  maxEntries: 1000,
                  maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
                },
                cacheableResponse: {
                  // 0 to cache "opaque" responses from cross-origin requests (i.e. CDN)
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: new RegExp("fonts.css"),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "fonts",
                expiration: {
                  maxEntries: 50,
                },
              },
            },
            {
              urlPattern: new RegExp("locales/[^/]+.js"),
              handler: "CacheFirst",
              options: {
                cacheName: "locales",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // <== 30 days
                },
              },
            },
            {
              urlPattern: new RegExp("(.chunk-.+|CodeMirrorEditor-.+)\\.js"),
              handler: "CacheFirst",
              options: {
                cacheName: "chunk",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 90, // <== 90 days
                },
              },
            },
          ],
          maximumFileSizeToCacheInBytes: 2.3 * 1024 ** 2, // 2.3MB
        },
        manifest: {
          short_name: "Excalidraw",
          name: "Excalidraw",
          description:
            "Excalidraw is a whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel to them.",
          icons: [
            {
              src: "android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "apple-touch-icon.png",
              type: "image/png",
              sizes: "180x180",
            },
            {
              src: "favicon-32x32.png",
              sizes: "32x32",
              type: "image/png",
            },
            {
              src: "favicon-16x16.png",
              sizes: "16x16",
              type: "image/png",
            },
          ],
          start_url: "/",
          id: "excalidraw",
          display: "standalone",
          theme_color: "#121212",
          background_color: "#ffffff",
          file_handlers: [
            {
              action: "/",
              accept: {
                "application/vnd.excalidraw+json": [".excalidraw"],
              },
            },
          ],
          share_target: {
            action: "/web-share-target",
            method: "POST",
            enctype: "multipart/form-data",
            params: {
              files: [
                {
                  name: "file",
                  accept: [
                    "application/vnd.excalidraw+json",
                    "application/json",
                    ".excalidraw",
                  ],
                },
              ],
            },
          },
          screenshots: [
            {
              src: "/screenshots/virtual-whiteboard.png",
              type: "image/png",
              sizes: "462x945",
            },
            {
              src: "/screenshots/wireframe.png",
              type: "image/png",
              sizes: "462x945",
            },
            {
              src: "/screenshots/illustration.png",
              type: "image/png",
              sizes: "462x945",
            },
            {
              src: "/screenshots/shapes.png",
              type: "image/png",
              sizes: "462x945",
            },
            {
              src: "/screenshots/collaboration.png",
              type: "image/png",
              sizes: "462x945",
            },
            {
              src: "/screenshots/export.png",
              type: "image/png",
              sizes: "462x945",
            },
          ],
        },
            }),
          ]),
      createHtmlPlugin({
        minify: true,
      }),
    ],
    publicDir: "../public",
  };
});
