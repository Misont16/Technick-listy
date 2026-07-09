import ExcelJS from "exceljs";
import type { ImportedRow } from "@/lib/product-import";
import { mapHeaderToField, NUMERIC_FIELDS, parseNumeric } from "@/lib/import-field-aliases";

function cellToText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if ("richText" in value) {
      return value.richText.map((r) => r.text).join("");
    }
    if ("text" in value) return String(value.text);
    if ("result" in value) return String(value.result ?? "");
    if (value instanceof Date) return value.toLocaleDateString("cs-CZ");
    return "";
  }
  return String(value).trim();
}

export async function parseProductsXlsx(buffer: Buffer): Promise<{
  rows: ImportedRow[];
  skipped: number;
}> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = workbook.worksheets[0];

  const rows: ImportedRow[] = [];
  let skipped = 0;
  if (!sheet) return { rows, skipped };

  const headerRow = sheet.getRow(1);
  const columns: { index: number; header: string; field?: string }[] = [];
  headerRow.eachCell((cell, colNumber) => {
    const header = cellToText(cell.value);
    if (!header) return;
    columns.push({ index: colNumber, header, field: mapHeaderToField(header) });
  });

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const excelRow = sheet.getRow(rowNumber);
    if (excelRow.cellCount === 0) continue;

    const mapped: Record<string, string> = {};
    const customFields: { label: string; value: string }[] = [];

    for (const column of columns) {
      const text = cellToText(excelRow.getCell(column.index).value);
      if (!text) continue;

      if (column.field) {
        mapped[column.field] = text;
      } else {
        customFields.push({ label: column.header, value: text });
      }
    }

    if (!mapped.sku || !mapped.name) {
      if (Object.keys(mapped).length > 0 || customFields.length > 0) skipped += 1;
      continue;
    }

    const row: ImportedRow = { sku: mapped.sku, name: mapped.name };
    for (const field of Object.keys(mapped)) {
      if (field === "sku" || field === "name") continue;
      const raw = mapped[field];
      if (NUMERIC_FIELDS.has(field)) {
        const num = parseNumeric(raw);
        if (num !== undefined) (row as Record<string, unknown>)[field] = num;
      } else {
        (row as Record<string, unknown>)[field] = raw;
      }
    }
    if (customFields.length > 0) row.customFields = customFields;

    rows.push(row);
  }

  return { rows, skipped };
}
