export const PACKAGE_MANIFEST_FILENAME = "package-manifest.json";

export type WebxdcPackageManifest = {
  version: 1;
  files: string[];
};

export const REQUIRED_PACKAGE_FILES = [
  "index.html",
  "manifest.toml",
  "webxdc.js",
  "icon.jpg",
] as const;

export const extractAssetPathsFromHtml = (html: string): string[] => {
  const paths = new Set<string>(REQUIRED_PACKAGE_FILES);
  const pattern = /(?:src|href)=["']([^"']+)["']/gi;

  for (const match of html.matchAll(pattern)) {
    const ref = match[1];
    if (
      !ref ||
      ref.startsWith("data:") ||
      ref.startsWith("http") ||
      ref.startsWith("//")
    ) {
      continue;
    }
    paths.add(ref.replace(/^\.\//, ""));
  }

  return [...paths];
};