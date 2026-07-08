import Papa from "papaparse";
import type { ImportedRow } from "@/lib/product-import";

// Aliasy hlaviček sloupců (ceske i anglicke nazvy, ruzne exporty eshopu)
const FIELD_ALIASES: Record<string, string[]> = {
  sku: ["sku", "kod", "kód", "code", "product code", "katalogove cislo", "katalogové číslo"],
  name: ["name", "nazev", "název", "product name", "title"],
  category: ["category", "kategorie"],
  description: ["description", "popis", "dlouhy popis", "dlouhý popis"],
  price: ["price", "cena", "cena s dph", "cena bez dph"],
  imageUrl: ["image", "imageurl", "obrazek", "obrázek", "foto", "image url", "hlavni obrazek", "hlavní obrázek"],
  sourceUrl: ["url", "link", "odkaz", "product url", "produktova stranka", "produktová stránka"],
  material: ["material", "materiál"],
  weightG: ["weight", "hmotnost", "hmotnost (g)", "weight (g)"],
  lengthMm: ["length", "delka", "délka", "delka (mm)", "délka (mm)"],
  widthMm: ["width", "sirka", "šířka", "sirka (mm)", "šířka (mm)"],
  heightMm: ["height", "vyska", "výška", "vyska (mm)", "výška (mm)"],
  volumeMl: ["volume", "objem", "objem (ml)"],
  color: ["color", "barva"],
  countryOfOrigin: ["country", "zeme puvodu", "země původu", "country of origin"],
};

const NUMERIC_FIELDS = new Set([
  "price",
  "weightG",
  "lengthMm",
  "widthMm",
  "heightMm",
  "volumeMl",
]);

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

export function parseProductsCsv(csvText: string): {
  rows: ImportedRow[];
  skipped: number;
} {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const headerMap = new Map<string, string>(); // normalized source header -> field name
  const sourceHeaders = parsed.meta.fields ?? [];
  for (const sourceHeader of sourceHeaders) {
    const normalized = normalizeHeader(sourceHeader);
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(normalized)) {
        headerMap.set(sourceHeader, field);
        break;
      }
    }
  }

  const rows: ImportedRow[] = [];
  let skipped = 0;

  for (const record of parsed.data) {
    const mapped: Record<string, string> = {};
    for (const [sourceHeader, field] of headerMap.entries()) {
      const value = record[sourceHeader];
      if (value !== undefined && value !== "") mapped[field] = value;
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
        const num = Number(raw.replace(",", ".").replace(/[^\d.-]/g, ""));
        if (!Number.isNaN(num)) (row as Record<string, unknown>)[field] = num;
      } else {
        (row as Record<string, unknown>)[field] = raw;
      }
    }

    rows.push(row);
  }

  return { rows, skipped };
}
