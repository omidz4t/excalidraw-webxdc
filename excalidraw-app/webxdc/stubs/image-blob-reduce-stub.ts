type ReduceEnv = {
  out_canvas: HTMLCanvasElement;
  pica: {
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
};

const imageBlobReduce = () => ({
  toBlob: async (env: ReduceEnv, outputType: string) =>
    env.pica.toBlob(env.out_canvas, outputType, 0.8),
});

export default imageBlobReduce;