export type SpreadsheetSeries = {
  title: string;
  values: number[];
};

export type Spreadsheet = {
  title?: string;
  labels: string[];
  series: SpreadsheetSeries[];
};

export type ChartElements = readonly unknown[];

export type ParseSpreadsheetResult =
  | { ok: true; data: Spreadsheet }
  | { ok: false; reason: string };

export const tryParseSpreadsheet = (): ParseSpreadsheetResult => ({
  ok: false,
  reason: "disabled",
});

export const tryParseCells = () => null;
export const tryParseNumber = () => null;
export const isSpreadsheetValidForChartType = () => false;
export const renderSpreadsheet = () => null;