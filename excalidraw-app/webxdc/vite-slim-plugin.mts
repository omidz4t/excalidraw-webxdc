import fs from "fs/promises";
import path from "path";
import { PurgeCSS } from "purgecss";
import type { OutputChunk, OutputAsset } from "rollup";
import type { Plugin } from "vite";

import { applyOfflineTransforms } from "./offline-transforms.mts";

const STUBS_DIR = path.resolve(__dirname, "./stubs");

/** Stubs for features that require network access — always applied. */
const OFFLINE_STUBS: Array<{ match: RegExp; stub: string }> = [
  { match: /LibraryMenu$/, stub: "library-menu-stub.tsx" },
  { match: /PublishLibrary$/, stub: "null-component.tsx" },
  { match: /LibraryMenuBrowseButton$/, stub: "null-component.tsx" },
  { match: /\/analytics$/, stub: "analytics-stub.ts" },
  { match: /HelpDialog$/, stub: "null-component.tsx" },
  { match: /element\/src\/embeddable/, stub: "embed-stub.ts" },
];

const SOURCE_STUBS: Array<{ match: RegExp; stub: string }> = [
  { match: /(^|\/)charts$/, stub: "charts-stub.ts" },
  { match: /TTDDialog/, stub: "ttd-dialog-stub.tsx" },
  { match: /PasteChartDialog$/, stub: "paste-chart-dialog-stub.tsx" },
  { match: /ImageExportDialog$/, stub: "null-component.tsx" },
  { match: /JSONExportDialog$/, stub: "null-component.tsx" },
  { match: /\/Stats$/, stub: "null-component.tsx" },
  { match: /CommandPalette\/CommandPalette$/, stub: "command-palette-stub.tsx" },
  { match: /welcome-screen\/WelcomeScreen$/, stub: "null-component.tsx" },
  { match: /laserTrails$/, stub: "laser-trails-stub.ts" },
  { match: /DiagramToCodePlugin/, stub: "null-component.tsx" },
  { match: /DefaultSidebar$/, stub: "default-sidebar-stub.tsx" },
  { match: /ShareableLinkDialog$/, stub: "null-component.tsx" },
  { match: /FollowMode\/FollowMode$/, stub: "follow-mode-stub.tsx" },
  {
    match: /live-collaboration\/LiveCollaborationTrigger$/,
    stub: "live-collaboration-stub.tsx",
  },
  { match: /LaserPointerButton$/, stub: "null-component.tsx" },
  { match: /subset\/subset-main$/, stub: "subset-main-stub.ts" },
  { match: /subset\/subset-shared\.chunk$/, stub: "empty-module.ts" },
  { match: /subset\/subset-worker\.chunk$/, stub: "empty-module.ts" },
  { match: /subset\/woff2\/woff2-loader$/, stub: "empty-module.ts" },
];

const STRIP_SCSS_PATTERNS = [
  /CommandPalette\.scss$/,
  /welcome-screen\//,
  /HelpDialog\.scss$/,
  /TTDDialog/,
  /LibraryMenu\.scss$/,
  /LibraryUnit\.scss$/,
  /PublishLibrary\.scss$/,
  /ImageExportDialog\.scss$/,
  /ExportDialog\.scss$/,
  /MermaidToExcalidraw\.scss$/,
  /LiveCollaborationTrigger\.scss$/,
  /FollowMode\.scss$/,
  /ShareableLinkDialog\.scss$/,
  /PasteChartDialog/,
  /Card\.scss$/,
  /QuickSearch\.scss$/,
  /plus-banner/,
  /encrypted-icon/,
  /FooterCenter\.scss$/,
  /App\.scss$/,
];

const SLIM_LOCALE_IMPORT =
  /currentLangData = await import\(`\.\/locales\/\$\{currentLang\.code\}\.json`\);/;

const SLIM_LOCALE_IMPORT_FIX = "currentLangData = fallbackLangData;";

const SLIM_LANGUAGES_ARRAY =
  /export const languages: Language\[\] = \[[\s\S]*?\n\];/;

const SLIM_LANGUAGES_ARRAY_FIX = `export const languages: Language[] = [defaultLang];`;

const FONT_IMPORTS_TO_STRIP = [
  "Cascadia",
  "ComicShanns",
  "Emoji",
  "Excalifont",
  "Helvetica",
  "Liberation",
  "Lilita",
  "Nunito",
  "Xiaolai",
] as const;

const FONT_INITS_TO_STRIP = [
  'init("Cascadia"',
  'init("Comic Shanns"',
  'init("Excalifont"',
  'init("Helvetica"',
  'init("Liberation Sans"',
  'init("Lilita One"',
  'init("Nunito"',
  "init(CJK_HAND_DRAWN_FALLBACK_FONT",
  "init(WINDOWS_EMOJI_FALLBACK_FONT",
] as const;

