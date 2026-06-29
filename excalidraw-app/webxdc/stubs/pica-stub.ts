type PicaInstance = {
  resize: (
    from: CanvasImageSource,
    to: HTMLCanvasElement,
    options?: unknown,
  ) => Promise<HTMLCanvasElement>;
  toBlob: (
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality?: number,
  ) => Promise<Blob>;
};

const pica = (_options?: { features?: string[] }): PicaInstance => ({
  resize: async (_from, to) => to,
  toBlob: async (canvas, mimeType, quality) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        mimeType,
        quality,
      );
    }),
});

export default pica;