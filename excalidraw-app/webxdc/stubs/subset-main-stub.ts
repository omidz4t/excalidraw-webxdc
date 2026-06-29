export const subsetWoff2GlyphsByCodepoints = async (
  arrayBuffer: ArrayBuffer,
  _codePoints: ArrayLike<number>,
) => {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return `data:font/woff2;base64,${btoa(binary)}`;
};