const EXCLUDED_ASSET_PATTERNS = [
  /^subset-shared\.chunk-/,
  /^subset-worker\.chunk-/,
  /^CodeMirrorEditor-/,
  /^mermaid/i,
  /^cytoscape\./i,
  /-definition-/i,
  /^diagram-/i,
  /^DesktopOnlyFeatures-/,
  /^katex-/,
  /^chunk-[A-Z0-9]+-/,
  /^treemap-/,
  /^cose-bilkent/,
  /^pica-/,
  /^qrcode\.chunk-/,
  /^random-username/,
  /^graph-/,
  /^linear-/,
  /^ordinal-/,
  /^roundRect-/,
  /^defaultLocale-/,
  /^_baseUniq-/,
  /^(ar-SA|bg-BG|ca-ES|cs-CZ|de-DE|el-GR|es-ES|eu-ES|fa-IR|fi-FI|fr-FR|gl-ES|he-IL|hi-IN|hu-HU|id-ID|it-IT|ja-JP|kab-KAB|kk-KZ|ko-KR|ku-TR|lt-LT|lv-LV|mr-IN|my-MM|nb-NO|nl-NL|nn-NO|oc-FR|pa-IN|pl-PL|pt-BR|pt-PT|ro-RO|ru-RU|sk-SK|sl-SI|sv-SE|ta-IN|th-TH|tr-TR|uk-UA|vi-VN|zh-CN|zh-TW|km-KH)-/,
];

const WEBXDC_FONTS_CSS = `/* webxdc: self-hosted UI fonts */
@font-face {
  font-family: "Assistant";
  src: url(../fonts/Assistant/Assistant-Regular.woff2) format("woff2");
  font-weight: 400;
  font-style: normal;
  display: swap;
}
@font-face {
  font-family: "Assistant";
  src: url(../fonts/Assistant/Assistant-Medium.woff2) format("woff2");
  font-weight: 500;
  font-style: normal;
  display: swap;
}
@font-face {
  font-family: "Assistant";
  src: url(../fonts/Assistant/Assistant-SemiBold.woff2) format("woff2");
  font-weight: 600;
  font-style: normal;
  display: swap;
}
@font-face {
  font-family: "Assistant";
  src: url(../fonts/Assistant/Assistant-Bold.woff2) format("woff2");
  font-weight: 700;
  font-style: normal;
  display: swap;
}`;

const EXCLUDED_FILE_NAMES = new Set([
  "service-worker.js",
  "og-image-3.png",
  "oss_promo_comments_dark.jpg",
  "oss_promo_comments_light.jpg",
  "oss_promo_presentations_dark.svg",
  "oss_promo_presentations_light.svg",
  "logo.png",
  "logo.jpg",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "maskable_icon_x192.png",
  "maskable_icon_x512.png",
  "favicon.ico",
  "favicon.svg",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "Cascadia.woff2",
  "Virgil.woff2",
  "robots.txt",
  "_headers",
]);

const KEPT_FONT_FILES = new Set([
  "Assistant-Regular.woff2",
  "Assistant-Medium.woff2",
  "Assistant-SemiBold.woff2",
  "Assistant-Bold.woff2",
  "Virgil-Regular.woff2",
]);

const KEPT_FONT_DIRS = new Set(["Virgil", "Assistant"]);

const PURGE_SAFELIST = {
  standard: [
    "html",
    "body",
    "root",
    "dark",
    "light",
    /^excalidraw/,
    /^ToolIcon/,
    /^Island/,
    /^popover/,
    /^Popover/,
    /^radix/,
    /^rt-/,
    /^ReactModal/,
    /^layer-ui/,
    /^App-/,
    /^mobile-menu/,
    /^dropdown-menu/,
    /^color-picker/,
    /^ColorPicker/,
    /^properties-panel/,
    /^Button/,
    /^Dialog/,
    /^Modal/,
    /^Toast/,
    /^LoadingMessage/,
    /^UserList/,
    /^theme--/,
    /^is-/,
    /^has-/,
    /^HintViewer/,
    /^FixedSideContainer/,
    /^Stack/,
    /^Section/,
    /^sidebar/,
    /^Sidebar/,
    /^OverwriteConfirm/,
    /^ErrorDialog/,
    /^EyeDropper/,
    /^PenMode/,
    /^Shape/,
    /^CompactShape/,
    /^SelectedShape/,
    /^Range/,
    /^FontPicker/,
    /^TextField/,
    /^SVGLayer/,
    /^ToolPopover/,
    /^main-menu/,
    /^MainMenu/,
    /^confirm-dialog/,
    /^active/,
    /^selected/,
    /^disabled/,
    /^open/,
    /^closed/,
    /^visible/,
    /^hidden/,
    /^show/,
    /^hide/,
  ],
  deep: [/data-state/, /data-side/, /data-radix/, /aria-/],
  greedy: [/^excalidraw/, /^ToolIcon/, /^popover/, /^radix/],
  keyframes: true,
  variables: true,
};

