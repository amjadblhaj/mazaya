import * as XLSX from "xlsx";

export interface ParsedRow {
  /** 1-indexed spreadsheet row number, for user-facing error messages. */
  row: number;
  phone: string;
  points: number;
  reason: string;
}

export interface ParseError {
  row: number;
  error: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: ParseError[];
}

const MAX_ROWS = 5000;

/**
 * F7 — column format is A=Phone, B=Points, C=Reason. If row 1's Points
 * column isn't a finite number, it's treated as a header and skipped.
 *
 * Hardening against the unpatched xlsx prototype-pollution/ReDoS advisory
 * (no fix on npm as of writing): parsing is limited to cell values only —
 * formulas, HTML, and styles are all disabled, which is where those bugs
 * live. This narrows but does not eliminate the exposure, so this stays a
 * staff-only, tenant-scoped, size-capped upload — never a public endpoint.
 */
export function parseExcelBuffer(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellFormula: false,
    cellHTML: false,
    cellStyles: false,
    sheetStubs: false,
    bookVBA: false,
  });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], errors: [{ row: 0, error: "الملف لا يحتوي على أي ورقة عمل" }] };

  const sheet = workbook.Sheets[sheetName];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, blankrows: false });

  if (raw.length === 0) {
    return { rows: [], errors: [{ row: 0, error: "الملف فارغ" }] };
  }

  // Header detection: if row 1's Points column doesn't parse as a number,
  // assume row 1 is a header (e.g. "الهاتف / النقاط / السبب") and skip it.
  const firstPoints = Number((raw[0] as unknown[])?.[1]);
  const startIndex = Number.isFinite(firstPoints) ? 0 : 1;

  const limited = raw.slice(startIndex, startIndex + MAX_ROWS);
  const rows: ParsedRow[] = [];
  const errors: ParseError[] = [];

  limited.forEach((cols, i) => {
    const spreadsheetRow = startIndex + i + 1;
    const c = cols as unknown[];
    const phone = String(c[0] ?? "").trim();
    const points = Number(c[1]);
    const reason = String(c[2] ?? "").trim();

    if (!phone) {
      errors.push({ row: spreadsheetRow, error: "رقم الهاتف مفقود" });
      return;
    }
    if (!Number.isFinite(points) || !Number.isInteger(points) || points === 0) {
      errors.push({ row: spreadsheetRow, error: "عدد النقاط غير صحيح" });
      return;
    }
    if (!reason) {
      errors.push({ row: spreadsheetRow, error: "السبب مفقود" });
      return;
    }

    rows.push({ row: spreadsheetRow, phone, points, reason });
  });

  if (raw.length > startIndex + MAX_ROWS) {
    errors.push({ row: 0, error: `تم تجاهل الصفوف بعد الحد الأقصى (${MAX_ROWS} صف)` });
  }

  return { rows, errors };
}
