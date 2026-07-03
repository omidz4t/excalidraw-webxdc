#!/usr/bin/env bash
set -euo pipefail

VERSION=$(bun -e "console.log(require('./package.json').version)")
VERSION_DASH=$(bun -e "console.log(require('./package.json').version.replace(/\./g, '-'))")

sed -i "s/^version = .*/version = \"${VERSION}\"/" excalidraw-app/manifest.toml
WEBXDC_VERSION="${VERSION}" bun run build:webxdc

mkdir -p dist
rm -f "dist/excalidraw_v${VERSION_DASH}.xdc" "dist/excalidraw_v${VERSION_DASH}.zip"
cp "excalidraw-app/dist-xdc/excalidraw.xdc" "dist/excalidraw_v${VERSION_DASH}.xdc"
(
  cd excalidraw-app/build-webxdc
  zip -r "../../dist/excalidraw_v${VERSION_DASH}.zip" .
)

echo "Created dist/excalidraw_v${VERSION_DASH}.xdc and dist/excalidraw_v${VERSION_DASH}.zip"