function stripOptionalFonts(code: string): string {
  let next = code;

  for (const font of FONT_IMPORTS_TO_STRIP) {
    next = next.replace(
      new RegExp(`import\\s+\\{[^}]+\\}\\s+from\\s+"\\.\\/${font}";\\s*`, "g"),
      "",
    );
  }

  for (const init of FONT_INITS_TO_STRIP) {
    next = next.replace(
      new RegExp(
        `${init.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^;]*;`,
        "g",
      ),
      "",
    );
  }

  return next;
}

function shouldExcludeAsset(fileName: string): boolean {
  const baseName = path.basename(fileName);
  return (
    EXCLUDED_ASSET_PATTERNS.some((pattern) => pattern.test(baseName)) ||
    fileName.includes("/locales/") ||
    fileName.includes("fonts/Xiaolai/")
  );
}

function shouldStripScss(id: string): boolean {
  return STRIP_SCSS_PATTERNS.some((pattern) => pattern.test(id));
}

async function purgeCssAssets(
  bundle: Record<string, OutputAsset | OutputChunk>,
) {
  const jsSources = Object.values(bundle)
    .filter((item): item is OutputChunk => item.type === "chunk")
    .map((chunk) => chunk.code);

  if (!jsSources.length) {
    return;
  }

  for (const [fileName, asset] of Object.entries(bundle)) {
    if (asset.type !== "asset" || !fileName.endsWith(".css")) {
      continue;
    }

    const css =
      typeof asset.source === "string"
        ? asset.source
        : new TextDecoder().decode(asset.source);

    const [purged] = await new PurgeCSS().purge({
      content: [
        ...jsSources.map((code) => ({ raw: code, extension: "js" })),
        {
          raw: await fs.readFile(
            path.resolve(__dirname, "index.html"),
            "utf-8",
          ),
          extension: "html",
        },
      ],
      css: [{ raw: css }],
      defaultExtractor: (content) =>
        content.match(/[A-Za-z0-9-_/:.%[\]()]+(?<!:)/g) ?? [],
      safelist: PURGE_SAFELIST,
      fontFace: true,
    });

    if (purged?.css) {
      asset.source = purged.css;
    }
  }
}

