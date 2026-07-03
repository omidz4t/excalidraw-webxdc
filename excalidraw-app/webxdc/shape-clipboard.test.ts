import { EXPORT_DATA_TYPES } from "@excalidraw/common";
import { describe, expect, it } from "vitest";

import {
  decodeShapeXfer,
  encodeShapeXfer,
  extractShapeXferToken,
  parseExcalidrawClipboardJson,
  parsePastedShapeText,
  parseShapeXferToken,
  SHAPE_XFER_PREFIX,
} from "./shape-clipboard";

const SAMPLE_JSON = JSON.stringify({
  type: EXPORT_DATA_TYPES.excalidrawClipboard,
  elements: [
    {
      id: "rect-1",
      type: "rectangle",
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      angle: 0,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: 1,
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
    },
  ],
});

describe("shape clipboard codec", () => {
  it("round-trips clipboard JSON through gzip+base64", () => {
    const token = encodeShapeXfer(SAMPLE_JSON);
    expect(token.startsWith(SHAPE_XFER_PREFIX)).toBe(true);
    expect(decodeShapeXfer(token)).toBe(SAMPLE_JSON);
  });

  it("parses a portable token into elements", () => {
    const token = encodeShapeXfer(SAMPLE_JSON);
    const parsed = parseShapeXferToken(token);
    expect(parsed?.elements).toHaveLength(1);
    expect(parsed?.elements[0].id).toBe("rect-1");
  });

  it("extracts a token embedded in surrounding text", () => {
    const token = encodeShapeXfer(SAMPLE_JSON);
    const wrapped = `copied shape:\n${token}\n`;
    expect(extractShapeXferToken(wrapped)).toBe(token);
  });

  it("rejects invalid tokens", () => {
    expect(parseShapeXferToken("not-a-token")).toBeNull();
    expect(parseShapeXferToken(`${SHAPE_XFER_PREFIX}%%%`)).toBeNull();
  });

  it("parses standard excalidraw clipboard JSON", () => {
    const parsed = parseExcalidrawClipboardJson(SAMPLE_JSON);
    expect(parsed?.elements).toHaveLength(1);
    expect(parsePastedShapeText(SAMPLE_JSON)?.elements).toHaveLength(1);
  });
});