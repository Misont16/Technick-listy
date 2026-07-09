import Papa from "papaparse";
import type { ImportedRow } from "@/lib/product-import";
import { mapHeaderToField, NUMERIC_FIELDS, parseNumeric } from "@/lib/import-field-aliases";

export function parseProductsCsv(csvText: string): {
  rows: ImportedRow[];
  skipped: number;
} {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const sourceHeaders = parsed.meta.fields ?? [];
  const headerMap = new Map<string, string | undefined>(
    sourceHeaders.map((h) => [h, mapHeaderToField(h)]),
  );

  const rows: ImportedRow[] = [];
  let skipped = 0;

  for (const record of parsed.data) {
    const mapped: Record<string, string> = {};
    const customFields: { label: string; value: string }[] = [];

    for (const sourceHeader of sourceHeaders) {
      const value = record[sourceHeader];
      if (value === undefined || value === "") continue;

      const field = headerMap.get(sourceHeader);
      if (field) {
        mapped[field] = value;
      } else {
        customFields.push({ label: sourceHeader.trim(), value: value.trim() });
      }
    }

    if (!mapped.sku || !mapped.name) {
      skipped += 1;
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