export function webxdcSlimPlugin(enabled: boolean): Plugin {
  return {
    name: "webxdc-slim",
    enforce: "pre",
    resolveId(source) {
      const offlineStub = OFFLINE_STUBS.find(({ match }) => match.test(source));
      if (offlineStub) {
        return path.resolve(STUBS_DIR, offlineStub.stub);
      }

      if (!enabled) {
        return null;
      }

      const stub = SOURCE_STUBS.find(({ match }) => match.test(source));

      if (stub) {
        return path.resolve(STUBS_DIR, stub.stub);
      }

      return null;
    },
    transform(code, id) {
      const offline = applyOfflineTransforms(code, id);
      if (offline) {
        code = offline.code;
      }

      if (!enabled) {
        return offline ? { code, map: null } : null;
      }

      if (id.endsWith(".scss") && shouldStripScss(id)) {
        return { code: "/* webxdc: stripped */", map: null };
      }

      if (id.endsWith("/excalidraw-app/index.scss")) {
        return {
          code: `.excalidraw-app.is-collaborating [data-testid="clear-canvas-button"] { display: none; }`,
          map: null,
        };
      }

      if (id.endsWith("/packages/excalidraw/index.tsx")) {
        return {
          code: code
            .replace(
              /import WelcomeScreen from "\.\/components\/welcome-screen\/WelcomeScreen";\n/,
              "",
            )
            .replace(/export \{ WelcomeScreen \};\n/, ""),
          map: null,
        };
      }

      if (id.endsWith("/packages/excalidraw/i18n.ts")) {
        return {
          code: code
            .replace(SLIM_LOCALE_IMPORT, SLIM_LOCALE_IMPORT_FIX)
            .replace(SLIM_LANGUAGES_ARRAY, SLIM_LANGUAGES_ARRAY_FIX),
          map: null,
        };
      }

      if (id.endsWith("/packages/excalidraw/fonts/Fonts.ts")) {
        return {
          code: stripOptionalFonts(code),
          map: null,
        };
      }

      if (id.endsWith("/components/App.tsx")) {
        let next = offline?.code ?? code;
        next = next.replace(
          /if \(!isPlainPaste && isMaybeMermaidDefinition\(data\.text\)\) \{[\s\S]*?\n {6}return;\n {4}\}/,
          "if (false) { /* mermaid disabled for webxdc */ }",
        );

        next = next.replace(
          /if \(!isPlainPaste && data\.text\) \{\s*const result = tryParseSpreadsheet\(data\.text\);[\s\S]*?\n {6}return;\n {4}\}/,
          "if (false) { /* charts disabled for webxdc */ }",
        );

        next = next.replace(
          /import \{\s*copyTextToSystemClipboard,\s*parseClipboard,\s*parseDataTransferEvent,\s*type ParsedDataTransferFile,\s*\} from "\.\.\/clipboard";/,
          `import {
  copyTextToSystemClipboard,
  createPasteEvent,
  parseClipboard,
  parseDataTransferEvent,
  readSystemClipboard,
  type ParsedDataTransferFile,
} from "../clipboard";`,
        );

        next = next.replace(
          /if \(event && !isExcalidrawActive\) \{\s*return;\s*\}\s*const elementUnderCursor = document\.elementFromPoint\(\s*this\.lastViewportPosition\.x,\s*this\.lastViewportPosition\.y,\s*\);\s*if \(\s*event &&\s*\(!\(elementUnderCursor instanceof HTMLCanvasElement\) \|\|\s*isWritableElement\(target\)\)\s*\) \{\s*return;\s*\}/,
          `if (
        event &&
        !isExcalidrawActive &&
        target !== document.body &&
        target !== document.documentElement
      ) {
        return;
      }

      if (event && isWritableElement(target)) {
        return;
      }`,
        );

        next = next.replace(
          /const dataTransferList = await parseDataTransferEvent\(event\);\s*const filesList = dataTransferList\.getFiles\(\);/,
          `let dataTransferList = await parseDataTransferEvent(event);

      let filesList = dataTransferList.getFiles();
      if (event && filesList.length === 0) {
        try {
          const types = await readSystemClipboard();
          if (Object.keys(types).length > 0) {
            dataTransferList = await parseDataTransferEvent(
              createPasteEvent({ types }),
            );
            filesList = dataTransferList.getFiles();
          }
        } catch {
          /* clipboard fallback unavailable */
        }
      }`,
        );

        next = next.replace(
          /if \(!this\.state\.showWelcomeScreen && !elements\.length\) \{\s*this\.setState\(\{ showWelcomeScreen: true \}\);\s*\}/,
          "/* webxdc: welcome screen disabled */",
        );

        return {
          code: next,
          map: null,
        };
      }

      if (id.endsWith("/packages/excalidraw/fonts/fonts.css")) {
        return {
          code: WEBXDC_FONTS_CSS,
          map: null,
        };
      }

      if (id.endsWith("/packages/excalidraw/fonts/ExcalidrawFontFace.ts")) {
        return {
          code: code.replace(
            /urls\.push\(new URL\(assetUrl, ExcalidrawFontFace\.ASSETS_FALLBACK_URL\)\);/,
            "// webxdc: no external font CDN fallback (CSP font-src self only)",
          ),
          map: null,
        };
      }

      return offline ? { code, map: null } : null;
    },
    async generateBundle(_options, bundle) {
      if (!enabled) {
        return;
      }

      for (const fileName of Object.keys(bundle)) {
        if (shouldExcludeAsset(fileName)) {
          delete bundle[fileName];
          continue;
        }

        if (
          fileName.includes("/fonts/") &&
          !KEPT_FONT_FILES.has(path.basename(fileName))
        ) {
          delete bundle[fileName];
        }
      }

      await purgeCssAssets(bundle);
    },
  };
}

export function webxdcZipFilter(
  fileName: string,
  filePath: string,
  isDirectory: boolean,
): boolean {
  if (fileName.endsWith("~")) {
    return false;
  }

  if (isDirectory) {
    if (
      fileName === "screenshots" ||
      fileName === "webxdc" ||
      fileName === "Xiaolai" ||
      (filePath.includes("/fonts/") && !KEPT_FONT_DIRS.has(fileName))
    ) {
      return false;
    }
    return true;
  }

  if (EXCLUDED_FILE_NAMES.has(fileName)) {
    return false;
  }

  if (
    fileName === "Assistant-Regular.woff2" &&
    !filePath.includes(`${path.sep}fonts${path.sep}Assistant${path.sep}`)
  ) {
    return false;
  }

  if (
    filePath.includes("/screenshots/") ||
    filePath.includes("/fonts/Xiaolai/")
  ) {
    return false;
  }

  if (filePath.includes("/fonts/")) {
    return KEPT_FONT_FILES.has(fileName);
  }

  const baseName = path.basename(fileName);
  if (filePath.includes("/assets/") && shouldExcludeAsset(baseName)) {
    return false;
  }

  return true;
}