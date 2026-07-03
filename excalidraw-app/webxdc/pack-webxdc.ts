import { zipSync } from "fflate";

import { BOOTSTRAP_SCENE_FILENAME } from "./bootstrap-scene";
import {
  extractAssetPathsFromHtml,
  PACKAGE_MANIFEST_FILENAME,
  REQUIRED_PACKAGE_FILES,
  type WebxdcPackageManifest,
} from "./package-manifest";

const fetchAsBytes = async (zipPath: string): Promise<Uint8Array | null> => {
  try {
    const url = new URL(zipPath, window.location.href).href;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
};

const loadPackagePaths = async (): Promise<string[]> => {
  try {
    const response = await fetch(
      new URL(`./${PACKAGE_MANIFEST_FILENAME}`, window.location.href).href,
    );
    if (response.ok) {
      const manifest = (await response.json()) as WebxdcPackageManifest;
      if (Array.isArray(manifest.files) && manifest.files.length > 0) {
        return manifest.files;
      }
    }
  } catch {
    // Fall back to parsing index.html below.
  }

  const indexResponse = await fetch(
    new URL("./index.html", window.location.href).href,
  );
  if (!indexResponse.ok) {
    return [...REQUIRED_PACKAGE_FILES];
  }

  return extractAssetPathsFromHtml(await indexResponse.text());
};

export const canPackWebxdcPackage = async () => {
  try {
    const response = await fetch(
      new URL("./manifest.toml", window.location.href).href,
    );
    return response.ok;
  } catch {
    return false;
  }
};

export const collectWebxdcPackageFiles = async (): Promise<
  Record<string, Uint8Array>
> => {
  const paths = await loadPackagePaths();
  const files: Record<string, Uint8Array> = {};
  const missing: string[] = [];

  for (const zipPath of paths) {
    if (
      zipPath === BOOTSTRAP_SCENE_FILENAME ||
      zipPath === PACKAGE_MANIFEST_FILENAME
    ) {
      continue;
    }

    const bytes = await fetchAsBytes(zipPath);
    if (bytes) {
      files[zipPath] = bytes;
    } else {
      missing.push(zipPath);
    }
  }

  if (missing.length > 0) {
    throw new Error(`pack-missing-files:${missing.join(",")}`);
  }

  for (const required of REQUIRED_PACKAGE_FILES) {
    if (!files[required]) {
      throw new Error(`pack-missing-root:${required}`);
    }
  }

  return files;
};

export const buildWebxdcPackageBlob = async (
  bootstrapSceneJson: string,
  downloadName = "excalidraw.xdc",
) => {
  const files = await collectWebxdcPackageFiles();

  files[BOOTSTRAP_SCENE_FILENAME] = new TextEncoder().encode(bootstrapSceneJson);

  const manifestFiles = [
    ...Object.keys(files).filter(
      (name) =>
        name !== PACKAGE_MANIFEST_FILENAME &&
        name !== BOOTSTRAP_SCENE_FILENAME,
    ),
    BOOTSTRAP_SCENE_FILENAME,
    PACKAGE_MANIFEST_FILENAME,
  ].sort();

  files[PACKAGE_MANIFEST_FILENAME] = new TextEncoder().encode(
    JSON.stringify({ version: 1, files: manifestFiles }, null, 2),
  );

  const zipped = zipSync(files);

  return new Blob([zipped], {
    type: downloadName.endsWith(".xdc")
      ? "application/x-xdc"
      : "application/zip",
  });
};