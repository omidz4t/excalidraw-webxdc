export type Point = [number, number, number];

export type SizeMappingDetails = {
  pressure: number;
  runningLength: number;
  currentIndex: number;
  totalLength: number;
};

export type LaserPointerOptions = {
  size: number;
  streamline: number;
  simplify: number;
  simplifyPhase: "tail" | "output" | "input";
  keepHead: boolean;
  sizeMapping: (details: SizeMappingDetails) => number;
};

export class LaserPointer {
  static defaults: LaserPointerOptions = {
    size: 2,
    streamline: 0.45,
    simplify: 0.1,
    simplifyPhase: "output",
    keepHead: false,
    sizeMapping: () => 1,
  };

  originalPoints: Point[] = [];

  constructor(_options?: Partial<LaserPointerOptions>) {}

  addPoint(_x: number, _y: number, _pressure: number) {}
  end() {}
  getStrokeOutline() {
    return [];
  }
}